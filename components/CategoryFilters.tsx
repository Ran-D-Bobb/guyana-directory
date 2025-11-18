'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MapPin, ArrowUpDown } from 'lucide-react'

interface CategoryFiltersProps {
  regions: Array<{ id: string; name: string }>
}

export function CategoryFilters({ regions }: CategoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentRegion = searchParams.get('region') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' && key === 'region') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Region Filter */}
      <div className="flex-1">
        <label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <MapPin className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          Region
        </label>
        <select
          id="region"
          name="region"
          className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer text-gray-900 font-medium"
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

      {/* Sort */}
      <div className="flex-1">
        <label htmlFor="sort" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <ArrowUpDown className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          Sort By
        </label>
        <select
          id="sort"
          name="sort"
          className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer text-gray-900 font-medium"
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="featured">Featured First</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  )
}
