'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MapPin, ArrowUpDown, X, Filter, Search, ChevronDown, ChevronUp, Mountain, Clock } from 'lucide-react'
import { useState } from 'react'

interface TourismFilterPanelProps {
  regions: Array<{ id: string; name: string }>
  experienceCount: number
  categoryName?: string
}

export function TourismFilterPanel({ regions, experienceCount, categoryName }: TourismFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  // Default to collapsed on mobile to save screen space
  const [isExpanded, setIsExpanded] = useState(false)

  const currentRegion = searchParams.get('region') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'
  const currentDifficulty = searchParams.get('difficulty') || 'all'
  const currentDuration = searchParams.get('duration') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' || value === '' || value === 'false') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push(pathname)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', searchQuery.trim())
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const activeFiltersCount = [
    currentRegion !== 'all',
    currentSort !== 'featured',
    currentDifficulty !== 'all',
    currentDuration !== 'all'
  ].filter(Boolean).length

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
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
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{experienceCount}</span> results
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
                placeholder={`Search in ${categoryName || 'tourism experiences'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Easy Difficulty */}
            <button
              onClick={() => updateFilter('difficulty', currentDifficulty === 'easy' ? 'all' : 'easy')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentDifficulty === 'easy'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mountain className="h-4 w-4" />
              Easy
              {currentDifficulty === 'easy' && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Full Day */}
            <button
              onClick={() => updateFilter('duration', currentDuration === 'full_day' ? 'all' : 'full_day')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentDuration === 'full_day'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Full Day
              {currentDuration === 'full_day' && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Multi-Day */}
            <button
              onClick={() => updateFilter('duration', currentDuration === 'multi_day' ? 'all' : 'multi_day')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentDuration === 'multi_day'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Multi-Day
              {currentDuration === 'multi_day' && <X className="h-3 w-3 ml-1" />}
            </button>
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                Location
              </label>
              <select
                id="region"
                value={currentRegion}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="all">All Locations</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mountain className="h-4 w-4 text-emerald-600" />
                Difficulty
              </label>
              <select
                id="difficulty"
                value={currentDifficulty}
                onChange={(e) => updateFilter('difficulty', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                Duration
              </label>
              <select
                id="duration"
                value={currentDuration}
                onChange={(e) => updateFilter('duration', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="all">Any Duration</option>
                <option value="quick">Quick (1-2 hours)</option>
                <option value="half_day">Half Day (3-4 hours)</option>
                <option value="full_day">Full Day (5-8 hours)</option>
                <option value="multi_day">Multi-Day</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label htmlFor="sort" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <ArrowUpDown className="h-4 w-4 text-emerald-600" />
                Sort By
              </label>
              <select
                id="sort"
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Active Filters Display (when collapsed) */}
        {!isExpanded && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {currentDifficulty !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <Mountain className="h-3 w-3" />
                {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
              </span>
            )}
            {currentDuration !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                <Clock className="h-3 w-3" />
                {currentDuration === 'quick' ? 'Quick' : currentDuration === 'half_day' ? 'Half Day' : currentDuration === 'full_day' ? 'Full Day' : 'Multi-Day'}
              </span>
            )}
            {currentRegion !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                {regions.find(r => r.id === currentRegion)?.name}
              </span>
            )}
            {currentSort !== 'featured' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                <ArrowUpDown className="h-3 w-3" />
                {currentSort === 'price_low' ? 'Price: Low to High' : currentSort === 'price_high' ? 'Price: High to Low' : currentSort === 'rating' ? 'Highest Rated' : 'Most Popular'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
