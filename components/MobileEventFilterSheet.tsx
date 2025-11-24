'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Filter, MapPin, ArrowUpDown, Clock, Search, Sparkles, Calendar as CalendarIcon } from 'lucide-react'

interface MobileEventFilterSheetProps {
  regions: Array<{ id: string; name: string }>
}

export function MobileEventFilterSheet({ regions }: MobileEventFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || 'all')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'featured')
  const [localTime, setLocalTime] = useState(searchParams.get('time') || 'upcoming')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (localRegion !== 'all') params.set('region', localRegion)
    if (localSort !== 'featured') params.set('sort', localSort)
    if (localTime !== 'upcoming') params.set('time', localTime)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())

    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalTime('upcoming')
    setSearchQuery('')
  }

  // Count active filters based on URL params (for button badge)
  const activeFiltersCount = [
    searchParams.get('region') && searchParams.get('region') !== 'all',
    searchParams.get('sort') && searchParams.get('sort') !== 'featured',
    searchParams.get('time') && searchParams.get('time') !== 'upcoming',
    searchParams.get('q')
  ].filter(Boolean).length

  // Count local filters (for sheet display)
  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localTime !== 'upcoming',
    searchQuery.trim()
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
          {/* Search */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Search className="h-4 w-4 text-purple-600" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          {/* Time Filter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Clock className="h-4 w-4 text-purple-600" />
              When
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'upcoming', label: 'Upcoming', icon: Clock },
                { value: 'ongoing', label: 'Happening Now', icon: Sparkles },
                { value: 'past', label: 'Past Events', icon: CalendarIcon },
                { value: 'all', label: 'All Events', icon: null }
              ].map((timeOption) => (
                <button
                  key={timeOption.value}
                  onClick={() => setLocalTime(timeOption.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localTime === timeOption.value
                      ? timeOption.value === 'upcoming'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : timeOption.value === 'ongoing'
                        ? 'bg-green-500 text-white shadow-lg'
                        : timeOption.value === 'past'
                        ? 'bg-gray-500 text-white shadow-lg'
                        : 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {timeOption.icon && <timeOption.icon className="h-4 w-4" />}
                  {timeOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-pink-600" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 font-medium"
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
              <option value="date">Date (Soonest)</option>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
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
