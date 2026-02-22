'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronDown } from 'lucide-react'
import { ReviewItem } from './ReviewItem'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  helpful_count: number
  not_helpful_count: number
  user_id: string
  profiles: {
    name: string
    photo: string | null
    review_count?: number | null
  } | null
}

interface LoadMoreReviewsProps {
  businessId: string
  initialCount: number
  totalCount: number
}

const PAGE_SIZE = 20

export function LoadMoreReviews({ businessId, initialCount, totalCount }: LoadMoreReviewsProps) {
  const [additionalReviews, setAdditionalReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const remaining = totalCount - initialCount - additionalReviews.length

  if (remaining <= 0 && additionalReviews.length === 0) return null

  const loadMore = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const currentOffset = initialCount + additionalReviews.length
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at, helpful_count, not_helpful_count, user_id,
        profiles:user_id (name, photo, review_count)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)

    if (!error && data) {
      setAdditionalReviews(prev => [...prev, ...data.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at || '',
        helpful_count: r.helpful_count ?? 0,
        not_helpful_count: r.not_helpful_count ?? 0,
        user_id: r.user_id,
        profiles: r.profiles ? {
          name: (r.profiles as { name: string }).name ?? 'Anonymous',
          photo: (r.profiles as { photo: string | null }).photo,
          review_count: (r.profiles as { review_count?: number | null }).review_count
        } : null
      }))])
    }

    setIsLoading(false)
  }

  const currentRemaining = totalCount - initialCount - additionalReviews.length

  return (
    <>
      {/* Render additional reviews */}
      {additionalReviews.map(review => (
        <div key={review.id} className="group">
          <ReviewItem
            review={{
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              created_at: review.created_at,
              helpful_count: review.helpful_count,
              not_helpful_count: review.not_helpful_count,
              profiles: review.profiles ? {
                name: review.profiles.name,
                photo: review.profiles.photo,
                review_count: review.profiles.review_count
              } : null
            }}
            user={null}
            userVote={undefined}
            businessResponse={null}
          />
        </div>
      ))}

      {/* Load more button */}
      {currentRemaining > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-[hsl(var(--jungle-700))] bg-[hsl(var(--jungle-50))] hover:bg-[hsl(var(--jungle-100))] rounded-xl border border-[hsl(var(--border))] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more reviews ({currentRemaining} remaining)
              </>
            )}
          </button>
        </div>
      )}
    </>
  )
}
