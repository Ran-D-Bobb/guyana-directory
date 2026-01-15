'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MapPin, BadgeCheck, Sparkles, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Database } from '@/types/supabase'
import { SaveBusinessButton } from './SaveBusinessButton'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
  primary_photo?: string | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface BusinessesPageClientProps {
  businesses: Business[]
  pagination: PaginationInfo
  userId?: string | null
  savedBusinessIds?: string[]
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

// Unified Business Card - clean, consistent, touch-friendly
function BusinessCard({ business, userId, isSaved }: { business: Business; userId?: string | null; isSaved?: boolean }) {
  const imageUrl = business.primary_photo || DEFAULT_BUSINESS_IMAGE

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Save Button */}
        <SaveBusinessButton
          businessId={business.id}
          initialIsSaved={isSaved || false}
          userId={userId ?? null}
          variant="overlay"
          size="sm"
        />

        {/* Badges - top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {business.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full uppercase tracking-wide">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {business.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wide">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Rating - top right */}
        {business.rating != null && business.rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{business.rating.toFixed(1)}</span>
            {business.review_count != null && business.review_count > 0 && (
              <span className="text-[10px] text-white/70">({business.review_count})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {business.categories && (
          <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">
            {business.categories.name}
          </div>
        )}

        {/* Name */}
        <h3 className="font-semibold text-lg text-gray-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {business.name}
        </h3>

        {/* Location */}
        {business.regions && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{business.regions.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// Pagination Component
function Pagination({ pagination }: { pagination: PaginationInfo }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (pagination.totalPages <= 1) return null

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const { currentPage, totalPages } = pagination

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => goToPage(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pagination.currentPage === page
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              aria-current={pagination.currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => goToPage(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

export function BusinessesPageClient({ businesses, pagination, userId, savedBusinessIds = [] }: BusinessesPageClientProps) {
  const savedSet = new Set(savedBusinessIds)

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No businesses found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-0">
      {/* Business Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} userId={userId} isSaved={savedSet.has(business.id)} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* Results summary */}
      <div className="text-center text-sm text-gray-500 mt-4">
        Showing {((pagination.currentPage - 1) * 24) + 1}-{Math.min(pagination.currentPage * 24, pagination.totalItems)} of {pagination.totalItems} businesses
      </div>
    </div>
  )
}
