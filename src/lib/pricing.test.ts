import { describe, it, expect } from "vitest"
import {
  calculateBookingPrice,
  getBookingDays,
  pricesMatch,
  SERVICE_FEE_RATE,
} from "./pricing"

describe("getBookingDays", () => {
  it("counts a single day inclusively", () => {
    expect(getBookingDays("2026-06-10", "2026-06-10")).toBe(1)
  })

  it("counts multi-day ranges inclusively", () => {
    expect(getBookingDays("2026-06-10", "2026-06-12")).toBe(3)
  })

  it("never returns less than 1", () => {
    expect(getBookingDays("2026-06-12", "2026-06-10")).toBe(1)
  })
})

describe("calculateBookingPrice", () => {
  it("computes a single-day price with service fee and no discount", () => {
    const result = calculateBookingPrice({ pricePerDay: 100 }, "2026-06-10", "2026-06-10")
    expect(result.days).toBe(1)
    expect(result.subtotal).toBe(100)
    expect(result.discount).toBe(0)
    expect(result.serviceFee).toBe(10)
    expect(result.total).toBe(110)
  })

  it("applies the long-stay discount for 3+ days", () => {
    const result = calculateBookingPrice({ pricePerDay: 100 }, "2026-06-10", "2026-06-12")
    expect(result.days).toBe(3)
    expect(result.subtotal).toBe(300)
    expect(result.discount).toBe(30) // 10% off
    expect(result.serviceFee).toBe(27) // 10% of 270
    expect(result.total).toBe(297)
  })

  it("uses the configured service fee rate", () => {
    const result = calculateBookingPrice({ pricePerDay: 50 }, "2026-06-10", "2026-06-10")
    expect(result.serviceFee).toBeCloseTo(50 * SERVICE_FEE_RATE, 2)
  })

  it("handles a zero/invalid price safely", () => {
    const result = calculateBookingPrice({ pricePerDay: NaN }, "2026-06-10", "2026-06-10")
    expect(result.total).toBe(0)
  })
})

describe("pricesMatch", () => {
  it("accepts tiny rounding differences", () => {
    expect(pricesMatch(110.001, 110)).toBe(true)
  })
  it("rejects real discrepancies", () => {
    expect(pricesMatch(1, 110)).toBe(false)
  })
})
