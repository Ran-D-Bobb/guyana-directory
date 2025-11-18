'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { ViewModeToggle, ViewMode } from './ViewModeToggle'
import { EnhancedBusinessCard } from './EnhancedBusinessCard'
import { Database } from '@/types/supabase'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
  primary_photo?: string | null
}

interface CategoryPageClientProps {
  businesses: Business[]
}

export function CategoryPageClient({ businesses }: CategoryPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  return (
    <>
      {/* View Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="hidden md:block">
          <ViewModeToggle currentMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Business Grid/List */}
      {businesses.length > 0 ? (
        <div
          className={`pb-6
            ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' : ''}
            ${viewMode === 'list' ? 'space-y-4' : ''}
            ${viewMode === 'compact' ? 'grid grid-cols-1 lg:grid-cols-2 gap-3' : ''}
          `}
        >
          {businesses.map((business) => (
            <EnhancedBusinessCard
              key={business.id}
              business={business}
              primaryPhoto={business.primary_photo}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
            <Search className="h-10 w-10 text-gray-400" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No businesses found</h2>
          <p className="text-gray-600 text-lg mb-6">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </>
  )
}
