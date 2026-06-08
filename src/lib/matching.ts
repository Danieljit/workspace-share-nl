/**
 * Lightweight, server-side discovery/matching helpers.
 *
 * These are pure functions (no DB / no React) so they can be unit-tested and
 * reused by the people directory and public profile pages to compute how much a
 * viewer has in common with another user.
 */

/** Normalizes a tag for case-insensitive comparison (trim + lowercase). */
function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

/**
 * Returns the case-insensitive intersection of two string arrays, preserving
 * the original casing from `a` and de-duplicating the result.
 */
export function sharedTags(a: string[], b: string[]): string[] {
  const bSet = new Set(b.map(normalizeTag))
  const seen = new Set<string>()
  const result: string[] = []
  for (const tag of a) {
    const key = normalizeTag(tag)
    if (key && bSet.has(key) && !seen.has(key)) {
      seen.add(key)
      result.push(tag)
    }
  }
  return result
}

export interface MatchProfile {
  skills: string[]
  interests: string[]
}

export interface MatchResult {
  sharedSkills: string[]
  sharedInterests: string[]
  /** Total count of shared skills + interests — a simple match score. */
  score: number
}

/**
 * Computes the shared skills/interests between a viewer and another profile.
 * Returns empty arrays and a zero score when there is no viewer (logged out)
 * or when the viewer is looking at themselves.
 */
export function computeMatch(
  viewer: MatchProfile | null | undefined,
  other: MatchProfile,
): MatchResult {
  if (!viewer) {
    return { sharedSkills: [], sharedInterests: [], score: 0 }
  }
  const sharedSkillsList = sharedTags(viewer.skills ?? [], other.skills ?? [])
  const sharedInterestsList = sharedTags(
    viewer.interests ?? [],
    other.interests ?? [],
  )
  return {
    sharedSkills: sharedSkillsList,
    sharedInterests: sharedInterestsList,
    score: sharedSkillsList.length + sharedInterestsList.length,
  }
}
