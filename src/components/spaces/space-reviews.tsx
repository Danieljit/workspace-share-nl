import { Review, User } from "@prisma/client"
import { format } from "date-fns"

interface SpaceReviewsProps {
  reviews: (Review & {
    user: User
  })[]
}

export function SpaceReviews({ reviews }: SpaceReviewsProps) {
  const averageRating = reviews.length
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="space-y-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= averageRating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">
                {review.user.name || review.user.email}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {format(new Date(review.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${
                    star <= review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-500">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
