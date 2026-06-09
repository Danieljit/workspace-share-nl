import { describe, it, expect } from "vitest"
import { profileSchema } from "./profile"

describe("profileSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = profileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a full valid profile", () => {
    const result = profileSchema.safeParse({
      name: "Ada Lovelace",
      headline: "Mathematician",
      bio: "I like numbers.",
      jobTitle: "Analyst",
      companyName: "Analytical Engine Co",
      industry: "Computing",
      skills: ["math", "logic"],
      interests: ["machines"],
      lookingFor: "A quiet desk",
      websiteUrl: "https://example.com",
      linkedinUrl: "",
      city: "London",
      languages: ["English"],
      preferredWorkdays: ["Monday"],
      profileVisibility: "PUBLIC",
      userType: "BOTH",
    })
    expect(result.success).toBe(true)
  })

  it("trims string fields", () => {
    const result = profileSchema.safeParse({ headline: "  hello  " })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.headline).toBe("hello")
  })

  it("allows empty string for URLs", () => {
    const result = profileSchema.safeParse({ websiteUrl: "", linkedinUrl: "" })
    expect(result.success).toBe(true)
  })

  it("rejects a malformed URL", () => {
    const result = profileSchema.safeParse({ websiteUrl: "not-a-url" })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid profileVisibility value", () => {
    const result = profileSchema.safeParse({ profileVisibility: "SECRET" })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid userType value", () => {
    const result = profileSchema.safeParse({ userType: "ADMIN" })
    expect(result.success).toBe(false)
  })

  it("rejects empty strings inside arrays", () => {
    const result = profileSchema.safeParse({ skills: ["valid", ""] })
    expect(result.success).toBe(false)
  })

  it("strips unknown fields like hashedPassword from parsed output", () => {
    const result = profileSchema.safeParse({ headline: "x", hashedPassword: "secret" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect("hashedPassword" in result.data).toBe(false)
    }
  })
})
