'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Filter, MapPin, ArrowUpDown, Mountain, Clock, Search } from 'lucide-react'

interface MobileTourismFilterSheetProps {
  regions: Array<{ id: string; name: string }>
}

export function MobileTourismFilterSheet({ regions }: MobileTourismFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || 'all')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'featured')
  const [localDifficulty, setLocalDifficulty] = useState(searchParams.get('difficulty') || 'all')
  const [localDuration, setLocalDuration] = useState(searchParams.get('duration') || 'all')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (localRegion !== 'all') params.set('region', localRegion)
    if (localSort !== 'featured') params.set('sort', localSort)
    if (localDifficulty !== 'all') params.set('difficulty', localDifficulty)
    if (localDuration !== 'all') params.set('duration', localDuration)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())

    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalDifficulty('all')
    setLocalDuration('all')
    setSearchQuery('')
  }

  // Count active filters based on URL params (for button badge)
  const activeFiltersCount = [
    searchParams.get('region') && searchParams.get('region') !== 'all',
    searchParams.get('sort') && searchParams.get('sort') !== 'featured',
    searchParams.get('difficulty') && searchParams.get('difficulty') !== 'all',
    searchParams.get('duration') && searchParams.get('duration') !== 'all',
    searchParams.get('q')
  ].filter(Boolean).length

  // Count local filters (for sheet display)
  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localDifficulty !== 'all',
    localDuration !== 'all',
    searchQuery.trim()
  ].filter(Boolean).length

  return (
    <>
      {/* Floating Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] right-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open filters"
      >
        <Filter className="h-5 w-5" strokeWidth={2.5} />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-emerald-600 text-[10px] font-bold shadow-md">
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
          {/* Search */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Search className="h-4 w-4 text-emerald-600" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
            />
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Mountain className="h-4 w-4 text-emerald-600" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Any Level' },
                { value: 'easy', label: 'Easy' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'challenging', label: 'Challenging' },
                { value: 'expert', label: 'Expert' }
              ].map((difficulty) => (
                <button
                  key={difficulty.value}
                  onClick={() => setLocalDifficulty(difficulty.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localDifficulty === difficulty.value
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Clock className="h-4 w-4 text-cyan-600" />
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Any Duration' },
                { value: 'quick', label: 'Quick (1-2h)' },
                { value: 'half_day', label: 'Half Day (3-4h)' },
                { value: 'full_day', label: 'Full Day (5-8h)' },
                { value: 'multi_day', label: 'Multi-Day' }
              ].map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setLocalDuration(duration.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localDuration === duration.value
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-teal-600" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-medium"
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
              <ArrowUpDown className="h-4 w-4 text-emerald-600" />
              Sort By
            </label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            >
              <option value="featured">Featured First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
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
