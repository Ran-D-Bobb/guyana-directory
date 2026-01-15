'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  Shield,
  ShieldOff,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
} from '@/components/ui/alert-dialog'

// Types
interface ActionButtonProps {
  onClick: () => Promise<void>
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

// Base Action Button
export function ActionButton({
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  icon,
  children,
  className,
}: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    primary: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    success: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        variants[variant],
        sizes[size],
        variant === 'primary' && 'focus:ring-emerald-500',
        variant === 'danger' && 'focus:ring-red-500',
        className
      )}
    >
      {(loading || isLoading) ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}

// Delete Confirmation Dialog Button
export function DeleteButton({
  onConfirm,
  itemName,
  itemType = 'item',
  warningMessage,
  size = 'md',
}: {
  onConfirm: () => Promise<void>
  itemName?: string
  itemType?: string
  warningMessage?: string
  size?: 'sm' | 'md'
}) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
            'bg-red-100 text-red-700 hover:bg-red-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
            size === 'sm' ? 'px-2.5 py-1.5 text-xs gap-1.5' : 'px-3 py-2 text-sm gap-2'
          )}
        >
          <Trash2 size={size === 'sm' ? 14 : 16} />
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Delete {itemType}?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            {itemName && (
              <span className="block font-medium text-slate-900 mb-2">&quot;{itemName}&quot;</span>
            )}
            {warningMessage || 'This action cannot be undone. This will permanently delete the item and all associated data.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Business Actions Component
interface BusinessActionsProps {
  businessId: string
  businessName?: string
  isVerified: boolean
  isFeatured: boolean
  onUpdate?: () => void
}

export function BusinessActions({
  businessId,
  businessName,
  isVerified,
  isFeatured,
  onUpdate,
}: BusinessActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleVerified = async () => {
    setLoading('verify')
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_verified: !isVerified })
        .eq('id', businessId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error toggling verified status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleFeatured = async () => {
    setLoading('feature')
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: !isFeatured })
        .eq('id', businessId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error toggling featured status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId)

    if (error) throw error
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={handleToggleVerified}
        loading={loading === 'verify'}
        variant={isVerified ? 'success' : 'default'}
        size="sm"
        icon={isVerified ? <ShieldOff size={14} /> : <Shield size={14} />}
      >
        {isVerified ? 'Unverify' : 'Verify'}
      </ActionButton>

      <ActionButton
        onClick={handleToggleFeatured}
        loading={loading === 'feature'}
        variant={isFeatured ? 'warning' : 'default'}
        size="sm"
        icon={isFeatured ? <StarOff size={14} /> : <Star size={14} />}
      >
        {isFeatured ? 'Unfeature' : 'Feature'}
      </ActionButton>

      <DeleteButton
        onConfirm={handleDelete}
        itemName={businessName}
        itemType="business"
        size="sm"
      />
    </div>
  )
}

// Tourism Actions Component
interface TourismActionsProps {
  experienceId: string
  experienceName?: string
  isApproved: boolean
  isFeatured: boolean
  onUpdate?: () => void
}

export function TourismActions({
  experienceId,
  experienceName,
  isApproved,
  isFeatured,
  onUpdate,
}: TourismActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleApproved = async () => {
    setLoading('approve')
    try {
      const { error } = await supabase
        .from('tourism_experiences')
        .update({ is_approved: !isApproved })
        .eq('id', experienceId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error toggling approved status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleFeatured = async () => {
    setLoading('feature')
    try {
      const { error } = await supabase
        .from('tourism_experiences')
        .update({ is_featured: !isFeatured })
        .eq('id', experienceId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error toggling featured status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('tourism_experiences')
      .delete()
      .eq('id', experienceId)

    if (error) throw error
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={handleToggleApproved}
        loading={loading === 'approve'}
        variant={isApproved ? 'primary' : 'warning'}
        size="sm"
        icon={isApproved ? <XCircle size={14} /> : <CheckCircle size={14} />}
      >
        {isApproved ? 'Unapprove' : 'Approve'}
      </ActionButton>

      <ActionButton
        onClick={handleToggleFeatured}
        loading={loading === 'feature'}
        variant={isFeatured ? 'warning' : 'default'}
        size="sm"
        icon={isFeatured ? <StarOff size={14} /> : <Star size={14} />}
      >
        {isFeatured ? 'Unfeature' : 'Feature'}
      </ActionButton>

      <DeleteButton
        onConfirm={handleDelete}
        itemName={experienceName}
        itemType="experience"
        size="sm"
      />
    </div>
  )
}

// Rental Actions Component
interface RentalActionsProps {
  rentalId: string
  rentalName?: string
  isFeatured: boolean
  isApproved: boolean
  isFlagged: boolean
  flagCount: number
  flagReasons?: string[] | null
  onUpdate?: () => void
}

export function RentalActions({
  rentalId,
  rentalName,
  isFeatured,
  isApproved,
  isFlagged,
  flagCount,
  flagReasons,
  onUpdate,
}: RentalActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleFeatured = async () => {
    setLoading('feature')
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ is_featured: !isFeatured })
        .eq('id', rentalId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleVisibility = async () => {
    setLoading('visibility')
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ is_approved: !isApproved })
        .eq('id', rentalId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDismissFlags = async () => {
    setLoading('flags')
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
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', rentalId)

    if (error) throw error
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        onClick={handleToggleFeatured}
        loading={loading === 'feature'}
        variant={isFeatured ? 'warning' : 'default'}
        size="sm"
        icon={isFeatured ? <StarOff size={14} /> : <Star size={14} />}
      >
        {isFeatured ? 'Unfeature' : 'Feature'}
      </ActionButton>

      <ActionButton
        onClick={handleToggleVisibility}
        loading={loading === 'visibility'}
        variant={isApproved ? 'default' : 'danger'}
        size="sm"
        icon={isApproved ? <EyeOff size={14} /> : <Eye size={14} />}
      >
        {isApproved ? 'Hide' : 'Show'}
      </ActionButton>

      {isFlagged && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
                'bg-orange-100 text-orange-700 hover:bg-orange-200',
                'px-2.5 py-1.5 text-xs gap-1.5'
              )}
            >
              <Flag size={14} />
              Dismiss ({flagCount})
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Dismiss flags?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                <span className="block mb-3">
                  This will reset the flag count ({flagCount}) for this listing and mark it as reviewed.
                </span>
                {flagReasons && flagReasons.length > 0 && (
                  <div className="bg-slate-100 rounded-lg p-3">
                    <span className="block text-sm font-medium text-slate-700 mb-2">Flag reasons:</span>
                    <ul className="space-y-1">
                      {flagReasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-slate-600">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDismissFlags}
                disabled={loading === 'flags'}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                {loading === 'flags' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Dismissing...
                  </>
                ) : (
                  'Dismiss Flags'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <DeleteButton
        onConfirm={handleDelete}
        itemName={rentalName}
        itemType="rental"
        warningMessage="This will permanently delete the rental and all associated photos, reviews, saves, flags, and inquiries."
        size="sm"
      />
    </div>
  )
}

// Event Actions Component
interface EventActionsProps {
  eventId: string
  eventType: 'general' | 'business'
  isFeatured: boolean
  onUpdate?: () => void
}

export function EventActions({
  eventId,
  eventType,
  isFeatured,
  onUpdate,
}: EventActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const tableName = eventType === 'general' ? 'events' : 'business_events'

  const handleToggleFeatured = async () => {
    if (eventType !== 'general') return

    setLoading('feature')
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_featured: !isFeatured })
        .eq('id', eventId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', eventId)

    if (error) throw error
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {eventType === 'general' && (
        <ActionButton
          onClick={handleToggleFeatured}
          loading={loading === 'feature'}
          variant={isFeatured ? 'warning' : 'default'}
          size="sm"
          icon={isFeatured ? <StarOff size={14} /> : <Star size={14} />}
        >
          {isFeatured ? 'Unfeature' : 'Feature'}
        </ActionButton>
      )}

      <DeleteButton
        onConfirm={handleDelete}
        itemType="event"
        size="sm"
      />
    </div>
  )
}

// Review Actions Component
interface ReviewActionsProps {
  reviewId: string
  reviewerName?: string
  onUpdate?: () => void
}

export function ReviewActions({
  reviewId,
  reviewerName,
  onUpdate,
}: ReviewActionsProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error
    onUpdate?.()
    router.refresh()
  }

  return (
    <DeleteButton
      onConfirm={handleDelete}
      itemName={reviewerName ? `review by ${reviewerName}` : undefined}
      itemType="review"
      size="sm"
    />
  )
}

// Timeline Event Actions Component
interface TimelineActionsProps {
  eventId: string
  eventName?: string
  isActive: boolean
  onEdit: () => void
  onUpdate?: () => void
}

export function TimelineActions({
  eventId,
  eventName,
  isActive,
  onEdit,
  onUpdate,
}: TimelineActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const handleToggleActive = async () => {
    setLoading('active')
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update({ is_active: !isActive })
        .eq('id', eventId)

      if (error) throw error
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('Error toggling active status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={async () => onEdit()}
        variant="primary"
        size="sm"
        icon={<Eye size={14} />}
      >
        Edit
      </ActionButton>

      <ActionButton
        onClick={handleToggleActive}
        loading={loading === 'active'}
        variant={isActive ? 'default' : 'danger'}
        size="sm"
        icon={isActive ? <EyeOff size={14} /> : <Eye size={14} />}
      >
        {isActive ? 'Hide' : 'Show'}
      </ActionButton>

      <DeleteButton
        onConfirm={handleDelete}
        itemName={eventName}
        itemType="timeline event"
        size="sm"
      />
    </div>
  )
}
