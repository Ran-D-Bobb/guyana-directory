'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, Edit2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { getAuthRedirectUrl } from '@/lib/utils'

interface ReviewFormProps {
  businessId: string
  businessName: string
  user: User | null
  existingReview?: {
    id: string
    rating: number
    comment: string | null
  } | null
}

export function ReviewForm({ businessId, businessName, user, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  // Load existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.comment || '')
    }
  }, [existingReview])

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
      if (existingReview) {
        // Update existing review
        const { error: submitError } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)
          .eq('user_id', user.id)

        if (submitError) {
          setError(`Failed to update review: ${submitError.message || 'Please try again.'}`)
        } else {
          setSuccess(true)
          setIsEditing(false)
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        // Create new review
        const { error: submitError } = await supabase.from('reviews').insert({
          business_id: businessId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        }).select()

        if (submitError) {
          if (submitError.code === '23505' || submitError.message?.includes('duplicate') || submitError.message?.includes('unique')) {
            setError('You have already reviewed this business')
          } else {
            setError(`Failed to submit review: ${submitError.message || 'Please try again.'}`)
          }
        } else {
          setSuccess(true)
          setRating(0)
          setComment('')
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !existingReview) return

    if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', existingReview.id)
        .eq('user_id', user.id)

      if (deleteError) {
        setError(`Failed to delete review: ${deleteError.message}`)
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl('/auth/callback'),
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

  if (existingReview && !isEditing) {
    return (
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-blue-900 font-semibold">Your Review</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= existingReview.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        {existingReview.comment && (
          <p className="text-gray-700">{existingReview.comment}</p>
        )}
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-lg p-6 text-center">
        <p className="text-emerald-700 font-medium">
          {existingReview ? 'Review updated successfully!' : 'Thank you for your review!'} The page will refresh shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setRating(existingReview?.rating || 0)
              setComment(existingReview?.comment || '')
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
      </div>

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
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
        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? (existingReview ? 'Updating...' : 'Submitting...') : (existingReview ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  )
}
