'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Star, ThumbsUp, ThumbsDown, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReviewerBadge, getBadgeFromReviewCount } from '@/components/ReviewerBadge'

interface ReviewItemProps {
  review: {
    id: string
    rating: number
    comment: string | null
    created_at: string
    helpful_count: number
    not_helpful_count: number
    profiles: {
      name: string
      photo: string | null
      review_count?: number | null
    } | null
  }
  user: User | null
  userVote?: {
    is_helpful: boolean
  } | null
  businessResponse?: {
    response: string
    created_at: string
    profiles: {
      name: string
      photo: string | null
    } | null
  } | null
}

export function ReviewItem({ review, user, userVote, businessResponse }: ReviewItemProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.not_helpful_count || 0)
  const [currentVote, setCurrentVote] = useState<boolean | null>(userVote?.is_helpful ?? null)
  const [isVoting, setIsVoting] = useState(false)
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      setShowSignInDialog(true)
      return
    }

    setIsVoting(true)

    try {
      // If clicking the same vote, remove it
      if (currentVote === isHelpful) {
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', user.id)

        if (!error) {
          if (isHelpful) {
            setHelpfulCount(prev => prev - 1)
          } else {
            setNotHelpfulCount(prev => prev - 1)
          }
          setCurrentVote(null)
        }
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('review_helpful_votes')
          .upsert({
            review_id: review.id,
            user_id: user.id,
            is_helpful: isHelpful,
          }, {
            onConflict: 'review_id,user_id'
          })

        if (!error) {
          // Update counts based on previous vote
          if (currentVote === null) {
            // New vote
            if (isHelpful) {
              setHelpfulCount(prev => prev + 1)
            } else {
              setNotHelpfulCount(prev => prev + 1)
            }
          } else {
            // Changing vote
            if (isHelpful) {
              setHelpfulCount(prev => prev + 1)
              setNotHelpfulCount(prev => prev - 1)
            } else {
              setHelpfulCount(prev => prev - 1)
              setNotHelpfulCount(prev => prev + 1)
            }
          }
          setCurrentVote(isHelpful)
        }
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      {/* Review Header */}
      <div className="flex items-start gap-3 mb-3">
        {review.profiles?.photo ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={review.profiles.photo}
              alt={review.profiles.name || 'User'}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {review.profiles?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">
                {review.profiles?.name || 'Anonymous'}
              </p>
              <ReviewerBadge
                badge={getBadgeFromReviewCount(review.profiles?.review_count)}
                size="sm"
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-4 ml-15">{review.comment}</p>
      )}

      {/* Helpful Votes */}
      <div className="ml-15 space-y-2">
        {/* "X people found this helpful" text */}
        {helpfulCount > 0 && (
          <p className="text-sm text-[hsl(var(--jungle-600))]">
            {helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful
          </p>
        )}

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Was this helpful?</span>

          <button
            onClick={() => handleVote(true)}
            disabled={isVoting}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              currentVote === true
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{helpfulCount}</span>
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={isVoting}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              currentVote === false
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm font-medium">{notHelpfulCount}</span>
          </button>
        </div>
      </div>

      {/* Business Response */}
      {businessResponse && (
        <div className="mt-4 ml-15 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {businessResponse.profiles?.photo ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={businessResponse.profiles.photo}
                  alt={businessResponse.profiles.name || 'Business'}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                <span className="text-blue-700 font-medium text-sm">
                  {businessResponse.profiles?.name?.charAt(0) || 'B'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Response from {businessResponse.profiles?.name || 'Business Owner'}
              </p>
              <p className="text-xs text-blue-700">
                {formatDistanceToNow(new Date(businessResponse.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-800">{businessResponse.response}</p>
        </div>
      )}

      {/* Sign-in Dialog for anonymous users */}
      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
              Sign in to vote
            </DialogTitle>
            <DialogDescription>
              Create an account or sign in to vote on reviews and help others find useful feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => setShowSignInDialog(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
