'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Filter, MapPin, ArrowUpDown, Star, BadgeCheck, Sparkles } from 'lucide-react'

interface MobileFilterSheetProps {
  regions: Array<{ id: string; name: string }>
}

export function MobileFilterSheet({ regions }: MobileFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || 'all')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'featured')
  const [localRating, setLocalRating] = useState(searchParams.get('rating') || 'all')
  const [localVerified, setLocalVerified] = useState(searchParams.get('verified') === 'true')
  const [localFeatured, setLocalFeatured] = useState(searchParams.get('featured') === 'true')

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (localRegion !== 'all') params.set('region', localRegion)
    if (localSort !== 'featured') params.set('sort', localSort)
    if (localRating !== 'all') params.set('rating', localRating)
    if (localVerified) params.set('verified', 'true')
    if (localFeatured) params.set('featured', 'true')

    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalRating('all')
    setLocalVerified(false)
    setLocalFeatured(false)
  }

  // Count active filters based on URL params (for button badge)
  const activeFiltersCount = [
    searchParams.get('region') && searchParams.get('region') !== 'all',
    searchParams.get('sort') && searchParams.get('sort') !== 'featured',
    searchParams.get('rating') && searchParams.get('rating') !== 'all',
    searchParams.get('verified') === 'true',
    searchParams.get('featured') === 'true'
  ].filter(Boolean).length

  // Count local filters (for sheet display)
  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localRating !== 'all',
    localVerified,
    localFeatured
  ].filter(Boolean).length

  return (
    <>
      {/* Floating Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] right-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open filters"
      >
        <Filter className="h-5 w-5" strokeWidth={2.5} />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-purple-600 text-[10px] font-bold shadow-md">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Filter className="h-6 w-6 text-gray-900" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              {localActiveFiltersCount > 0 && (
                <p className="text-sm text-gray-600">{localActiveFiltersCount} active</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {/* Quick Toggles */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalVerified(!localVerified)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  localVerified
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <BadgeCheck className="h-4 w-4" />
                Verified Only
              </button>

              <button
                onClick={() => setLocalFeatured(!localFeatured)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  localFeatured
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Featured Only
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            >
              <option value="all">All Locations</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <ArrowUpDown className="h-4 w-4 text-purple-600" />
              Sort By
            </label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
            >
              <option value="featured">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Star className="h-4 w-4 text-amber-500" />
              Minimum Rating
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['all', '2', '3', '4'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setLocalRating(rating)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localRating === rating
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {rating === 'all' ? 'Any Rating' : `${rating}+ Stars`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              Apply Filters
              {localActiveFiltersCount > 0 && ` (${localActiveFiltersCount})`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
