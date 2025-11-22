'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Star,
  StarOff,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  AlertTriangle
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminRentalActionsProps {
  rentalId: string
  rentalName: string
  isFeatured: boolean
  isApproved: boolean
  isFlagged: boolean
  flagCount: number
  flagReasons?: string[] | null
  onUpdate: () => void
}

export default function AdminRentalActions({
  rentalId,
  rentalName,
  isFeatured,
  isApproved,
  isFlagged,
  flagCount,
  flagReasons,
  onUpdate
}: AdminRentalActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleToggleFeatured = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ is_featured: !isFeatured })
        .eq('id', rentalId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update featured status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleApproved = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ is_approved: !isApproved })
        .eq('id', rentalId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error toggling approved status:', error)
      alert('Failed to update approved status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismissFlags = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('rentals')
        .update({
          is_flagged: false,
          flag_count: 0,
          flag_reasons: []
        })
        .eq('id', rentalId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error dismissing flags:', error)
      alert('Failed to dismiss flags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      // Delete rental (cascade will handle photos, reviews, etc.)
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', rentalId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error deleting rental:', error)
      alert('Failed to delete rental')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Feature/Unfeature */}
      <Button
        onClick={handleToggleFeatured}
        disabled={isLoading}
        variant={isFeatured ? "default" : "outline"}
        size="sm"
      >
        {isFeatured ? (
          <>
            <StarOff className="h-4 w-4 mr-1" />
            Unfeature
          </>
        ) : (
          <>
            <Star className="h-4 w-4 mr-1" />
            Feature
          </>
        )}
      </Button>

      {/* Hide/Unhide */}
      <Button
        onClick={handleToggleApproved}
        disabled={isLoading}
        variant={isApproved ? "outline" : "default"}
        size="sm"
      >
        {isApproved ? (
          <>
            <EyeOff className="h-4 w-4 mr-1" />
            Hide
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Unhide
          </>
        )}
      </Button>

      {/* Dismiss Flags */}
      {isFlagged && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              <Flag className="h-4 w-4 mr-1" />
              Dismiss Flags ({flagCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dismiss Flags</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all {flagCount} flag(s) for &quot;{rentalName}&quot;.
                {flagReasons && flagReasons.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-sm mb-2">Flag Reasons:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {flagReasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-600">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDismissFlags}>
                Dismiss Flags
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Rental
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &quot;{rentalName}&quot;? This will also delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All photos</li>
                <li>All reviews and ratings</li>
                <li>All saved/wishlist entries</li>
                <li>All flags and inquiries</li>
              </ul>
              <p className="mt-3 text-red-600 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
