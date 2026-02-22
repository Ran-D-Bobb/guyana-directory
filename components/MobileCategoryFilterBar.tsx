'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  X,
  MapPin,
  ArrowUpDown,
  Star,
  BadgeCheck,
  Check,
  Store,
  ShoppingBag,
  UtensilsCrossed,
  Wrench,
  Briefcase,
  Shirt,
  Home as HomeIcon,
  Heart,
  Laptop,
  GraduationCap,
  Music,
  Camera,
  Dumbbell,
  Leaf,
  Car,
  Plane,
  PawPrint,
  Baby,
  Gift,
  Coffee,
  Package,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type Category = Database['public']['Tables']['categories']['Row'] & {
  business_count?: number
}

interface MobileCategoryFilterBarProps {
  categories: Category[]
  currentCategorySlug?: string
  regions: Array<{ id: string; name: string; slug?: string }>
  currentFilters?: {
    region?: string
    sort?: string
    rating?: string
    verified?: string
    featured?: string
  }
  basePath?: string // e.g., '/businesses' or '/rentals'
  categoryPath?: string // e.g., '/businesses/category' or '/rentals/category'
  categoryTags?: Array<{ id: string; name: string; slug: string }>
  selectedTags?: string[]
}

const iconMap: Record<string, LucideIcon> = {
  Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, HomeIcon, Heart, Laptop,
  GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package
}

export function MobileCategoryFilterBar({
  categories,
  currentCategorySlug,
  regions,
  currentFilters = {},
  basePath = '/businesses',
  categoryPath = '/businesses/category',
  categoryTags = [],
  selectedTags = [],
}: MobileCategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local filter state
  const [localRegion, setLocalRegion] = useState(currentFilters.region || 'all')
  const [localSort, setLocalSort] = useState(currentFilters.sort || 'featured')
  const [localRating, setLocalRating] = useState(currentFilters.rating || 'all')
  const [localVerified, setLocalVerified] = useState(currentFilters.verified === 'true')
  const [localTags, setLocalTags] = useState<string[]>(selectedTags)

  // Sync local state when URL changes
  const filterRegion = currentFilters.region
  const filterSort = currentFilters.sort
  const filterRating = currentFilters.rating
  const filterVerified = currentFilters.verified
  const tagsKey = selectedTags.join(',')

  useEffect(() => {
    setLocalRegion(filterRegion || 'all')
    setLocalSort(filterSort || 'featured')
    setLocalRating(filterRating || 'all')
    setLocalVerified(filterVerified === 'true')
    setLocalTags(tagsKey ? tagsKey.split(',') : [])
  }, [filterRegion, filterSort, filterRating, filterVerified, tagsKey])

  // Count active filters
  const activeFiltersCount = [
    currentFilters.region && currentFilters.region !== 'all',
    currentFilters.sort && currentFilters.sort !== 'featured',
    currentFilters.rating && currentFilters.rating !== 'all',
    currentFilters.verified === 'true',
    selectedTags.length > 0,
  ].filter(Boolean).length

  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localRating !== 'all',
    localVerified,
    localTags.length > 0,
  ].filter(Boolean).length

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')

    if (localRegion !== 'all') {
      params.set('region', localRegion)
    } else {
      params.delete('region')
    }

    if (localSort !== 'featured') {
      params.set('sort', localSort)
    } else {
      params.delete('sort')
    }

    if (localRating !== 'all') {
      params.set('rating', localRating)
    } else {
      params.delete('rating')
    }

    if (localVerified) {
      params.set('verified', 'true')
    } else {
      params.delete('verified')
    }

    if (localTags.length > 0) {
      params.set('tags', localTags.join(','))
    } else {
      params.delete('tags')
    }

    router.push(`${pathname}?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalRating('all')
    setLocalVerified(false)
    setLocalTags([])
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
    params.delete('page') // Reset page on category change
    params.delete('category') // Remove category param since it's in the path
    params.delete('tags') // Clear stale tags from previous category
    const queryString = params.toString()

    if (!categorySlug) {
      return queryString ? `${basePath}?${queryString}` : basePath
    }
    return queryString ? `${categoryPath}/${categorySlug}?${queryString}` : `${categoryPath}/${categorySlug}`
  }

  return (
    <>
      {/* Category Pills Bar - Mobile Only - Using fixed instead of sticky due to body overflow-x:hidden breaking sticky */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        >
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-6 bg-gray-200" />

          {/* All Categories Pill */}
          <Link
            href={buildCategoryUrl()}
            data-active={!currentCategorySlug}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              !currentCategorySlug
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Check className={`h-3.5 w-3.5 ${!currentCategorySlug ? 'opacity-100' : 'opacity-0 w-0'}`} />
            <span>All</span>
            <span className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
              {categories.reduce((sum, c) => sum + (c.business_count || 0), 0)}
            </span>
          </Link>

          {/* Category Pills */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Store : Store
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={buildCategoryUrl(category.slug)}
                data-active={isActive}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{category.name}</span>
                {category.business_count !== undefined && (
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.business_count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
      {/* Spacer for fixed filter bar on mobile */}
      <div className="lg:hidden h-[52px]" />

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
          {/* Quick Toggles */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalVerified(!localVerified)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  localVerified
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <BadgeCheck className="h-4 w-4" />
                Verified Only
              </button>

            </div>
          </div>

          {/* Tags */}
          {categoryTags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setLocalTags(prev =>
                        prev.includes(tag.slug)
                          ? prev.filter(s => s !== tag.slug)
                          : [...prev, tag.slug]
                      )
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      localTags.includes(tag.slug)
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
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
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
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
                  onClick={() => setLocalRating(rating)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localRating === rating
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {rating === 'all' ? 'Any Rating' : `${rating}+ Stars`}
                </button>
              ))}
            </div>
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
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg transition-all"
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
