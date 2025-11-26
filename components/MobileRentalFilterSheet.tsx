'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Filter, MapPin, ArrowUpDown, Wifi, Wind, Car, Search, BedDouble, Bath, DollarSign } from 'lucide-react'

interface MobileRentalFilterSheetProps {
  regions: Array<{ name: string; slug: string }>
}

export function MobileRentalFilterSheet({ regions }: MobileRentalFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || '')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'newest')
  const [localBeds, setLocalBeds] = useState(searchParams.get('beds') || '')
  const [localBaths, setLocalBaths] = useState(searchParams.get('baths') || '')
  const [localPriceMin, setLocalPriceMin] = useState(searchParams.get('price_min') || '')
  const [localPriceMax, setLocalPriceMax] = useState(searchParams.get('price_max') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const currentAmenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []
  const [localAmenities, setLocalAmenities] = useState<string[]>(currentAmenities)

  const toggleAmenity = (amenity: string) => {
    setLocalAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

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
    setIsOpen(false)
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

  // Count active filters based on URL params (for button badge)
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

  // Count local filters (for sheet display)
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

  const topAmenities = [
    { value: 'WiFi', label: 'WiFi', icon: Wifi },
    { value: 'Air Conditioning', label: 'AC', icon: Wind },
    { value: 'Parking', label: 'Parking', icon: Car },
  ]

  return (
    <>
      {/* Floating Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] right-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open filters"
      >
        <Filter className="h-5 w-5" strokeWidth={2.5} />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-green-600 text-[10px] font-bold shadow-md">
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
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              Top Amenities
            </label>
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
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
              <input
                type="number"
                placeholder="Max"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
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
                  {beds === '' ? 'Any' : beds === '4+' ? '4+' : `${beds} Bed${beds === '1' ? '' : 's'}`}
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
                  {baths === '' ? 'Any' : baths === '3+' ? '3+' : `${baths} Bath${baths === '1' ? '' : 's'}`}
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
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
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
              className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/50 transition-all"
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
