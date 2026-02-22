'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Trash2, Edit2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
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

interface BusinessResponseFormProps {
  reviewId: string
  businessId: string
  user: User | null
  isBusinessOwner: boolean
  existingResponse?: {
    id: string
    response: string
  } | null
}

export function BusinessResponseForm({
  reviewId,
  businessId,
  user,
  isBusinessOwner,
  existingResponse
}: BusinessResponseFormProps) {
  const [response, setResponse] = useState(existingResponse?.response || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(!existingResponse)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  if (!user || !isBusinessOwner) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!response.trim()) {
      setError('Please enter a response')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (existingResponse) {
        // Update existing response
        const { error: submitError } = await supabase
          .from('review_responses')
          .update({
            response: response.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingResponse.id)
          .eq('user_id', user.id)

        if (submitError) {
          setError(`Failed to update response: ${submitError.message}`)
        } else {
          setSuccess(true)
          setIsEditing(false)
          router.refresh()
        }
      } else {
        // Create new response
        const { error: submitError } = await supabase
          .from('review_responses')
          .insert({
            review_id: reviewId,
            business_id: businessId,
            user_id: user.id,
            response: response.trim(),
          })

        if (submitError) {
          setError(`Failed to submit response: ${submitError.message}`)
        } else {
          setSuccess(true)
          setResponse('')
          router.refresh()
        }
      }
    } catch (err) {
      console.error('Error submitting response:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingResponse) return

    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('review_responses')
        .delete()
        .eq('id', existingResponse.id)
        .eq('user_id', user.id)

      if (deleteError) {
        setError(`Failed to delete response: ${deleteError.message}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Error deleting response:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (existingResponse && !isEditing) {
    return (
      <>
        <div className="mt-3 ml-15">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-700))]"
            >
              <Edit2 className="w-3 h-3" />
              Edit Response
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your response?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove your response to this review.
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
      <div className="mt-3 ml-15 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p className="text-sm text-emerald-700 font-medium">
          {existingResponse ? 'Response updated!' : 'Response submitted!'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 ml-15 bg-[hsl(var(--jungle-50))] border border-[hsl(var(--border))] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--jungle-900))]">
          <MessageSquare className="w-4 h-4" />
          {existingResponse ? 'Edit Your Response' : 'Respond to this review'}
        </label>
        {isEditing && existingResponse && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setResponse(existingResponse.response)
            }}
            className="text-xs text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-900))]"
          >
            Cancel
          </button>
        )}
      </div>

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Thank the customer and address their feedback..."
        rows={3}
        className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--jungle-500))] focus:border-[hsl(var(--jungle-500))] text-sm"
        maxLength={500}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{response.length}/500 characters</p>

        <button
          type="submit"
          disabled={isSubmitting || !response.trim()}
          className="px-4 py-2 text-sm bg-[hsl(var(--jungle-500))] text-white rounded-lg hover:bg-[hsl(var(--jungle-600))] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (existingResponse ? 'Updating...' : 'Submitting...') : (existingResponse ? 'Update Response' : 'Submit Response')}
        </button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </form>
  )
}
