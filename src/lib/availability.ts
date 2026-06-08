import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"

/**
 * Shared availability / double-booking logic. Used by the bookings, payments,
 * and availability endpoints so overlap rules stay consistent everywhere.
 */

// Bookings in these states occupy the calendar.
export const BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
]

export interface DateRange {
  startDate: Date | string
  endDate: Date | string
}

/** Two inclusive date ranges overlap if each starts on/before the other ends. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  const aStart = new Date(a.startDate)
  const aEnd = new Date(a.endDate)
  const bStart = new Date(b.startDate)
  const bEnd = new Date(b.endDate)
  return aStart <= bEnd && aEnd >= bStart
}

/** Expands bookings into a list of occupied calendar days (YYYY-MM-DD). */
export function getUnavailableDates(bookings: DateRange[]): string[] {
  const dates: string[] = []
  for (const booking of bookings) {
    const current = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0])
      current.setDate(current.getDate() + 1)
    }
  }
  return dates
}

/**
 * Finds bookings that block the requested range for a space. Optionally excludes
 * a specific booking id (e.g. when re-checking the booking being confirmed).
 */
export async function findOverlappingBookings(
  spaceId: string,
  startDate: Date | string,
  endDate: Date | string,
  excludeBookingId?: string,
) {
  return db.booking.findMany({
    where: {
      spaceId,
      status: { in: BLOCKING_STATUSES },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      // Inclusive overlap: existing.start <= requested.end AND existing.end >= requested.start
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
    },
  })
}

/** True when the requested range is free for booking. */
export async function isRangeAvailable(
  spaceId: string,
  startDate: Date | string,
  endDate: Date | string,
  excludeBookingId?: string,
): Promise<boolean> {
  const overlapping = await findOverlappingBookings(
    spaceId,
    startDate,
    endDate,
    excludeBookingId,
  )
  return overlapping.length === 0
}
