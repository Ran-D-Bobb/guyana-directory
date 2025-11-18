'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Star, StarOff, Trash2 } from 'lucide-react'

interface AdminTourismActionsProps {
  experienceId: string
  isApproved: boolean
  isFeatured: boolean
}

export function AdminTourismActions({
  experienceId,
  isApproved,
  isFeatured,
}: AdminTourismActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleApproved = async () => {
    setLoading(true)
    try {
      console.log('Toggling approval for experience:', experienceId, 'from', isApproved, 'to', !isApproved)

      const { data, error } = await supabase
        .from('tourism_experiences')
        .update({ is_approved: !isApproved })
        .eq('id', experienceId)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Update successful:', data)
      router.refresh()
    } catch (error) {
      console.error('Error toggling approval status:', error)
      alert(`Failed to update approval status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tourism_experiences')
        .update({ is_featured: !isFeatured })
        .eq('id', experienceId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update featured status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tourism experience? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tourism_experiences')
        .delete()
        .eq('id', experienceId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting tourism experience:', error)
      alert('Failed to delete tourism experience')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggleApproved}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
          isApproved
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        } disabled:opacity-50`}
      >
        {isApproved ? (
          <>
            <XCircle size={16} />
            Unapprove
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Approve
          </>
        )}
      </button>

      <button
        onClick={handleToggleFeatured}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
          isFeatured
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
      >
        {isFeatured ? (
          <>
            <StarOff size={16} />
            Unfeature
          </>
        ) : (
          <>
            <Star size={16} />
            Feature
          </>
        )}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  )
}
