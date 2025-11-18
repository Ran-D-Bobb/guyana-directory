'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, MapPin } from 'lucide-react'

interface EventFiltersProps {
  eventCategories: Array<{ id: string; name: string }>
  regions?: Array<{ id: string; name: string }>
}

export function EventFilters({ eventCategories, regions }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentTimeFilter = searchParams.get('time') || 'upcoming'
  const currentSort = searchParams.get('sort') || 'featured'
  const currentRegion = searchParams.get('region') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' && (key === 'category' || key === 'region')) {
      params.delete(key)
    } else if (value === 'upcoming' && key === 'time') {
      params.delete(key)
    } else if (value === 'featured' && key === 'sort') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Time Filter */}
        <div>
          <label htmlFor="time" className="block text-sm font-bold text-gray-900 mb-2">
            <Calendar className="inline w-4 h-4 mr-1.5 text-purple-600" />
            When
          </label>
          <select
            id="time"
            name="time"
            className="block w-full sm:w-48 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium hover:border-purple-300 transition-colors"
            value={currentTimeFilter}
            onChange={(e) => updateFilter('time', e.target.value)}
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="ongoing">Happening Now</option>
            <option value="all">All Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="block w-full sm:w-48 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium hover:border-purple-300 transition-colors"
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {eventCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        {regions && regions.length > 0 && (
          <div>
            <label htmlFor="region" className="block text-sm font-bold text-gray-900 mb-2">
              <MapPin className="inline w-4 h-4 mr-1.5 text-pink-600" />
              Region
            </label>
            <select
              id="region"
              name="region"
              className="block w-full sm:w-48 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium hover:border-purple-300 transition-colors"
              value={currentRegion}
              onChange={(e) => updateFilter('region', e.target.value)}
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-bold text-gray-900 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            className="block w-full sm:w-48 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium hover:border-purple-300 transition-colors"
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="featured">Featured First</option>
            <option value="date">Date (Soonest)</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
    </div>
  )
}
