'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ExperienceCardPremium } from './ExperienceCardPremium'
import { TourismEmptyState } from './TourismEmptyState'
import { LayoutGrid, List, Map } from 'lucide-react'
import { TourismExperience } from '@/types/tourism'
import { Pagination } from '@/components/Pagination'

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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const clearFilters = () => {
    window.location.href = pathname
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

  // Build searchParams record for Pagination (exclude 'page' — Pagination adds it)
  const paginationSearchParams: Record<string, string | undefined> = {}
  searchParams.forEach((value, key) => {
    if (key !== 'page') {
      paginationSearchParams[key] = value
    }
  })

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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/tourism"
            searchParams={paginationSearchParams}
          />
        </div>
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
