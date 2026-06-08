import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { apiErrorResponse, requireUser } from "@/lib/session"
import type { Booking } from "@prisma/client"

export const dynamic = "force-dynamic"

/**
 * GET /api/bookings/mine
 *
 * Returns the current user's bookings split into:
 *  - asGuest: bookings they made (includes space)
 *  - asHost:  bookings on spaces they own (includes guest user + space)
 *
 * Any CONFIRMED booking whose endDate is in the past is reported (and persisted)
 * as COMPLETED.
 */
export async function GET() {
  try {
    const user = await requireUser()
    const now = new Date()

    const [asGuest, asHost] = await Promise.all([
      db.booking.findMany({
        where: { userId: user.id },
        include: { space: true },
        orderBy: { startDate: "desc" },
      }),
      db.booking.findMany({
        where: { space: { ownerId: user.id } },
        include: { space: true, user: true },
        orderBy: { startDate: "desc" },
      }),
    ])

    // Identify confirmed-but-elapsed bookings and persist the COMPLETED transition.
    const toComplete = new Set<string>()
    const collect = (b: Booking) => {
      if (b.status === "CONFIRMED" && b.endDate < now) {
        toComplete.add(b.id)
      }
    }
    asGuest.forEach(collect)
    asHost.forEach(collect)

    if (toComplete.size > 0) {
      try {
        await db.booking.updateMany({
          // Guard on CONFIRMED so a concurrent cancel between our read and this
          // write is not clobbered back to COMPLETED.
          where: { id: { in: Array.from(toComplete) }, status: "CONFIRMED" },
          data: { status: "COMPLETED" },
        })
      } catch (persistError) {
        // Persisting is best-effort; the response is corrected regardless.
        console.error("Failed to persist COMPLETED transition:", persistError)
      }
    }

    const reflectCompleted = <T extends Booking>(b: T): T =>
      toComplete.has(b.id) ? { ...b, status: "COMPLETED" } : b

    return NextResponse.json({
      asGuest: asGuest.map(reflectCompleted),
      asHost: asHost.map(reflectCompleted),
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
