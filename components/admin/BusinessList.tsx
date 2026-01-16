'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Eye,
  Star,
  Edit,
  ExternalLink,
  MapPin,
  User,
  CheckCircle,
  Sparkles,
  Shield,
  ShieldOff,
  StarOff,
  Trash2,
  Plus,
} from 'lucide-react'
import {
  BulkSelectionProvider,
  BulkSelectCheckbox,
  BulkSelectAllCheckbox,
  BulkActionBar,
  useBulkSelection,
  type BulkAction,
} from '@/components/admin/BulkSelection'
import { BusinessActions } from '@/components/admin/AdminActionButtons'
import {
  bulkVerifyBusinesses,
  bulkUnverifyBusinesses,
  bulkFeatureBusinesses,
  bulkUnfeatureBusinesses,
  bulkDeleteBusinesses,
} from '@/lib/bulk-actions'

// Types
interface Business {
  id: string
  name: string
  slug: string
  description?: string | null
  is_verified?: boolean | null
  is_featured?: boolean | null
  view_count?: number | null
  rating?: number | null
  review_count?: number | null
  categories?: { name: string | null; icon?: string | null } | null
  regions?: { name: string | null } | null
  profiles?: { name?: string | null; email?: string | null } | null
}

interface BusinessListProps {
  businesses: Business[]
  hasActiveFilters: boolean
}

// Inner component that uses the selection context
function BusinessListInner({ businesses, hasActiveFilters }: BusinessListProps) {
  const { setAllIds } = useBulkSelection()
  const router = useRouter()

  // Register all items with the selection context
  useEffect(() => {
    setAllIds(businesses.map(b => b.id))
  }, [businesses, setAllIds])

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: 'Verify',
      icon: <Shield size={16} />,
      onClick: async (ids) => {
        await bulkVerifyBusinesses(ids)
        router.refresh()
      },
      variant: 'success',
    },
    {
      label: 'Unverify',
      icon: <ShieldOff size={16} />,
      onClick: async (ids) => {
        await bulkUnverifyBusinesses(ids)
        router.refresh()
      },
      variant: 'default',
    },
    {
      label: 'Feature',
      icon: <Star size={16} />,
      onClick: async (ids) => {
        await bulkFeatureBusinesses(ids)
        router.refresh()
      },
      variant: 'warning',
    },
    {
      label: 'Unfeature',
      icon: <StarOff size={16} />,
      onClick: async (ids) => {
        await bulkUnfeatureBusinesses(ids)
        router.refresh()
      },
      variant: 'default',
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: async (ids) => {
        await bulkDeleteBusinesses(ids)
        router.refresh()
      },
      variant: 'danger',
      requireConfirm: true,
      confirmTitle: 'Delete selected businesses?',
      confirmDescription: 'This will permanently delete all selected businesses and their associated data including photos, reviews, and events. This action cannot be undone.',
      confirmAction: 'Delete All',
    },
  ]

  if (!businesses || businesses.length === 0) {
    return (
      <div className="p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No businesses found</h3>
        <p className="text-slate-500 mb-4">
          {hasActiveFilters
            ? 'Try adjusting your filters or search query'
            : 'Get started by adding your first business'}
        </p>
        <Link
          href="/admin/businesses/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Business
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Select All Header */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <BulkSelectAllCheckbox />
        <span className="text-sm text-slate-600">
          Select all {businesses.length} businesses
        </span>
      </div>

      {/* Business List */}
      <div className="divide-y divide-slate-100">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="p-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <BulkSelectCheckbox id={business.id} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <Link
                        href={`/businesses/${business.slug}`}
                        target="_blank"
                        className="group text-lg font-semibold text-slate-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        {business.name}
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {business.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        )}
                        {business.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            <Sparkles size={12} />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={14} className="text-slate-400" />
                        {business.categories?.name || 'Uncategorized'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {business.regions?.name || 'Unknown'}
                      </span>
                      {business.profiles ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          {business.profiles.name || business.profiles.email}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-orange-600">
                          <User size={14} />
                          No owner
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {business.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {business.description}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Eye size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{business.view_count || 0}</span>
                        views
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="font-medium text-slate-700">{business.rating?.toFixed(1) || '0.0'}</span>
                        ({business.review_count || 0})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    <Link
                      href={`/admin/businesses/${business.id}/edit`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit size={14} />
                      Edit Details
                    </Link>
                    <BusinessActions
                      businessId={business.id}
                      businessName={business.name}
                      isVerified={business.is_verified || false}
                      isFeatured={business.is_featured || false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar actions={bulkActions} itemName="businesses" />
    </>
  )
}

// Wrapper component with provider
export function BusinessList({ businesses, hasActiveFilters }: BusinessListProps) {
  return (
    <BulkSelectionProvider>
      <BusinessListInner businesses={businesses} hasActiveFilters={hasActiveFilters} />
    </BulkSelectionProvider>
  )
}
