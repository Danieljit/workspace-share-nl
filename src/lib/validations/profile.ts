import { z } from "zod"

/**
 * Validation schema for the editable fields of a user's professional profile.
 *
 * Every field is optional so the same schema can validate a partial PATCH
 * (a user editing only one section). String fields are trimmed; URL fields
 * accept an empty string (meaning "cleared"); array fields default to [].
 */

// A URL that may be left blank. Empty string is treated as "no value".
const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value),
    { message: "Must be a valid URL starting with http:// or https://" },
  )
  .optional()

// A trimmed optional string with a sane upper bound.
const optionalText = (max = 5000) => z.string().trim().max(max).optional()

// An array of non-empty trimmed strings (e.g. skills, interests).
const stringArray = z.array(z.string().trim().min(1).max(100)).max(50)

export const profileVisibilityEnum = z.enum(["PUBLIC", "PRIVATE"])
export const userTypeEnum = z.enum(["GUEST", "HOST", "BOTH"])

export const profileSchema = z.object({
  name: optionalText(120),
  headline: optionalText(160),
  bio: optionalText(5000),
  jobTitle: optionalText(120),
  companyName: optionalText(120),
  industry: optionalText(120),
  skills: stringArray.optional(),
  interests: stringArray.optional(),
  lookingFor: optionalText(2000),
  websiteUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  city: optionalText(120),
  languages: stringArray.optional(),
  preferredWorkdays: stringArray.optional(),
  profileVisibility: profileVisibilityEnum.optional(),
  userType: userTypeEnum.optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
