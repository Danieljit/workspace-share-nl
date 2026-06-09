import { describe, it, expect } from "vitest"
import { sharedTags, computeMatch } from "./matching"

describe("sharedTags", () => {
  it("returns the intersection preserving casing from the first array", () => {
    expect(sharedTags(["React", "TypeScript"], ["typescript", "node"])).toEqual([
      "TypeScript",
    ])
  })

  it("matches case-insensitively", () => {
    expect(sharedTags(["Design"], ["DESIGN"])).toEqual(["Design"])
  })

  it("de-duplicates repeated tags", () => {
    expect(sharedTags(["React", "react"], ["React"])).toEqual(["React"])
  })

  it("ignores blank/whitespace tags", () => {
    expect(sharedTags(["  ", "React"], ["react", "  "])).toEqual(["React"])
  })

  it("returns empty when there is no overlap", () => {
    expect(sharedTags(["a"], ["b"])).toEqual([])
  })

  it("handles empty inputs", () => {
    expect(sharedTags([], ["a"])).toEqual([])
    expect(sharedTags(["a"], [])).toEqual([])
  })
})

describe("computeMatch", () => {
  it("returns a zero score for a logged-out viewer", () => {
    const result = computeMatch(null, { skills: ["a"], interests: ["b"] })
    expect(result).toEqual({ sharedSkills: [], sharedInterests: [], score: 0 })
  })

  it("computes shared skills and interests with a combined score", () => {
    const result = computeMatch(
      { skills: ["React", "Go"], interests: ["Climbing", "AI"] },
      { skills: ["react", "Rust"], interests: ["ai"] },
    )
    expect(result.sharedSkills).toEqual(["React"])
    expect(result.sharedInterests).toEqual(["AI"])
    expect(result.score).toBe(2)
  })

  it("tolerates missing arrays on the other profile", () => {
    const result = computeMatch(
      { skills: ["React"], interests: [] },
      { skills: undefined as unknown as string[], interests: undefined as unknown as string[] },
    )
    expect(result.score).toBe(0)
  })
})
