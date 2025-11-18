'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SearchFiltersProps {
  regions: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  initialQuery?: string
}

export function SearchFilters({ regions, categories, initialQuery = '' }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const currentRegion = searchParams.get('region') || 'all'
  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'featured'

  // Update query state when initialQuery changes (e.g., browser back/forward)
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (query.trim() === '') {
      return
    }

    const params = new URLSearchParams()
    params.set('q', query.trim())

    if (currentRegion !== 'all') {
      params.set('region', currentRegion)
    }
    if (currentCategory !== 'all') {
      params.set('category', currentCategory)
    }
    if (currentSort !== 'featured') {
      params.set('sort', currentSort)
    }

    router.push(`/search?${params.toString()}`)
  }

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' && (key === 'region' || key === 'category')) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for businesses..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="block w-full sm:w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="region"
            name="region"
            className="block w-full sm:w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            className="block w-full sm:w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="featured">Featured First</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
    </div>
  )
}
