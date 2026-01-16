'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Home,
  Eye,
  MessageCircle,
  Star,
  Heart,
  Flag,
  Building2,
  ExternalLink,
  Sparkles,
  EyeOff,
  CheckCircle,
  StarOff,
  Trash2,
} from 'lucide-react'
import {
  BulkSelectionProvider,
  BulkSelectCheckbox,
  BulkSelectAllCheckbox,
  BulkActionBar,
  useBulkSelection,
  type BulkAction,
} from '@/components/admin/BulkSelection'
import { RentalActions } from '@/components/admin/AdminActionButtons'
import {
  bulkFeatureRentals,
  bulkUnfeatureRentals,
  bulkShowRentals,
  bulkHideRentals,
  bulkDismissRentalFlags,
  bulkDeleteRentals,
} from '@/lib/bulk-actions'

// Types
import type { Json } from '@/types/supabase'

interface Rental {
  id: string
  name: string
  slug: string
  description?: string | null
  is_featured?: boolean | null
  is_approved?: boolean | null
  is_flagged?: boolean | null
  flag_count?: number | null
  flag_reasons?: Json | null
  view_count?: number | null
  inquiry_count?: number | null
  save_count?: number | null
  rating?: number | null
  review_count?: number | null
  rental_categories?: { name: string } | null
}

interface RentalListProps {
  rentals: Rental[]
  hasActiveFilters: boolean
  showFlagged?: boolean
}

// Inner component that uses the selection context
function RentalListInner({ rentals, hasActiveFilters, showFlagged }: RentalListProps) {
  const { setAllIds } = useBulkSelection()
  const router = useRouter()

  // Register all items with the selection context
  useEffect(() => {
    setAllIds(rentals.map(r => r.id))
  }, [rentals, setAllIds])

  // Define bulk actions based on whether we're showing flagged or regular rentals
  const bulkActions: BulkAction[] = showFlagged
    ? [
        {
          label: 'Dismiss Flags',
          icon: <Flag size={16} />,
          onClick: async (ids) => {
            await bulkDismissRentalFlags(ids)
            router.refresh()
          },
          variant: 'warning',
          requireConfirm: true,
          confirmTitle: 'Dismiss all flags?',
          confirmDescription: 'This will clear all flags from the selected rentals and mark them as reviewed.',
          confirmAction: 'Dismiss All',
        },
        {
          label: 'Show',
          icon: <Eye size={16} />,
          onClick: async (ids) => {
            await bulkShowRentals(ids)
            router.refresh()
          },
          variant: 'success',
        },
        {
          label: 'Hide',
          icon: <EyeOff size={16} />,
          onClick: async (ids) => {
            await bulkHideRentals(ids)
            router.refresh()
          },
          variant: 'default',
        },
        {
          label: 'Delete',
          icon: <Trash2 size={16} />,
          onClick: async (ids) => {
            await bulkDeleteRentals(ids)
            router.refresh()
          },
          variant: 'danger',
          requireConfirm: true,
          confirmTitle: 'Delete selected rentals?',
          confirmDescription: 'This will permanently delete all selected rentals and their associated data including photos, reviews, and inquiries. This action cannot be undone.',
          confirmAction: 'Delete All',
        },
      ]
    : [
        {
          label: 'Feature',
          icon: <Star size={16} />,
          onClick: async (ids) => {
            await bulkFeatureRentals(ids)
            router.refresh()
          },
          variant: 'warning',
        },
        {
          label: 'Unfeature',
          icon: <StarOff size={16} />,
          onClick: async (ids) => {
            await bulkUnfeatureRentals(ids)
            router.refresh()
          },
          variant: 'default',
        },
        {
          label: 'Show',
          icon: <Eye size={16} />,
          onClick: async (ids) => {
            await bulkShowRentals(ids)
            router.refresh()
          },
          variant: 'success',
        },
        {
          label: 'Hide',
          icon: <EyeOff size={16} />,
          onClick: async (ids) => {
            await bulkHideRentals(ids)
            router.refresh()
          },
          variant: 'default',
        },
        {
          label: 'Delete',
          icon: <Trash2 size={16} />,
          onClick: async (ids) => {
            await bulkDeleteRentals(ids)
            router.refresh()
          },
          variant: 'danger',
          requireConfirm: true,
          confirmTitle: 'Delete selected rentals?',
          confirmDescription: 'This will permanently delete all selected rentals and their associated data including photos, reviews, and inquiries. This action cannot be undone.',
          confirmAction: 'Delete All',
        },
      ]

  if (!rentals || rentals.length === 0) {
    return (
      <div className="p-12 text-center">
        <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No rentals found</h3>
        <p className="text-slate-500">
          {hasActiveFilters
            ? 'Try adjusting your filters or search query'
            : 'Rental listings will appear here'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Select All Header */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <BulkSelectAllCheckbox />
        <span className="text-sm text-slate-600">
          Select all {rentals.length} rentals
        </span>
      </div>

      {/* Rental List */}
      <div className="divide-y divide-slate-100">
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="p-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <BulkSelectCheckbox id={rental.id} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <Link
                        href={`/rentals/${rental.slug}`}
                        target="_blank"
                        className="group text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        {rental.name}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      <div className="flex flex-wrap gap-1.5">
                        {rental.is_flagged && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            <Flag size={12} />
                            {rental.flag_count} flags
                          </span>
                        )}
                        {rental.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <Sparkles size={12} />
                            Featured
                          </span>
                        )}
                        {rental.is_approved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
                            <EyeOff size={12} />
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={14} className="text-slate-400" />
                        {rental.rental_categories?.name}
                      </span>
                    </div>

                    {/* Flag Reasons (only for flagged rentals) */}
                    {rental.is_flagged && rental.flag_reasons && Array.isArray(rental.flag_reasons) && rental.flag_reasons.length > 0 && (
                      <div className="bg-red-100/50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-red-800 mb-2">Flag Reasons:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(rental.flag_reasons as string[]).map((reason, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Eye size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{rental.view_count || 0}</span>
                        views
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <MessageCircle size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{rental.inquiry_count || 0}</span>
                        inquiries
                      </span>
                      {rental.rating && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="font-medium text-slate-700">{rental.rating.toFixed(1)}</span>
                          ({rental.review_count || 0})
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Heart size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{rental.save_count || 0}</span>
                        saves
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <RentalActions
                    rentalId={rental.id}
                    rentalName={rental.name}
                    isFeatured={rental.is_featured ?? false}
                    isApproved={rental.is_approved ?? false}
                    isFlagged={rental.is_flagged ?? false}
                    flagCount={rental.flag_count ?? 0}
                    flagReasons={rental.flag_reasons as string[] | null}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar actions={bulkActions} itemName="rentals" />
    </>
  )
}

// Wrapper component with provider
export function RentalList({ rentals, hasActiveFilters, showFlagged = false }: RentalListProps) {
  return (
    <BulkSelectionProvider>
      <RentalListInner rentals={rentals} hasActiveFilters={hasActiveFilters} showFlagged={showFlagged} />
    </BulkSelectionProvider>
  )
}

// Flagged Rentals List with its own selection context
export function FlaggedRentalList({ rentals }: { rentals: Rental[] }) {
  return (
    <BulkSelectionProvider>
      <RentalListInner rentals={rentals} hasActiveFilters={false} showFlagged={true} />
    </BulkSelectionProvider>
  )
}
