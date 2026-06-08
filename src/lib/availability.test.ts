import { describe, it, expect } from "vitest"
import { rangesOverlap, getUnavailableDates } from "./availability"

describe("rangesOverlap", () => {
  it("detects clear overlap", () => {
    expect(
      rangesOverlap(
        { startDate: "2026-06-10", endDate: "2026-06-15" },
        { startDate: "2026-06-12", endDate: "2026-06-20" },
      ),
    ).toBe(true)
  })

  it("treats touching endpoints as overlap (inclusive)", () => {
    expect(
      rangesOverlap(
        { startDate: "2026-06-10", endDate: "2026-06-12" },
        { startDate: "2026-06-12", endDate: "2026-06-14" },
      ),
    ).toBe(true)
  })

  it("returns false for disjoint ranges", () => {
    expect(
      rangesOverlap(
        { startDate: "2026-06-10", endDate: "2026-06-11" },
        { startDate: "2026-06-13", endDate: "2026-06-14" },
      ),
    ).toBe(false)
  })
})

describe("getUnavailableDates", () => {
  it("expands a booking into inclusive calendar days", () => {
    const dates = getUnavailableDates([
      { startDate: "2026-06-10", endDate: "2026-06-12" },
    ])
    expect(dates).toEqual(["2026-06-10", "2026-06-11", "2026-06-12"])
  })

  it("handles multiple bookings", () => {
    const dates = getUnavailableDates([
      { startDate: "2026-06-10", endDate: "2026-06-10" },
      { startDate: "2026-06-20", endDate: "2026-06-21" },
    ])
    expect(dates).toEqual(["2026-06-10", "2026-06-20", "2026-06-21"])
  })
})
