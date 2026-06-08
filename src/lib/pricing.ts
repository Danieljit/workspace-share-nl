import { differenceInCalendarDays } from "date-fns"

/**
 * Authoritative, server-side booking price calculation.
 *
 * This is the single source of truth for what a booking costs. The client may
 * show an estimate, but the server MUST recompute with this function before
 * creating a booking or a Stripe PaymentIntent so a tampered client price can
 * never be charged.
 */

export const SERVICE_FEE_RATE = 0.1 // 10% platform service fee
export const LONG_STAY_MIN_DAYS = 3 // 3+ days qualifies for a discount
export const LONG_STAY_DISCOUNT_RATE = 0.1 // 10% off for long stays

export interface PriceableSpace {
  pricePerDay: number
  pricePerThreeDays?: number | null
  pricePerWeek?: number | null
  pricePerMonth?: number | null
}

export interface PriceBreakdown {
  days: number
  pricePerDay: number
  subtotal: number
  discount: number
  serviceFee: number
  total: number
}

/** Inclusive number of days between two dates (minimum 1). */
export function getBookingDays(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = differenceInCalendarDays(end, start) + 1
  return Math.max(1, days)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calculates the full price breakdown for a booking. Mirrors the estimate shown
 * in the booking UI (per-day rate, long-stay discount, service fee) but is the
 * authoritative value used for charging.
 */
export function calculateBookingPrice(
  space: PriceableSpace,
  startDate: Date | string,
  endDate: Date | string,
): PriceBreakdown {
  const days = getBookingDays(startDate, endDate)
  const pricePerDay = Number(space.pricePerDay) || 0

  const subtotal = round2(pricePerDay * days)
  const discount =
    days >= LONG_STAY_MIN_DAYS ? round2(subtotal * LONG_STAY_DISCOUNT_RATE) : 0
  const discountedSubtotal = round2(subtotal - discount)
  const serviceFee = round2(discountedSubtotal * SERVICE_FEE_RATE)
  const total = round2(discountedSubtotal + serviceFee)

  return { days, pricePerDay, subtotal, discount, serviceFee, total }
}

/**
 * Returns true when a client-supplied total is acceptably close to the
 * authoritative server total (tolerates floating-point rounding only).
 */
export function pricesMatch(clientTotal: number, serverTotal: number): boolean {
  return Math.abs(Number(clientTotal) - serverTotal) < 0.01
}
