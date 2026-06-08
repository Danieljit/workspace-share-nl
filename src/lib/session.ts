import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Server-side authentication & authorization helpers for API routes.
 *
 * Usage pattern:
 *   try {
 *     const user = await requireUser()
 *     await requireSpaceOwner(spaceId, user.id)
 *     ...
 *   } catch (error) {
 *     return apiErrorResponse(error)
 *   }
 */

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

/** Returns the logged-in user, or null if there is no session. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user as SessionUser
}

/** Returns the logged-in user, or throws a 401 ApiError. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    throw new ApiError(401, "You must be signed in to do that")
  }
  return user
}

/**
 * Ensures the given user owns the space. Throws 404 if the space is missing,
 * 403 if the user is not the owner. Returns the space on success.
 */
export async function requireSpaceOwner(spaceId: string, userId: string) {
  const space = await db.space.findUnique({ where: { id: spaceId } })
  if (!space) {
    throw new ApiError(404, "Space not found")
  }
  if (space.ownerId !== userId) {
    throw new ApiError(403, "You do not have permission to modify this space")
  }
  return space
}

/** Maps a thrown error to a JSON response (ApiError → its status, else 500). */
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("Unhandled API error:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  )
}
