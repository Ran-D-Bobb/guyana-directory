'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  Calendar,
  Building2,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
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
import { ReviewActions } from '@/components/admin/AdminActionButtons'
import { bulkDeleteReviews } from '@/lib/bulk-actions'

// Types
interface Review {
  id: string
  rating: number
  comment?: string | null
  created_at: string | null
  helpful_count?: number | null
  not_helpful_count?: number | null
  businesses?: { id?: string; name?: string | null; slug?: string } | null
  profiles?: { id?: string; name?: string | null; email?: string | null; photo?: string | null } | null
}

interface ReviewListProps {
  reviews: Review[]
  hasActiveFilters: boolean
}

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Render star rating
const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}

// Inner component that uses the selection context
function ReviewListInner({ reviews, hasActiveFilters }: ReviewListProps) {
  const { setAllIds } = useBulkSelection()
  const router = useRouter()

  // Register all items with the selection context
  useEffect(() => {
    setAllIds(reviews.map(r => r.id))
  }, [reviews, setAllIds])

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: async (ids) => {
        await bulkDeleteReviews(ids)
        router.refresh()
      },
      variant: 'danger',
      requireConfirm: true,
      confirmTitle: 'Delete selected reviews?',
      confirmDescription: 'This will permanently delete all selected reviews. This action cannot be undone and will update the affected businesses\' rating scores.',
      confirmAction: 'Delete All',
    },
  ]

  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-12 text-center">
        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No reviews found</h3>
        <p className="text-slate-500">
          {hasActiveFilters
            ? 'Try adjusting your filters or search query'
            : 'Reviews will appear here when customers leave feedback'}
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
          Select all {reviews.length} reviews
        </span>
      </div>

      {/* Review List */}
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <BulkSelectCheckbox id={review.id} />
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      {/* User Avatar */}
                      {review.profiles?.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.profiles.photo}
                          alt={review.profiles.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-slate-200">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900">
                            {review.profiles?.name || 'Anonymous'}
                          </span>
                          {renderStars(review.rating)}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            review.rating >= 4
                              ? 'bg-emerald-100 text-emerald-700'
                              : review.rating === 3
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {review.rating}/5
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <Link
                            href={`/businesses/${review.businesses?.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors"
                          >
                            <Building2 size={14} />
                            {review.businesses?.name || 'Unknown Business'}
                            <ExternalLink size={12} className="opacity-50" />
                          </Link>
                          <span className="text-slate-300">|</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment ? (
                      <div className="bg-slate-50 rounded-xl p-4 mb-3">
                        <MessageSquare size={14} className="text-slate-400 mb-2" />
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic mb-3">
                        No comment provided
                      </p>
                    )}

                    {/* Helpful Votes */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <ThumbsUp size={14} className="text-emerald-500" />
                        <span className="font-medium text-slate-700">{review.helpful_count || 0}</span>
                        helpful
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <ThumbsDown size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{review.not_helpful_count || 0}</span>
                        not helpful
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    <ReviewActions
                      reviewId={review.id}
                      reviewerName={review.profiles?.name || 'Anonymous'}
                      businessName={review.businesses?.name ?? undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar actions={bulkActions} itemName="reviews" />
    </>
  )
}

// Wrapper component with provider
export function ReviewList({ reviews, hasActiveFilters }: ReviewListProps) {
  return (
    <BulkSelectionProvider>
      <ReviewListInner reviews={reviews} hasActiveFilters={hasActiveFilters} />
    </BulkSelectionProvider>
  )
}
