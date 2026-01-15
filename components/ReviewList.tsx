'use client'

import { useState, useMemo } from 'react'
import { ReviewItem } from './ReviewItem'
import { User } from '@supabase/supabase-js'
import { ChevronDown, Clock, ThumbsUp } from 'lucide-react'

type SortOption = 'recent' | 'most_helpful'

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

interface UserVote {
  review_id: string
  is_helpful: boolean
}

interface ReviewResponse {
  review_id: string
  response: string
  created_at: string
  profiles: {
    name: string
    photo: string | null
  } | null
}

interface ReviewListProps {
  reviews: Review[]
  user: User | null
  userVotes: UserVote[] | null
  responses: ReviewResponse[] | null
  isBusinessOwner: boolean
  businessId: string
  BusinessResponseForm?: React.ComponentType<{
    reviewId: string
    businessId: string
    user: User | null
    isBusinessOwner: boolean
    existingResponse: { id: string; response: string } | null
  }>
}

export function ReviewList({
  reviews,
  user,
  userVotes,
  responses,
  isBusinessOwner,
  businessId,
  BusinessResponseForm,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Create maps for quick lookup
  const userVotesMap = useMemo(
    () => new Map(userVotes?.map(v => [v.review_id, { is_helpful: v.is_helpful }]) || []),
    [userVotes]
  )

  const responsesMap = useMemo(
    () => new Map(responses?.map(r => [r.review_id, r]) || []),
    [responses]
  )

  // Filter out current user's reviews and sort
  const filteredAndSortedReviews = useMemo(() => {
    const filtered = reviews.filter(review => review.user_id !== user?.id && review.created_at)

    return [...filtered].sort((a, b) => {
      if (sortBy === 'most_helpful') {
        // Sort by helpful_count descending, then by date as tiebreaker
        const helpfulDiff = (b.helpful_count || 0) - (a.helpful_count || 0)
        if (helpfulDiff !== 0) return helpfulDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      // Default: sort by date descending (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [reviews, user?.id, sortBy])

  if (filteredAndSortedReviews.length === 0) {
    return null
  }

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'recent', label: 'Most Recent', icon: <Clock className="w-4 h-4" /> },
    { value: 'most_helpful', label: 'Most Helpful', icon: <ThumbsUp className="w-4 h-4" /> },
  ]

  const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0]

  return (
    <div className="space-y-6">
      {/* Header with sort dropdown */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
        <h3 className="text-lg font-semibold text-[hsl(var(--jungle-800))]">
          Customer Reviews
        </h3>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[hsl(var(--jungle-700))] bg-[hsl(var(--jungle-50))] hover:bg-[hsl(var(--jungle-100))] rounded-lg transition-colors"
          >
            {currentSort.icon}
            <span>{currentSort.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 py-1 bg-white border border-[hsl(var(--border))] rounded-xl shadow-lg z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setIsDropdownOpen(false)
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                      sortBy === option.value
                        ? 'bg-[hsl(var(--jungle-50))] text-[hsl(var(--jungle-700))] font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews list */}
      {filteredAndSortedReviews.map((review) => (
        <div key={review.id} className="group">
          <ReviewItem
            review={{
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              created_at: review.created_at!,
              helpful_count: review.helpful_count ?? 0,
              not_helpful_count: review.not_helpful_count ?? 0,
              profiles: review.profiles ? {
                name: review.profiles.name ?? 'Anonymous',
                photo: review.profiles.photo,
                review_count: review.profiles.review_count
              } : null
            }}
            user={user}
            userVote={userVotesMap.get(review.id)}
            businessResponse={(() => {
              const resp = responsesMap.get(review.id)
              if (!resp || !resp.created_at) return null
              return {
                response: resp.response,
                created_at: resp.created_at,
                profiles: resp.profiles ? {
                  name: resp.profiles.name ?? 'Business Owner',
                  photo: resp.profiles.photo
                } : null
              }
            })()}
          />
          {/* Business Response Form (only for business owner) */}
          {isBusinessOwner && BusinessResponseForm && (
            <div className="mt-3 ml-12">
              <BusinessResponseForm
                reviewId={review.id}
                businessId={businessId}
                user={user}
                isBusinessOwner={isBusinessOwner}
                existingResponse={responsesMap.get(review.id) ? {
                  id: responsesMap.get(review.id)!.review_id,
                  response: responsesMap.get(review.id)!.response
                } : null}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
