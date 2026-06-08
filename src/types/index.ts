import type { Prisma } from "@prisma/client"

/**
 * Shared DTOs and helpers for working with the Space JSON columns and user
 * profiles. Centralizing the JSON parsing here keeps `as any` out of routes.
 */

export interface Coordinates {
  lat: number
  lng: number
}

/** Safely parses a Space JSON column that may hold a stringified array. */
export function parseJsonArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string")
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : []
    } catch {
      return []
    }
  }
  return []
}

/** Safely parses a Space coordinates JSON column. */
export function parseCoordinates(
  value: Prisma.JsonValue | null | undefined,
): Coordinates | null {
  if (!value) return null
  let obj: unknown = value
  if (typeof value === "string") {
    try {
      obj = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (
    obj &&
    typeof obj === "object" &&
    "lat" in obj &&
    "lng" in obj &&
    typeof (obj as Coordinates).lat === "number" &&
    typeof (obj as Coordinates).lng === "number"
  ) {
    return { lat: (obj as Coordinates).lat, lng: (obj as Coordinates).lng }
  }
  return null
}

/** Public-facing summary of a user's professional profile. */
export interface ProfileSummary {
  id: string
  name: string | null
  image: string | null
  headline: string | null
  jobTitle: string | null
  companyName: string | null
  industry: string | null
  city: string | null
  skills: string[]
  interests: string[]
}
