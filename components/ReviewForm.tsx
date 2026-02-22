'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, Edit2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { getAuthRedirectUrl } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const supabase = createClient()
  const router = useRouter()

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
          router.refresh()
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
          router.refresh()
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
        router.refresh()
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
      <div className="bg-[hsl(var(--jungle-50))] rounded-lg p-6 text-center">
        <p className="text-[hsl(var(--jungle-700))] mb-4">Sign in to leave a review</p>
        <button
          onClick={handleSignIn}
          className="px-6 py-2 bg-[hsl(var(--jungle-500))] text-white rounded-lg hover:bg-[hsl(var(--jungle-600))] transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    )
  }

  if (existingReview && !isEditing) {
    return (
      <>
        <div className="bg-[hsl(var(--jungle-50))] rounded-lg p-6 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[hsl(var(--jungle-900))] font-semibold">Your Review</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[hsl(var(--jungle-500))] text-white rounded-lg hover:bg-[hsl(var(--jungle-600))] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
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
                    : 'text-[hsl(var(--border))]'
                }`}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-[hsl(var(--jungle-700))]">{existingReview.comment}</p>
          )}
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your review?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your review will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-lg p-6 text-center">
        <p className="text-emerald-700 font-medium">
          {existingReview ? 'Review updated successfully!' : 'Thank you for your review!'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[hsl(var(--jungle-50))] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--jungle-900))]">
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
            className="text-sm text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-900))]"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[hsl(var(--jungle-700))] mb-2">
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
                    : 'text-[hsl(var(--border))]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-[hsl(var(--jungle-700))] mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your experience with ${businessName}...`}
          rows={4}
          className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--jungle-500))] focus:border-[hsl(var(--jungle-500))] text-[hsl(var(--jungle-900))] placeholder:text-[hsl(var(--muted-foreground))]"
          maxLength={500}
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{comment.length}/500 characters</p>
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
        className="w-full px-6 py-3 bg-[hsl(var(--jungle-500))] text-white rounded-lg hover:bg-[hsl(var(--jungle-600))] disabled:bg-[hsl(var(--border))] disabled:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? (existingReview ? 'Updating...' : 'Submitting...') : (existingReview ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  )
}
