'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MapPin, ArrowUpDown, X, Filter, Star, BadgeCheck, Sparkles, Search } from 'lucide-react'

interface DesktopFilterDrawerProps {
  regions: Array<{ id: string; name: string }>
  categoryName?: string
}

export function DesktopFilterDrawer({ regions, categoryName }: DesktopFilterDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const currentRegion = searchParams.get('region') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'
  const currentRating = searchParams.get('rating') || 'all'
  const currentVerified = searchParams.get('verified') === 'true'
  const currentFeatured = searchParams.get('featured') === 'true'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' || value === '' || value === 'false') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValue = params.get(key) === 'true'

    if (currentValue) {
      params.delete(key)
    } else {
      params.set(key, 'true')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push(pathname)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
    }
  }

  const activeFiltersCount = [
    currentRegion !== 'all',
    currentSort !== 'featured',
    currentRating !== 'all',
    currentVerified,
    currentFeatured
  ].filter(Boolean).length

  return (
    <>
      {/* Floating Filter Button - Desktop Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex fixed bottom-6 left-80 z-40 h-14 px-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 active:scale-95 transition-all items-center gap-2 font-semibold"
      >
        <Filter className="h-5 w-5" strokeWidth={2.5} />
        Search & Filters
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-purple-600 text-xs font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Drawer - Right Side */}
      <div
        className={`hidden lg:block fixed top-0 right-0 bottom-0 z-50 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '480px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Search & Filters</h2>
            <p className="text-sm text-white/80">Find exactly what you&apos;re looking for</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-160px)] p-6 scrollbar-thin">
          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Search in {categoryName || 'businesses'}
            </label>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleFilter('verified')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentVerified
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BadgeCheck className="h-4 w-4" />
                Verified Only
              </button>

              <button
                onClick={() => toggleFilter('featured')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentFeatured
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Featured Only
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label htmlFor="desktop-region" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Location
            </label>
            <select
              id="desktop-region"
              value={currentRegion}
              onChange={(e) => updateFilter('region', e.target.value)}
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
            <label htmlFor="desktop-sort" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <ArrowUpDown className="h-4 w-4 text-purple-600" />
              Sort By
            </label>
            <select
              id="desktop-sort"
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
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
                  onClick={() => updateFilter('rating', rating)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentRating === rating
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 'all' ? 'Any Rating' : `${rating}+ Stars`}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-900">
                  {activeFiltersCount} Active {activeFiltersCount === 1 ? 'Filter' : 'Filters'}
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {currentFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {currentRating !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3" />
                    {currentRating}+ Stars
                  </span>
                )}
                {currentRegion !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <MapPin className="h-3 w-3" />
                    {regions.find(r => r.id === currentRegion)?.name}
                  </span>
                )}
                {currentSort !== 'featured' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <ArrowUpDown className="h-3 w-3" />
                    {currentSort === 'rating' ? 'Highest Rated' : currentSort === 'newest' ? 'Newest' : 'Most Popular'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </>
  )
}
