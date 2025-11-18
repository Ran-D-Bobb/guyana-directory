'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MapPin, ArrowUpDown, X, Filter, Star, BadgeCheck, Sparkles, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface AdvancedFilterPanelProps {
  regions: Array<{ id: string; name: string }>
  businessCount: number
  categoryName?: string
}

export function AdvancedFilterPanel({ regions, businessCount, categoryName }: AdvancedFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

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
    <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 py-4">
        {/* Collapsible Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Search & Filters</h3>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{businessCount}</span> results
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search in ${categoryName || 'businesses'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Verified Toggle */}
            <button
              onClick={() => toggleFilter('verified')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentVerified
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BadgeCheck className="h-4 w-4" />
              Verified
              {currentVerified && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Featured Toggle */}
            <button
              onClick={() => toggleFilter('featured')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentFeatured
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Featured
              {currentFeatured && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Rating Filter Chips */}
            {['4', '3'].map((rating) => (
              <button
                key={rating}
                onClick={() => updateFilter('rating', currentRating === rating ? 'all' : rating)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentRating === rating
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="h-4 w-4" />
                {rating}+ Stars
                {currentRating === rating && <X className="h-3 w-3 ml-1" />}
              </button>
            ))}
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Location
              </label>
              <select
                id="region"
                value={currentRegion}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="all">All Locations</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label htmlFor="sort" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <ArrowUpDown className="h-4 w-4 text-purple-600" />
                Sort By
              </label>
              <select
                id="sort"
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label htmlFor="rating" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                Minimum Rating
              </label>
              <select
                id="rating"
                value={currentRating}
                onChange={(e) => updateFilter('rating', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="all">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Active Filters Display (when collapsed) */}
        {!isExpanded && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {currentVerified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {currentFeatured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
            {currentRating !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Star className="h-3 w-3" />
                {currentRating}+ Stars
              </span>
            )}
            {currentRegion !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                {regions.find(r => r.id === currentRegion)?.name}
              </span>
            )}
            {currentSort !== 'featured' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                <ArrowUpDown className="h-3 w-3" />
                {currentSort === 'rating' ? 'Highest Rated' : currentSort === 'newest' ? 'Newest' : 'Most Popular'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
