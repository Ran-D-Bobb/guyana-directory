'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  X,
  MapPin,
  ArrowUpDown,
  Wifi,
  Wind,
  Car,
  Search,
  BedDouble,
  Bath,
  DollarSign,
  Check,
  Home,
  Building,
  Building2,
  Hotel,
  Briefcase,
  Store,
  Users,
  Mountain,
  Palmtree,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type RentalCategory = Database['public']['Tables']['rental_categories']['Row'] & {
  listing_count?: number
}

interface MobileRentalCategoryFilterBarProps {
  categories: RentalCategory[]
  currentCategorySlug?: string
  regions: Array<{ name: string; slug: string }>
}

const iconMap: Record<string, LucideIcon> = {
  Home, Building, Building2, Hotel, BedDouble, Briefcase, Store, Users, Mountain, Palmtree, MapPin
}

export function MobileRentalCategoryFilterBar({
  categories,
  currentCategorySlug,
  regions
}: MobileRentalCategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local filter state
  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || '')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'newest')
  const [localBeds, setLocalBeds] = useState(searchParams.get('beds') || '')
  const [localBaths, setLocalBaths] = useState(searchParams.get('baths') || '')
  const [localPriceMin, setLocalPriceMin] = useState(searchParams.get('price_min') || '')
  const [localPriceMax, setLocalPriceMax] = useState(searchParams.get('price_max') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const currentAmenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []
  const [localAmenities, setLocalAmenities] = useState<string[]>(currentAmenities)

  // Sync local state when URL changes
  useEffect(() => {
    setLocalRegion(searchParams.get('region') || '')
    setLocalSort(searchParams.get('sort') || 'newest')
    setLocalBeds(searchParams.get('beds') || '')
    setLocalBaths(searchParams.get('baths') || '')
    setLocalPriceMin(searchParams.get('price_min') || '')
    setLocalPriceMax(searchParams.get('price_max') || '')
    setSearchQuery(searchParams.get('q') || '')
    setLocalAmenities(searchParams.get('amenities')?.split(',').filter(Boolean) || [])
  }, [searchParams])

  const toggleAmenity = (amenity: string) => {
    setLocalAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  // Count active filters
  const activeFiltersCount = [
    searchParams.get('region'),
    searchParams.get('sort') && searchParams.get('sort') !== 'newest',
    searchParams.get('beds'),
    searchParams.get('baths'),
    searchParams.get('price_min'),
    searchParams.get('price_max'),
    searchParams.get('amenities'),
    searchParams.get('q')
  ].filter(Boolean).length

  const localActiveFiltersCount = [
    localRegion,
    localSort !== 'newest',
    localBeds,
    localBaths,
    localPriceMin,
    localPriceMax,
    localAmenities.length > 0,
    searchQuery.trim()
  ].filter(Boolean).length

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (localRegion) params.set('region', localRegion)
    if (localSort !== 'newest') params.set('sort', localSort)
    if (localBeds) params.set('beds', localBeds)
    if (localBaths) params.set('baths', localBaths)
    if (localPriceMin) params.set('price_min', localPriceMin)
    if (localPriceMax) params.set('price_max', localPriceMax)
    if (localAmenities.length > 0) params.set('amenities', localAmenities.join(','))
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    router.push(`${pathname}?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('')
    setLocalSort('newest')
    setLocalBeds('')
    setLocalBaths('')
    setLocalPriceMin('')
    setLocalPriceMax('')
    setLocalAmenities([])
    setSearchQuery('')
  }

  // Scroll active category into view
  useEffect(() => {
    if (scrollRef.current && currentCategorySlug) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [currentCategorySlug])

  // Build URL with current search params preserved
  const buildCategoryUrl = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    const queryString = params.toString()

    if (!categorySlug) {
      return queryString ? `/rentals?${queryString}` : '/rentals'
    }
    return queryString ? `/rentals/category/${categorySlug}?${queryString}` : `/rentals/category/${categorySlug}`
  }

  const topAmenities = [
    { value: 'WiFi', label: 'WiFi', icon: Wifi },
    { value: 'Air Conditioning', label: 'AC', icon: Wind },
    { value: 'Parking', label: 'Parking', icon: Car },
  ]

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
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-6 bg-gray-200" />

          {/* All Rentals Pill */}
          <Link
            href={buildCategoryUrl()}
            data-active={!currentCategorySlug}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              !currentCategorySlug
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Check className={`h-3.5 w-3.5 ${!currentCategorySlug ? 'opacity-100' : 'opacity-0 w-0'}`} />
            <span>All</span>
            <span className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
              {categories.reduce((sum, c) => sum + (c.listing_count || 0), 0)}
            </span>
          </Link>

          {/* Category Pills */}
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'Home'] || Home
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={buildCategoryUrl(category.slug)}
                data-active={isActive}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{category.name}</span>
                {category.listing_count !== undefined && (
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.listing_count}
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
              <Search className="h-4 w-4 text-green-600" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>

          {/* Top Amenities */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">Top Amenities</label>
            <div className="flex flex-wrap gap-2">
              {topAmenities.map((amenity) => {
                const Icon = amenity.icon
                const isSelected = localAmenities.includes(amenity.value)
                return (
                  <button
                    key={amenity.value}
                    onClick={() => toggleAmenity(amenity.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {amenity.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <DollarSign className="h-4 w-4 text-green-600" />
              Price Range (GYD/month)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localPriceMin}
                onChange={(e) => setLocalPriceMin(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
              <input
                type="number"
                placeholder="Max"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <BedDouble className="h-4 w-4 text-blue-600" />
              Bedrooms
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['', '1', '2', '3', '4+'].map((beds) => (
                <button
                  key={beds}
                  onClick={() => setLocalBeds(beds)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localBeds === beds
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {beds === '' ? 'Any' : beds}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Bath className="h-4 w-4 text-indigo-600" />
              Bathrooms
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['', '1', '2', '3+'].map((baths) => (
                <button
                  key={baths}
                  onClick={() => setLocalBaths(baths)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localBaths === baths
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {baths === '' ? 'Any' : baths}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-red-600" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <ArrowUpDown className="h-4 w-4 text-green-600" />
              Sort By
            </label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="featured">Featured First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg transition-all"
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
