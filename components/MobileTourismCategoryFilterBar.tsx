'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  X,
  MapPin,
  ArrowUpDown,
  Mountain,
  Clock,
  Search,
  Check,
  Plane,
  Trees,
  Activity,
  Users,
  Home,
  Map,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Compass,
  Car,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismCategory = Database['public']['Tables']['tourism_categories']['Row'] & {
  experience_count?: number
}

interface MobileTourismCategoryFilterBarProps {
  categories: TourismCategory[]
  currentCategorySlug?: string
  regions: Array<{ id: string; name: string }>
}

const iconMap: Record<string, LucideIcon> = {
  Trees, Activity, Users, Home, Map, Waves, Utensils, Landmark, Camera, Bird, Compass, Car, Plane
}

export function MobileTourismCategoryFilterBar({
  categories,
  currentCategorySlug,
  regions
}: MobileTourismCategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local filter state
  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || 'all')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'featured')
  const [localDifficulty, setLocalDifficulty] = useState(searchParams.get('difficulty') || 'all')
  const [localDuration, setLocalDuration] = useState(searchParams.get('duration') || 'all')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Sync local state when URL changes
  useEffect(() => {
    setLocalRegion(searchParams.get('region') || 'all')
    setLocalSort(searchParams.get('sort') || 'featured')
    setLocalDifficulty(searchParams.get('difficulty') || 'all')
    setLocalDuration(searchParams.get('duration') || 'all')
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Count active filters
  const activeFiltersCount = [
    searchParams.get('region') && searchParams.get('region') !== 'all',
    searchParams.get('sort') && searchParams.get('sort') !== 'featured',
    searchParams.get('difficulty') && searchParams.get('difficulty') !== 'all',
    searchParams.get('duration') && searchParams.get('duration') !== 'all',
    searchParams.get('q')
  ].filter(Boolean).length

  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localDifficulty !== 'all',
    localDuration !== 'all',
    searchQuery.trim()
  ].filter(Boolean).length

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (localRegion !== 'all') params.set('region', localRegion)
    if (localSort !== 'featured') params.set('sort', localSort)
    if (localDifficulty !== 'all') params.set('difficulty', localDifficulty)
    if (localDuration !== 'all') params.set('duration', localDuration)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    router.push(`${pathname}?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalDifficulty('all')
    setLocalDuration('all')
    setSearchQuery('')
  }

  // Scroll active category into view (within container only)
  useEffect(() => {
    if (scrollRef.current && currentCategorySlug) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) {
        const container = scrollRef.current
        const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
  }, [currentCategorySlug])

  // Build URL with current search params preserved
  const buildCategoryUrl = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    const queryString = params.toString()

    if (!categorySlug) {
      return queryString ? `/tourism?${queryString}` : '/tourism'
    }
    return queryString ? `/tourism/category/${categorySlug}?${queryString}` : `/tourism/category/${categorySlug}`
  }

  return (
    <>
      {/* Category Pills Bar - Mobile Only */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        >
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              activeFiltersCount > 0
                ? 'bg-teal-50 border-teal-500 text-teal-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-500 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-6 bg-gray-200" />

          {/* All Experiences Pill */}
          <Link
            href={buildCategoryUrl()}
            data-active={!currentCategorySlug}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              !currentCategorySlug
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Check className={`h-3.5 w-3.5 ${!currentCategorySlug ? 'opacity-100' : 'opacity-0 w-0'}`} />
            <span>All</span>
            <span className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
              {categories.reduce((sum, c) => sum + (c.experience_count || 0), 0)}
            </span>
          </Link>

          {/* Category Pills */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Plane : Plane
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={buildCategoryUrl(category.slug)}
                data-active={isActive}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{category.name}</span>
                {category.experience_count !== undefined && (
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.experience_count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Filter Sheet Backdrop */}
      {isFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Filter Sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isFilterOpen ? 'translate-y-0' : 'translate-y-full'
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
            <SlidersHorizontal className="h-6 w-6 text-gray-900" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              {localActiveFiltersCount > 0 && (
                <p className="text-sm text-gray-600">{localActiveFiltersCount} active</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(false)}
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
                { value: 'half_day', label: 'Half Day' },
                { value: 'full_day', label: 'Full Day' },
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 safe-area-inset-bottom">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg transition-all"
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
