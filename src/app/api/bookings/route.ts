import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { requireUser, apiErrorResponse, ApiError } from "@/lib/session"
import { calculateBookingPrice } from "@/lib/pricing"
import { isRangeAvailable } from "@/lib/availability"

/**
 * Booking creation — step 1 of the single, idempotent booking+payment flow.
 *
 * Create-vs-intent split:
 *  - POST /api/bookings (here) creates exactly one PENDING booking with the
 *    authoritative, server-computed price. It holds the calendar slot.
 *  - POST /api/payments/create-intent then attaches a Stripe PaymentIntent to
 *    THAT booking (by id) and returns a clientSecret.
 *  - The Stripe webhook only flips the existing booking to CONFIRMED; it never
 *    creates bookings. This guarantees one CONFIRMED booking per payment.
 *
 * The client-supplied price is treated as a display estimate only and is never
 * trusted — the total is always recomputed from the space + dates here.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()

    const { spaceId, startDate, endDate } = await request.json()

    if (!spaceId || !startDate || !endDate) {
      throw new ApiError(400, "Missing required fields")
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid dates")
    }

    // Verify the space exists.
    const space = await db.space.findUnique({ where: { id: spaceId } })
    if (!space) {
      throw new ApiError(404, "Space not found")
    }

    // Idempotency: if this user already has a PENDING booking for the same space
    // and exact dates (e.g. an effect re-fire or a back/forward to the book URL),
    // return it instead of creating a duplicate that would then 409 against itself.
    const existing = await db.booking.findFirst({
      where: {
        userId: user.id,
        spaceId,
        status: "PENDING",
        startDate: start,
        endDate: end,
      },
    })
    if (existing) {
      return NextResponse.json(existing)
    }

    // Reject if the requested range is already taken (by anyone).
    if (!(await isRangeAvailable(spaceId, start, end))) {
      throw new ApiError(409, "Selected dates are not available")
    }

    // Authoritative server-side price — never trust the client.
    const breakdown = calculateBookingPrice(space, start, end)

    const booking = await db.booking.create({
      data: {
        startDate: start,
        endDate: end,
        totalPrice: breakdown.total,
        status: "PENDING",
        userId: user.id,
        spaceId,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
