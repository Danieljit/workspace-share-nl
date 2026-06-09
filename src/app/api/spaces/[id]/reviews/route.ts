import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiError, apiErrorResponse, requireUser } from "@/lib/session"

export const dynamic = "force-dynamic"

/**
 * GET /api/spaces/[id]/reviews
 * Returns the space's reviews (newest first) with reviewer name + image,
 * plus an aggregate { averageRating, count }.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const spaceId = params.id

    const space = await db.space.findUnique({
      where: { id: spaceId },
      select: { id: true },
    })
    if (!space) {
      throw new ApiError(404, "Space not found")
    }

    const reviews = await db.review.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const count = reviews.length
    const averageRating =
      count > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0

    return NextResponse.json({
      reviews,
      averageRating,
      count,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

/**
 * POST /api/spaces/[id]/reviews
 * Body: { rating: 1..5, comment: string }
 *
 * Rules:
 *  - Must be signed in (401).
 *  - rating must be an integer 1..5 and comment must be non-empty (400).
 *  - The space owner may not review their own space (403).
 *  - The user must have a CONFIRMED or COMPLETED booking for this space (403).
 *  - A user may only have one review per space. Rather than rejecting a second
 *    review, we UPSERT/UPDATE the user's existing review (documented behaviour):
 *    posting again edits the previous review instead of creating a duplicate.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser()
    const spaceId = params.id

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      throw new ApiError(400, "Invalid request body")
    }

    const { rating, comment } = body as {
      rating?: unknown
      comment?: unknown
    }

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      throw new ApiError(400, "Rating must be a whole number between 1 and 5")
    }

    if (typeof comment !== "string" || comment.trim().length === 0) {
      throw new ApiError(400, "Comment cannot be empty")
    }

    const space = await db.space.findUnique({
      where: { id: spaceId },
      select: { id: true, ownerId: true },
    })
    if (!space) {
      throw new ApiError(404, "Space not found")
    }

    if (space.ownerId === user.id) {
      throw new ApiError(403, "You cannot review your own space")
    }

    // Eligibility: must have a confirmed or completed booking for this space.
    const eligibleBooking = await db.booking.findFirst({
      where: {
        spaceId,
        userId: user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { id: true },
    })
    if (!eligibleBooking) {
      throw new ApiError(
        403,
        "You can only review a space you have booked",
      )
    }

    const trimmedComment = comment.trim()

    // Upsert-update: one review per user per space. A second submission edits
    // the existing review rather than creating a duplicate.
    const existing = await db.review.findFirst({
      where: { spaceId, userId: user.id },
      select: { id: true },
    })

    const review = existing
      ? await db.review.update({
          where: { id: existing.id },
          data: { rating, comment: trimmedComment },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            userId: true,
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        })
      : await db.review.create({
          data: {
            rating,
            comment: trimmedComment,
            spaceId,
            userId: user.id,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            userId: true,
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        })

    return NextResponse.json(review, { status: existing ? 200 : 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
