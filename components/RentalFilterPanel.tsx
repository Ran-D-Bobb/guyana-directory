'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, ChevronUp, X, Wifi, Wind, Car } from 'lucide-react'

interface RentalFilterPanelProps {
  regions?: Array<{ name: string; slug: string }>
  currentFilters?: {
    beds?: string
    baths?: string
    price_min?: string
    price_max?: string
    region?: string
    sort?: string
    amenities?: string
  }
}

const bedroomOptions = [
  { value: '0', label: 'Studio' },
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4+', label: '4+ Bedrooms' },
]

const bathroomOptions = [
  { value: '1', label: '1 Bathroom' },
  { value: '1.5', label: '1.5 Bathrooms' },
  { value: '2', label: '2 Bathrooms' },
  { value: '2.5', label: '2.5 Bathrooms' },
  { value: '3+', label: '3+ Bathrooms' },
]

const sortOptions = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
]

const topAmenities = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'ac', label: 'AC', icon: Wind },
  { value: 'parking', label: 'Parking', icon: Car },
]

export function RentalFilterPanel({ regions = [], currentFilters = {} }: RentalFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)

  // Parse amenities from comma-separated string
  const selectedAmenities = currentFilters.amenities ? currentFilters.amenities.split(',') : []

  const activeFilterCount = [
    currentFilters.beds,
    currentFilters.baths,
    currentFilters.price_min,
    currentFilters.price_max,
    currentFilters.region,
    ...selectedAmenities,
  ].filter(Boolean).length

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleAmenity = (amenity: string) => {
    const params = new URLSearchParams(searchParams.toString())
    let amenities = selectedAmenities.filter(Boolean)

    if (amenities.includes(amenity)) {
      // Remove amenity
      amenities = amenities.filter(a => a !== amenity)
    } else {
      // Add amenity
      amenities.push(amenity)
    }

    if (amenities.length > 0) {
      params.set('amenities', amenities.join(','))
    } else {
      params.delete('amenities')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('beds')
    params.delete('baths')
    params.delete('price_min')
    params.delete('price_max')
    params.delete('region')
    params.delete('amenities')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-200">
          {/* Quick Amenities Filter Chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {topAmenities.map((amenity) => {
                const Icon = amenity.icon
                const isSelected = selectedAmenities.includes(amenity.value)
                return (
                  <button
                    key={amenity.value}
                    onClick={() => toggleAmenity(amenity.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{amenity.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (GYD/month)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={currentFilters.price_min || ''}
                onBlur={(e) => updateFilters('price_min', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={currentFilters.price_max || ''}
                onBlur={(e) => updateFilters('price_max', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              value={currentFilters.beds || ''}
              onChange={(e) => updateFilters('beds', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Any</option>
              {bedroomOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              value={currentFilters.baths || ''}
              onChange={(e) => updateFilters('baths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Any</option>
              {bathroomOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          {regions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={currentFilters.region || ''}
                onChange={(e) => updateFilters('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region.slug} value={region.slug}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={currentFilters.sort || 'newest'}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
