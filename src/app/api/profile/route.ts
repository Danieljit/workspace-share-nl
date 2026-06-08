import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, apiErrorResponse, ApiError } from "@/lib/session"
import { profileSchema } from "@/lib/validations/profile"

export const dynamic = "force-dynamic"

// Fields returned to the client — explicitly excludes hashedPassword.
const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  headline: true,
  bio: true,
  jobTitle: true,
  companyName: true,
  industry: true,
  skills: true,
  interests: true,
  lookingFor: true,
  websiteUrl: true,
  linkedinUrl: true,
  city: true,
  languages: true,
  preferredWorkdays: true,
  profileVisibility: true,
  userType: true,
} as const

/** GET /api/profile → the current user's full profile (no hashedPassword). */
export async function GET() {
  try {
    const user = await requireUser()
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: profileSelect,
    })
    if (!profile) {
      throw new ApiError(404, "Profile not found")
    }
    return NextResponse.json(profile)
  } catch (error) {
    return apiErrorResponse(error)
  }
}

/** PATCH /api/profile → validate and update only the allowed profile fields. */
export async function PATCH(req: Request) {
  try {
    const user = await requireUser()

    let body: unknown
    try {
      body = await req.json()
    } catch {
      throw new ApiError(400, "Invalid JSON body")
    }

    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid profile data")
    }

    // Only the validated, allow-listed fields reach Prisma. id/email/
    // hashedPassword/emailVerified are never part of the schema, so they
    // can't be updated through this route.
    const updated = await db.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: profileSelect,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
