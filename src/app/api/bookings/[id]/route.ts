import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiError, apiErrorResponse, requireUser } from "@/lib/session"
import { sendEmail, bookingStatusEmail } from "@/lib/email"
import { BookingStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

type BookingAction = "cancel" | "confirm" | "reject"

/** GET /api/bookings/[id] — owner (host) or guest only. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser()
    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      include: { space: true, user: true },
    })

    if (!booking) {
      throw new ApiError(404, "Booking not found")
    }

    const isGuest = booking.userId === user.id
    const isHost = booking.space.ownerId === user.id
    if (!isGuest && !isHost) {
      throw new ApiError(403, "You do not have permission to view this booking")
    }

    return NextResponse.json(booking)
  } catch (error) {
    return apiErrorResponse(error)
  }
}

/**
 * PATCH /api/bookings/[id] — body { action: "cancel" | "confirm" | "reject" }.
 *
 * Authorization:
 *  - cancel: guest OR host
 *  - confirm / reject: host only
 *
 * Valid transitions:
 *  - confirm: PENDING -> CONFIRMED
 *  - reject:  PENDING -> CANCELLED
 *  - cancel:  PENDING | CONFIRMED -> CANCELLED
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser()
    const { id } = await params

    let body: { action?: string }
    try {
      body = await req.json()
    } catch {
      throw new ApiError(400, "Invalid request body")
    }

    const action = body.action as BookingAction | undefined
    if (!action || !["cancel", "confirm", "reject"].includes(action)) {
      throw new ApiError(400, "Invalid action")
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { space: true, user: true },
    })

    if (!booking) {
      throw new ApiError(404, "Booking not found")
    }

    const isGuest = booking.userId === user.id
    const isHost = booking.space.ownerId === user.id

    // Authorization per action.
    if (action === "cancel") {
      if (!isGuest && !isHost) {
        throw new ApiError(403, "You do not have permission to cancel this booking")
      }
    } else {
      // confirm / reject — host only.
      if (!isHost) {
        throw new ApiError(403, "Only the host can perform this action")
      }
    }

    // Enforce valid status transitions.
    let nextStatus: BookingStatus
    if (action === "confirm") {
      if (booking.status !== "PENDING") {
        throw new ApiError(409, "Only pending bookings can be confirmed")
      }
      nextStatus = "CONFIRMED"
    } else if (action === "reject") {
      if (booking.status !== "PENDING") {
        throw new ApiError(409, "Only pending bookings can be rejected")
      }
      nextStatus = "CANCELLED"
    } else {
      // cancel
      if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
        throw new ApiError(409, "This booking can no longer be cancelled")
      }
      nextStatus = "CANCELLED"
    }

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: nextStatus },
      include: { space: true, user: true },
    })

    // Notify the guest of the new status (fallback-safe: no-op without RESEND_API_KEY).
    if (updated.user.email) {
      const { subject, html } = bookingStatusEmail({
        spaceTitle: updated.space.title,
        startDate: updated.startDate.toISOString().slice(0, 10),
        endDate: updated.endDate.toISOString().slice(0, 10),
        totalPrice: updated.totalPrice,
        guestName: updated.user.name,
        status: updated.status,
      })
      try {
        await sendEmail({ to: updated.user.email, subject, html })
      } catch (emailError) {
        // Email failures must not break the lifecycle update.
        console.error("Failed to send booking status email:", emailError)
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
