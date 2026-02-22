'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, MapPin, ChevronDown, SlidersHorizontal, Star, Sparkles, Clock, BadgeCheck } from 'lucide-react'

interface BusinessFilterPanelProps {
  regions?: Array<{ id: string; name: string; slug: string | null }>
  currentFilters?: {
    region?: string
    sort?: string
    rating?: string
    verified?: string
    featured?: string
  }
  categoryTags?: Array<{ id: string; name: string; slug: string }>
  selectedTags?: string[]
}

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: Sparkles },
  { value: 'rating', label: 'Top Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
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

export function BusinessFilterPanel({ regions = [], currentFilters = {}, categoryTags = [], selectedTags = [] }: BusinessFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const activeFilterCount = [
    currentFilters.region && currentFilters.region !== 'all',
    currentFilters.sort && currentFilters.sort !== 'featured',
    currentFilters.rating && currentFilters.rating !== 'all',
    currentFilters.verified === 'true',
    selectedTags.length > 0,
  ].filter(Boolean).length

  const toggleTagFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentTags = params.get('tags')?.split(',').filter(Boolean) || []
    const newTags = currentTags.includes(slug)
      ? currentTags.filter(s => s !== slug)
      : [...currentTags, slug]
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','))
    } else {
      params.delete('tags')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('region')
    params.delete('sort')
    params.delete('rating')
    params.delete('verified')
    params.delete('tags')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleFilter = (key: string, currentValue: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentValue === 'true') {
      params.delete(key)
    } else {
      params.set(key, 'true')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // Get display labels
  const regionLabel = regions.find(r => r.id === currentFilters.region || r.slug === currentFilters.region)?.name || 'Location'

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-3 relative z-40">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>

        {/* Location Dropdown */}
        {regions.length > 0 && (
          <FilterDropdown
            label={regionLabel}
            icon={MapPin}
            iconColor="text-red-500"
            isOpen={openDropdown === 'region'}
            onToggle={() => toggleDropdown('region')}
            hasValue={!!currentFilters.region && currentFilters.region !== 'all'}
          >
            <div className="max-h-[250px] overflow-y-auto space-y-1 min-w-[180px]">
              <button
                onClick={() => { updateFilters('region', ''); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !currentFilters.region || currentFilters.region === 'all'
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                All Regions
              </button>
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => { updateFilters('region', region.id); setOpenDropdown(null) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentFilters.region === region.id
                      ? 'bg-emerald-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </FilterDropdown>
        )}

        {/* Rating Dropdown */}
        <FilterDropdown
          label={currentFilters.rating && currentFilters.rating !== 'all' ? `${currentFilters.rating}+ Stars` : 'Rating'}
          icon={Star}
          iconColor="text-amber-500"
          isOpen={openDropdown === 'rating'}
          onToggle={() => toggleDropdown('rating')}
          hasValue={!!currentFilters.rating && currentFilters.rating !== 'all'}
        >
          <div className="space-y-1 min-w-[140px]">
            {['all', '2', '3', '4'].map((rating) => (
              <button
                key={rating}
                onClick={() => { updateFilters('rating', rating === 'all' ? '' : rating); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  (currentFilters.rating || 'all') === rating
                    ? 'bg-amber-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {rating === 'all' ? 'Any Rating' : `${rating}+ Stars`}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Quick Toggle Filters */}
        <button
          onClick={() => toggleFilter('verified', currentFilters.verified)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            currentFilters.verified === 'true'
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <BadgeCheck className="h-4 w-4" />
          <span>Verified</span>
        </button>

        {/* Tag Chips */}
        {categoryTags.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            {categoryTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagFilter(tag.slug)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedTags.includes(tag.slug)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Pills */}
        <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('sort', option.value === 'featured' ? '' : option.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  (currentFilters.sort || 'featured') === option.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            )
          })}
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
