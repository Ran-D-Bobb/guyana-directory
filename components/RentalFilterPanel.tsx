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

// Premium dropdown component
function FilterDropdown({
  label,
  icon: Icon,
  iconGradient,
  children,
  isOpen,
  onToggle,
  hasValue
}: {
  label: string
  icon: React.ElementType
  iconGradient: string
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
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
          hasValue
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/25'
            : 'glass text-gray-700 hover:bg-white/90 border-white/50'
        }`}
      >
        <div className={`p-1 rounded-lg ${hasValue ? 'bg-white/20' : iconGradient}`}>
          <Icon className={`h-3.5 w-3.5 ${hasValue ? 'text-white' : 'text-white'}`} />
        </div>
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${hasValue ? 'text-white/80' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 glass rounded-2xl shadow-2xl border border-white/30 p-4 z-[100] min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
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
    <div className="glass rounded-2xl p-4 relative z-40 border border-white/40 shadow-lg">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Label */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-gray-200/50">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-md">
            <SlidersHorizontal className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-700">Filters</span>
        </div>

        {/* Quick Amenity Toggles */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200/50">
          {topAmenities.map((amenity) => {
            const Icon = amenity.icon
            const isSelected = selectedAmenities.includes(amenity.value)
            return (
              <button
                key={amenity.value}
                onClick={() => toggleAmenity(amenity.value)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-md border border-gray-100'
                }`}
                title={amenity.value}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                <span className="hidden xl:inline">{amenity.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bedrooms Dropdown */}
        <FilterDropdown
          label={bedsLabel}
          icon={BedDouble}
          iconGradient="bg-gradient-to-br from-blue-500 to-indigo-500"
          isOpen={openDropdown === 'beds'}
          onToggle={() => toggleDropdown('beds')}
          hasValue={!!currentFilters.beds}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bedrooms</p>
          <div className="grid grid-cols-3 gap-2">
            {['', '1', '2', '3', '4', '5+'].map((beds) => (
              <button
                key={beds}
                onClick={() => { updateFilters('beds', beds); setOpenDropdown(null) }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  (currentFilters.beds || '') === beds
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
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
          iconGradient="bg-gradient-to-br from-purple-500 to-pink-500"
          isOpen={openDropdown === 'baths'}
          onToggle={() => toggleDropdown('baths')}
          hasValue={!!currentFilters.baths}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bathrooms</p>
          <div className="grid grid-cols-3 gap-2">
            {['', '1', '2', '3', '4+'].map((baths) => (
              <button
                key={baths}
                onClick={() => { updateFilters('baths', baths); setOpenDropdown(null) }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  (currentFilters.baths || '') === baths
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
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
          iconGradient="bg-gradient-to-br from-green-500 to-emerald-500"
          isOpen={openDropdown === 'price'}
          onToggle={() => toggleDropdown('price')}
          hasValue={!!(currentFilters.price_min || currentFilters.price_max)}
        >
          <div className="w-[240px]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range (GYD/month)</p>
            <div className="flex gap-2 items-center mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-300 mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Max</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Apply Price Filter
            </button>
          </div>
        </FilterDropdown>

        {/* Location Dropdown */}
        {regions.length > 0 && (
          <FilterDropdown
            label={regionLabel}
            icon={MapPin}
            iconGradient="bg-gradient-to-br from-rose-500 to-red-500"
            isOpen={openDropdown === 'region'}
            onToggle={() => toggleDropdown('region')}
            hasValue={!!currentFilters.region}
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Region</p>
            <div className="max-h-[280px] overflow-y-auto space-y-1.5 scrollbar-thin">
              <button
                onClick={() => { updateFilters('region', ''); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  !currentFilters.region
                    ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md'
                    : 'hover:bg-gray-100/80 text-gray-700'
                }`}
              >
                All Regions
              </button>
              {regions.map((region) => (
                <button
                  key={region.slug}
                  onClick={() => { updateFilters('region', region.slug); setOpenDropdown(null) }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentFilters.region === region.slug
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md'
                      : 'hover:bg-gray-100/80 text-gray-700'
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
        <div className="flex items-center gap-1.5 pl-4 border-l border-gray-200/50">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilters('sort', option.value === 'newest' ? '' : option.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                (currentFilters.sort || 'newest') === option.value
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:bg-white/80 hover:text-gray-700 hover:shadow-sm'
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
            className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all ml-2 border border-rose-200"
          >
            <X className="h-3.5 w-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )
}
