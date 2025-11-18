'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface ReviewFormProps {
  businessId: string
  businessName: string
  user: User | null
  userHasReviewed?: boolean
  onReviewSubmitted?: () => void
}

export function ReviewForm({ businessId, businessName, user, userHasReviewed }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be signed in to submit a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Verify user session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session ? 'Active' : 'None')
      console.log('User ID:', user.id)

      const { data, error: submitError } = await supabase.from('reviews').insert({
        business_id: businessId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      }).select()

      console.log('Review submission result:', { data, error: submitError })

      if (submitError) {
        console.error('Review submission error:', submitError)
        if (submitError.code === '23505' || submitError.message?.includes('duplicate') || submitError.message?.includes('unique')) {
          setError('You have already reviewed this business')
        } else {
          setError(`Failed to submit review: ${submitError.message || 'Please try again.'}`)
        }
      } else {
        setSuccess(true)
        setRating(0)
        setComment('')

        // Refresh the page after a short delay to show the new review
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">Sign in to leave a review</p>
        <button
          onClick={handleSignIn}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    )
  }

  if (userHasReviewed) {
    return (
      <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
        <p className="text-blue-700 font-medium">
          You&apos;ve already reviewed this business. Thank you for your feedback!
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-lg p-6 text-center">
        <p className="text-emerald-700 font-medium">
          Thank you for your review! The page will refresh shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your experience with ${businessName}...`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">{comment.length}/500 characters</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
