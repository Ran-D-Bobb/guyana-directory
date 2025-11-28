'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Wifi, Wind, Car, BedDouble, Bath, DollarSign, MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react'

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

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'price_low', label: 'Price ↑' },
  { value: 'price_high', label: 'Price ↓' },
  { value: 'rating', label: 'Top Rated' },
]

const topAmenities = [
  { value: 'WiFi', label: 'WiFi', icon: Wifi },
  { value: 'Air Conditioning', label: 'AC', icon: Wind },
  { value: 'Parking', label: 'Parking', icon: Car },
]

// Dropdown component for consistent styling
function FilterDropdown({
  label,
  icon: Icon,
  iconColor,
  children,
  isOpen,
  onToggle,
  hasValue
}: {
  label: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  hasValue: boolean
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
          hasValue
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Icon className={`h-4 w-4 ${hasValue ? 'text-white' : iconColor}`} />
        <span>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${hasValue ? 'text-white/70' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[100] min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export function RentalFilterPanel({ regions = [], currentFilters = {} }: RentalFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [localPriceMin, setLocalPriceMin] = useState(currentFilters.price_min || '')
  const [localPriceMax, setLocalPriceMax] = useState(currentFilters.price_max || '')

  const selectedAmenities = currentFilters.amenities ? currentFilters.amenities.split(',') : []

  const activeFilterCount = [
    currentFilters.beds,
    currentFilters.baths,
    currentFilters.price_min,
    currentFilters.price_max,
    currentFilters.region,
    currentFilters.sort && currentFilters.sort !== 'newest',
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
      amenities = amenities.filter(a => a !== amenity)
    } else {
      amenities.push(amenity)
    }
    if (amenities.length > 0) {
      params.set('amenities', amenities.join(','))
    } else {
      params.delete('amenities')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (localPriceMin) params.set('price_min', localPriceMin)
    else params.delete('price_min')
    if (localPriceMax) params.set('price_max', localPriceMax)
    else params.delete('price_max')
    router.push(`${pathname}?${params.toString()}`)
    setOpenDropdown(null)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('beds')
    params.delete('baths')
    params.delete('price_min')
    params.delete('price_max')
    params.delete('region')
    params.delete('amenities')
    params.delete('sort')
    setLocalPriceMin('')
    setLocalPriceMax('')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // Get display labels
  const bedsLabel = currentFilters.beds ? `${currentFilters.beds} Bed${currentFilters.beds === '1' ? '' : 's'}` : 'Beds'
  const bathsLabel = currentFilters.baths ? `${currentFilters.baths} Bath${currentFilters.baths === '1' ? '' : 's'}` : 'Baths'
  const priceLabel = currentFilters.price_min || currentFilters.price_max
    ? `$${currentFilters.price_min || '0'} - $${currentFilters.price_max || '∞'}`
    : 'Price'
  const regionLabel = regions.find(r => r.slug === currentFilters.region)?.name || 'Location'

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-3 relative z-40">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>

        {/* Quick Amenity Toggles */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          {topAmenities.map((amenity) => {
            const Icon = amenity.icon
            const isSelected = selectedAmenities.includes(amenity.value)
            return (
              <button
                key={amenity.value}
                onClick={() => toggleAmenity(amenity.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={amenity.value}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{amenity.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bedrooms Dropdown */}
        <FilterDropdown
          label={bedsLabel}
          icon={BedDouble}
          iconColor="text-blue-500"
          isOpen={openDropdown === 'beds'}
          onToggle={() => toggleDropdown('beds')}
          hasValue={!!currentFilters.beds}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {['', '1', '2', '3', '4', '5+'].map((beds) => (
              <button
                key={beds}
                onClick={() => { updateFilters('beds', beds); setOpenDropdown(null) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  (currentFilters.beds || '') === beds
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {beds === '' ? 'Any' : beds}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Bathrooms Dropdown */}
        <FilterDropdown
          label={bathsLabel}
          icon={Bath}
          iconColor="text-indigo-500"
          isOpen={openDropdown === 'baths'}
          onToggle={() => toggleDropdown('baths')}
          hasValue={!!currentFilters.baths}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {['', '1', '2', '3', '4+'].map((baths) => (
              <button
                key={baths}
                onClick={() => { updateFilters('baths', baths); setOpenDropdown(null) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  (currentFilters.baths || '') === baths
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {baths === '' ? 'Any' : baths}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Price Dropdown */}
        <FilterDropdown
          label={priceLabel}
          icon={DollarSign}
          iconColor="text-green-500"
          isOpen={openDropdown === 'price'}
          onToggle={() => toggleDropdown('price')}
          hasValue={!!(currentFilters.price_min || currentFilters.price_max)}
        >
          <div className="space-y-3 w-[220px]">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price Range (GYD/month)</div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={localPriceMin}
                onChange={(e) => setLocalPriceMin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </FilterDropdown>

        {/* Location Dropdown */}
        {regions.length > 0 && (
          <FilterDropdown
            label={regionLabel}
            icon={MapPin}
            iconColor="text-red-500"
            isOpen={openDropdown === 'region'}
            onToggle={() => toggleDropdown('region')}
            hasValue={!!currentFilters.region}
          >
            <div className="max-h-[250px] overflow-y-auto space-y-1 min-w-[180px]">
              <button
                onClick={() => { updateFilters('region', ''); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !currentFilters.region
                    ? 'bg-red-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                All Regions
              </button>
              {regions.map((region) => (
                <button
                  key={region.slug}
                  onClick={() => { updateFilters('region', region.slug); setOpenDropdown(null) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentFilters.region === region.slug
                      ? 'bg-red-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </FilterDropdown>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Pills */}
        <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilters('sort', option.value === 'newest' ? '' : option.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (currentFilters.sort || 'newest') === option.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors ml-2"
          >
            <X className="h-3.5 w-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )
}
