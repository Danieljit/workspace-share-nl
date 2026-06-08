"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ReviewUser {
  id: string
  name: string | null
  image: string | null
}

interface ReviewItem {
  id: string
  rating: number
  comment: string
  createdAt: string
  userId: string
  user: ReviewUser
}

interface ReviewsResponse {
  reviews: ReviewItem[]
  averageRating: number
  count: number
}

interface SpaceReviewsProps {
  spaceId: string
}

function Stars({ rating, size = "text-lg" }: { rating: number; size?: string }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            size,
            star <= rating ? "text-yellow-400" : "text-gray-300",
          )}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function SpaceReviews({ spaceId }: SpaceReviewsProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/spaces/${spaceId}/reviews`)
      if (!res.ok) {
        throw new Error("Failed to load reviews")
      }
      const data: ReviewsResponse = await res.json()
      setReviews(data.reviews)
      setAverageRating(data.averageRating)
      setCount(data.count)
    } catch (error) {
      console.error("Error loading reviews:", error)
      setLoadError("We couldn't load the reviews. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Whether the signed-in user already has a review for this space.
  const existingReview = user
    ? reviews.find((r) => r.userId === user.id)
    : undefined

  // Pre-fill the form when editing an existing review.
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.comment)
    }
  }, [existingReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating < 1 || rating > 5) {
      toast({
        title: "Select a rating",
        description: "Please choose between 1 and 5 stars.",
        variant: "destructive",
      })
      return
    }

    if (comment.trim().length === 0) {
      toast({
        title: "Add a comment",
        description: "Please write a short comment for your review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/spaces/${spaceId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to submit your review")
      }

      toast({
        title: existingReview ? "Review updated" : "Review submitted",
        description: "Thanks for sharing your feedback!",
      })

      if (!existingReview) {
        setRating(0)
        setComment("")
      }
      await fetchReviews()
    } catch (error) {
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Failed to submit your review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Aggregate summary */}
      <div className="flex items-center space-x-4">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="space-y-1">
          <Stars rating={Math.round(averageRating)} />
          <div className="text-sm text-gray-500">
            {count} {count === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>

      {/* Review form / eligibility messaging */}
      {!isAuthLoading && (
        <ReviewFormSection
          isAuthenticated={isAuthenticated}
          isSubmitting={isSubmitting}
          rating={rating}
          hoverRating={hoverRating}
          comment={comment}
          isEditing={!!existingReview}
          onRate={setRating}
          onHover={setHoverRating}
          onComment={setComment}
          onSubmit={handleSubmit}
        />
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading reviews…</p>
        ) : loadError ? (
          <p className="text-sm text-red-500">{loadError}</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {review.user.name || "Anonymous"}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <Stars rating={review.rating} size="text-sm" />
              <p className="text-gray-500">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface ReviewFormSectionProps {
  isAuthenticated: boolean
  isSubmitting: boolean
  rating: number
  hoverRating: number
  comment: string
  isEditing: boolean
  onRate: (rating: number) => void
  onHover: (rating: number) => void
  onComment: (comment: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function ReviewFormSection({
  isAuthenticated,
  isSubmitting,
  rating,
  hoverRating,
  comment,
  isEditing,
  onRate,
  onHover,
  onComment,
  onSubmit,
}: ReviewFormSectionProps) {
  if (!isAuthenticated) {
    return (
      <p className="rounded-md border bg-gray-50 p-4 text-sm text-gray-500">
        Sign in and book this space to leave a review.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border p-4">
      <h3 className="text-sm font-semibold">
        {isEditing ? "Update your review" : "Write a review"}
      </h3>
      <p className="text-xs text-gray-500">
        Only guests with a confirmed or completed booking can leave a review.
      </p>

      <div className="flex" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className={cn(
              "text-2xl transition-colors",
              star <= (hoverRating || rating)
                ? "text-yellow-400"
                : "text-gray-300",
            )}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
          >
            ★
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => onComment(e.target.value)}
        placeholder="Share your experience with this space…"
        rows={3}
        disabled={isSubmitting}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Submitting…"
          : isEditing
            ? "Update review"
            : "Submit review"}
      </Button>
    </form>
  )
}
