'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Star, Trash2 } from 'lucide-react'

interface AdminEventActionsProps {
  eventId: string
  isFeatured: boolean
  eventType: 'general' | 'promotion'
}

export function AdminEventActions({ eventId, isFeatured, eventType }: AdminEventActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const tableName = eventType === 'general' ? 'events' : 'business_events'

  const toggleFeatured = async () => {
    setIsProcessing(true)
    const supabase = createClient()

    const { error } = await supabase
      .from(tableName)
      .update({ is_featured: !isFeatured })
      .eq('id', eventId)

    if (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update event. Please try again.')
    }

    setIsProcessing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    const supabase = createClient()

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
      setIsProcessing(false)
      setShowDeleteConfirm(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Only show feature button for general events */}
      {eventType === 'general' && (
        <button
          onClick={toggleFeatured}
          disabled={isProcessing}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isFeatured
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isFeatured ? 'Unfeature' : 'Feature'}
        >
          <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-500' : ''}`} />
        </button>
      )}

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isProcessing}
          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isProcessing}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
          >
            {isProcessing ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isProcessing}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
