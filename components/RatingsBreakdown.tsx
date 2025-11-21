'use client'

import { Star } from 'lucide-react'

interface Review {
  overall_rating: number
  cleanliness_rating?: number
  location_rating?: number
  value_rating?: number
  communication_rating?: number
}

interface RatingsBreakdownProps {
  reviews: Review[]
  ratingCounts?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  totalReviews?: number
  averageRating?: number
}

export function RatingsBreakdown({ reviews, ratingCounts: propRatingCounts, totalReviews: propTotalReviews, averageRating: propAverageRating }: RatingsBreakdownProps) {
  // Calculate from reviews if not provided
  const calculatedRatingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  if (reviews) {
    reviews.forEach((review) => {
      const rating = Math.floor(review.overall_rating)
      if (rating >= 1 && rating <= 5) {
        calculatedRatingCounts[rating as keyof typeof calculatedRatingCounts]++
      }
    })
  }

  const ratingCounts = propRatingCounts || calculatedRatingCounts
  const totalReviews = propTotalReviews ?? reviews.length
  const averageRating = propAverageRating ?? (reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
    : 0)

  if (totalReviews === 0) {
    return null
  }

  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Overall rating */}
        <div className="flex flex-col items-center justify-center md:w-1/3 pb-6 md:pb-0 md:border-r border-gray-200">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = averageRating
              const fullStars = Math.floor(rating)
              const hasHalfStar = star === fullStars + 1 && rating % 1 >= 0.25 && rating % 1 < 0.75
              const hasThreeQuarterStar = star === fullStars + 1 && rating % 1 >= 0.75

              if (star <= fullStars) {
                return <Star key={star} className="w-6 h-6 fill-amber-400 text-amber-400" />
              } else if (hasHalfStar) {
                return (
                  <div key={star} className="relative inline-block">
                    <Star className="w-6 h-6 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                )
              } else if (hasThreeQuarterStar) {
                return (
                  <div key={star} className="relative inline-block">
                    <Star className="w-6 h-6 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: '75%' }}>
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                )
              } else {
                return <Star key={star} className="w-6 h-6 text-gray-300" />
              }
            })}
          </div>
          <div className="text-sm text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Right side - Histogram */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating as keyof typeof ratingCounts]
            const percentage = getRatingPercentage(count)

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>

                {/* Progress bar */}
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-12 text-sm text-gray-600 text-right">
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
