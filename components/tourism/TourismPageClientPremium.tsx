'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ExperienceCardPremium } from './ExperienceCardPremium'
import { ExperienceQuickView } from './ExperienceQuickView'
import { TourismEmptyState } from './TourismEmptyState'
import { LayoutGrid, List, Map } from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface TourismPageClientPremiumProps {
  experiences: TourismExperience[]
  hasFilters?: boolean
}

type ViewMode = 'grid' | 'list'

export function TourismPageClientPremium({ experiences, hasFilters = false }: TourismPageClientPremiumProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
              <>{experiences.length} {experiences.length === 1 ? 'Experience' : 'Experiences'}</>
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
    </>
  )
}
