'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Compass,
  Eye,
  MessageCircle,
  Star,
  ExternalLink,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Sparkles,
  Mountain,
  XCircle,
  StarOff,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BulkSelectionProvider,
  BulkSelectCheckbox,
  BulkSelectAllCheckbox,
  BulkActionBar,
  useBulkSelection,
  type BulkAction,
} from '@/components/admin/BulkSelection'
import { TourismActions } from '@/components/admin/AdminActionButtons'
import {
  bulkApproveTourism,
  bulkUnapproveTourism,
  bulkFeatureTourism,
  bulkUnfeatureTourism,
  bulkDeleteTourism,
} from '@/lib/bulk-actions'

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  challenging: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700',
}

// Types
interface TourismExperience {
  id: string
  name: string
  slug: string
  description?: string | null
  is_approved?: boolean | null
  is_featured?: boolean | null
  view_count?: number | null
  booking_inquiry_count?: number | null
  rating?: number | null
  review_count?: number | null
  price_from?: number | null
  difficulty_level?: string | null
  tourism_categories?: { name: string } | null
  regions?: { name: string } | null
  profiles?: { name?: string | null; email?: string | null } | null
}

interface TourismListProps {
  experiences: TourismExperience[]
  hasActiveFilters: boolean
}

// Inner component that uses the selection context
function TourismListInner({ experiences, hasActiveFilters }: TourismListProps) {
  const { setAllIds } = useBulkSelection()
  const router = useRouter()

  // Register all items with the selection context
  useEffect(() => {
    setAllIds(experiences.map(e => e.id))
  }, [experiences, setAllIds])

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: 'Approve',
      icon: <CheckCircle size={16} />,
      onClick: async (ids) => {
        await bulkApproveTourism(ids)
        router.refresh()
      },
      variant: 'primary',
    },
    {
      label: 'Unapprove',
      icon: <XCircle size={16} />,
      onClick: async (ids) => {
        await bulkUnapproveTourism(ids)
        router.refresh()
      },
      variant: 'warning',
    },
    {
      label: 'Feature',
      icon: <Star size={16} />,
      onClick: async (ids) => {
        await bulkFeatureTourism(ids)
        router.refresh()
      },
      variant: 'warning',
    },
    {
      label: 'Unfeature',
      icon: <StarOff size={16} />,
      onClick: async (ids) => {
        await bulkUnfeatureTourism(ids)
        router.refresh()
      },
      variant: 'default',
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: async (ids) => {
        await bulkDeleteTourism(ids)
        router.refresh()
      },
      variant: 'danger',
      requireConfirm: true,
      confirmTitle: 'Delete selected experiences?',
      confirmDescription: 'This will permanently delete all selected tourism experiences and their associated data including photos and reviews. This action cannot be undone.',
      confirmAction: 'Delete All',
    },
  ]

  if (!experiences || experiences.length === 0) {
    return (
      <div className="p-12 text-center">
        <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No experiences found</h3>
        <p className="text-slate-500">
          {hasActiveFilters
            ? 'Try adjusting your filters or search query'
            : 'Tourism experiences created by operators will appear here'}
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
          Select all {experiences.length} experiences
        </span>
      </div>

      {/* Experience List */}
      <div className="divide-y divide-slate-100">
        {experiences.map((experience) => (
          <div
            key={experience.id}
            className={cn(
              'p-4 transition-colors',
              !experience.is_approved ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-slate-50/50'
            )}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <BulkSelectCheckbox id={experience.id} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <Link
                        href={`/tourism/${experience.slug}`}
                        target="_blank"
                        className="group text-lg font-semibold text-slate-900 hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        {experience.name}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {!experience.is_approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            <Clock size={12} />
                            Pending
                          </span>
                        )}
                        {experience.is_approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Approved
                          </span>
                        )}
                        {experience.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <Sparkles size={12} />
                            Featured
                          </span>
                        )}
                        {experience.difficulty_level && (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                            difficultyColors[experience.difficulty_level as keyof typeof difficultyColors]
                          )}>
                            <Mountain size={12} />
                            {experience.difficulty_level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Compass size={14} className="text-slate-400" />
                        {experience.tourism_categories?.name || 'Uncategorized'}
                      </span>
                      {experience.regions?.name && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          {experience.regions.name}
                        </span>
                      )}
                      {experience.profiles ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          {experience.profiles.name || experience.profiles.email}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-orange-600">
                          <User size={14} />
                          No operator
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {experience.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {experience.description}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Eye size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{experience.view_count || 0}</span>
                        views
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <MessageCircle size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{experience.booking_inquiry_count || 0}</span>
                        inquiries
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="font-medium text-slate-700">{experience.rating?.toFixed(1) || '0.0'}</span>
                        ({experience.review_count || 0})
                      </span>
                      {experience.price_from && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <span className="font-medium text-slate-700">
                            GYD {experience.price_from.toLocaleString()}
                          </span>
                          /person
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <TourismActions
                      experienceId={experience.id}
                      experienceName={experience.name}
                      isApproved={experience.is_approved || false}
                      isFeatured={experience.is_featured || false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar actions={bulkActions} itemName="experiences" />
    </>
  )
}

// Wrapper component with provider
export function TourismList({ experiences, hasActiveFilters }: TourismListProps) {
  return (
    <BulkSelectionProvider>
      <TourismListInner experiences={experiences} hasActiveFilters={hasActiveFilters} />
    </BulkSelectionProvider>
  )
}
