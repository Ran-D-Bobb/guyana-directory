'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ExperienceCardPremium } from './ExperienceCardPremium'
import { ExperienceQuickView } from './ExperienceQuickView'
import { TourismEmptyState } from './TourismEmptyState'
import { LayoutGrid, List, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface TourismPageClientPremiumProps {
  experiences: TourismExperience[]
  hasFilters?: boolean
  pagination?: PaginationInfo
}

type ViewMode = 'grid' | 'list'

export function TourismPageClientPremium({ experiences, hasFilters = false, pagination }: TourismPageClientPremiumProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [quickViewExperience, setQuickViewExperience] = useState<TourismExperience | null>(null)

  const clearFilters = () => {
    router.push(pathname)
  }

  if (!experiences || experiences.length === 0) {
    return (
      <TourismEmptyState
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
    )
  }

  // Count stats
  const featuredCount = experiences.filter(e => e.is_featured).length
  const verifiedCount = experiences.filter(e => e.is_verified).length

  return (
    <>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Results Count */}
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {searchParams.get('q') ? (
              <>
                Results for <span className="text-emerald-600">&quot;{searchParams.get('q')}&quot;</span>
              </>
            ) : (
              <>{pagination?.totalItems || experiences.length} {(pagination?.totalItems || experiences.length) === 1 ? 'Experience' : 'Experiences'}</>
            )}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {featuredCount > 0 && (
              <span className="text-sm text-amber-600 font-medium">
                {featuredCount} featured
              </span>
            )}
            {verifiedCount > 0 && (
              <span className="text-sm text-emerald-600 font-medium">
                {verifiedCount} verified
              </span>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 rounded-lg text-gray-400 cursor-not-allowed"
            aria-label="Map view (coming soon)"
            title="Map view coming soon"
            disabled
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className={`animate-fade-in ${
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
      }`}>
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
          >
            <ExperienceCardPremium
              experience={experience}
              priority={index < 6}
            />
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewExperience && (
        <ExperienceQuickView
          experience={quickViewExperience}
          isOpen={!!quickViewExperience}
          onClose={() => setQuickViewExperience(null)}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(page => {
              const { currentPage, totalPages } = pagination
              if (totalPages <= 7) return true
              if (page === 1 || page === totalPages) return true
              if (Math.abs(page - currentPage) <= 1) return true
              if (page === currentPage - 2 || page === currentPage + 2) return true
              return false
            })
            .map((page, index, arr) => {
              const showEllipsis = index > 0 && page - arr[index - 1] > 1
              return (
                <span key={page} className="flex items-center">
                  {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => goToPage(page)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                      pagination.currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-current={pagination.currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </span>
              )
            })}

          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      )}

      {/* Page Info */}
      {pagination && pagination.totalItems > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {((pagination.currentPage - 1) * 24) + 1}-{Math.min(pagination.currentPage * 24, pagination.totalItems)} of {pagination.totalItems} experiences
        </p>
      )}
    </>
  )
}
