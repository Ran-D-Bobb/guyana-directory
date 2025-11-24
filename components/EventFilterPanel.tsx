'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MapPin, ArrowUpDown, X, Filter, Sparkles, Search, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { useState } from 'react'

interface EventFilterPanelProps {
  regions: Array<{ id: string; name: string }>
  eventCount: number
  categoryName?: string
}

export function EventFilterPanel({ regions, eventCount, categoryName }: EventFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false) // Default to collapsed on mobile

  const currentRegion = searchParams.get('region') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'
  const currentTime = searchParams.get('time') || 'upcoming'

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
    currentTime !== 'upcoming'
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
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{eventCount}</span> results
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
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
                placeholder={`Search in ${categoryName || 'events'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Upcoming Events */}
            <button
              onClick={() => updateFilter('time', currentTime === 'upcoming' ? 'all' : 'upcoming')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentTime === 'upcoming'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Upcoming
              {currentTime === 'upcoming' && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Ongoing Events */}
            <button
              onClick={() => updateFilter('time', currentTime === 'ongoing' ? 'all' : 'ongoing')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentTime === 'ongoing'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Happening Now
              {currentTime === 'ongoing' && <X className="h-3 w-3 ml-1" />}
            </button>

            {/* Past Events */}
            <button
              onClick={() => updateFilter('time', currentTime === 'past' ? 'all' : 'past')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentTime === 'past'
                  ? 'bg-gray-600 text-white shadow-lg shadow-gray-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Past
              {currentTime === 'past' && <X className="h-3 w-3 ml-1" />}
            </button>
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-pink-600" />
                Location
              </label>
              <select
                id="region"
                value={currentRegion}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
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
                <option value="date">Date (Soonest)</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                When
              </label>
              <select
                id="time"
                value={currentTime}
                onChange={(e) => updateFilter('time', e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer text-gray-900 text-sm font-medium"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Happening Now</option>
                <option value="past">Past Events</option>
                <option value="all">All Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Active Filters Display (when collapsed) */}
        {!isExpanded && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {currentTime !== 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Clock className="h-3 w-3" />
                {currentTime === 'ongoing' ? 'Happening Now' : currentTime === 'past' ? 'Past' : 'All Events'}
              </span>
            )}
            {currentRegion !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                {regions.find(r => r.id === currentRegion)?.name}
              </span>
            )}
            {currentSort !== 'featured' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                <ArrowUpDown className="h-3 w-3" />
                {currentSort === 'date' ? 'Date (Soonest)' : 'Most Popular'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
