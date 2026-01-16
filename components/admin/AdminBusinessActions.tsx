'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Star, StarOff, Trash2 } from 'lucide-react'
import { logAdminAction } from '@/lib/audit'

interface AdminBusinessActionsProps {
  businessId: string
  businessName: string
  isVerified: boolean
  isFeatured: boolean
}

export function AdminBusinessActions({
  businessId,
  businessName,
  isVerified,
  isFeatured,
}: AdminBusinessActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleVerified = async () => {
    setLoading(true)
    try {
      const newVerified = !isVerified
      const { error } = await supabase
        .from('businesses')
        .update({ is_verified: newVerified })
        .eq('id', businessId)

      if (error) throw error

      // Log the action
      await logAdminAction({
        action: newVerified ? 'verify' : 'unverify',
        entity_type: 'business',
        entity_id: businessId,
        entity_name: businessName,
        before_data: { is_verified: isVerified },
        after_data: { is_verified: newVerified },
      })

      router.refresh()
    } catch (error) {
      console.error('Error toggling verified status:', error)
      alert('Failed to update verified status')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async () => {
    setLoading(true)
    try {
      const newFeatured = !isFeatured
      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: newFeatured })
        .eq('id', businessId)

      if (error) throw error

      // Log the action
      await logAdminAction({
        action: newFeatured ? 'feature' : 'unfeature',
        entity_type: 'business',
        entity_id: businessId,
        entity_name: businessName,
        before_data: { is_featured: isFeatured },
        after_data: { is_featured: newFeatured },
      })

      router.refresh()
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update featured status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)

      if (error) throw error

      // Log the action
      await logAdminAction({
        action: 'delete',
        entity_type: 'business',
        entity_id: businessId,
        entity_name: businessName,
      })

      router.refresh()
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Failed to delete business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggleVerified}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
          isVerified
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
      >
        {isVerified ? (
          <>
            <XCircle size={16} />
            Unverify
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Verify
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
