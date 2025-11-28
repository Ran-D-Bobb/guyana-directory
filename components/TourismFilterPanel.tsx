'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, MapPin, ChevronDown, SlidersHorizontal, Star, Clock, Mountain, DollarSign, TrendingUp, Sparkles } from 'lucide-react'

interface TourismFilterPanelProps {
  regions?: Array<{ id: string; name: string; slug?: string | null }>
  currentFilters?: {
    region?: string
    difficulty?: string
    duration?: string
    sort?: string
  }
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'expert', label: 'Expert' },
]

const durationOptions = [
  { value: 'quick', label: '1-2 hrs' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'multi_day', label: 'Multi-Day' },
]

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: Sparkles },
  { value: 'price_low', label: 'Price ↑', icon: DollarSign },
  { value: 'price_high', label: 'Price ↓', icon: DollarSign },
  { value: 'rating', label: 'Top Rated', icon: Star },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
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

export function TourismFilterPanel({ regions = [], currentFilters = {} }: TourismFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const activeFilterCount = [
    currentFilters.region && currentFilters.region !== 'all',
    currentFilters.difficulty && currentFilters.difficulty !== 'all',
    currentFilters.duration && currentFilters.duration !== 'all',
    currentFilters.sort && currentFilters.sort !== 'featured',
  ].filter(Boolean).length

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'sort' && value === 'featured') {
      params.delete(key)
    } else if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('region')
    params.delete('difficulty')
    params.delete('duration')
    params.delete('sort')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // Get display labels
  const regionLabel = regions.find(r => r.id === currentFilters.region)?.name || 'Location'
  const difficultyLabel = difficultyOptions.find(d => d.value === currentFilters.difficulty)?.label || 'Difficulty'
  const durationLabel = durationOptions.find(d => d.value === currentFilters.duration)?.label || 'Duration'

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-3 relative z-40">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>

        {/* Difficulty Dropdown */}
        <FilterDropdown
          label={difficultyLabel}
          icon={Mountain}
          iconColor="text-emerald-500"
          isOpen={openDropdown === 'difficulty'}
          onToggle={() => toggleDropdown('difficulty')}
          hasValue={!!currentFilters.difficulty && currentFilters.difficulty !== 'all'}
        >
          <div className="space-y-1 min-w-[150px]">
            <button
              onClick={() => { updateFilters('difficulty', ''); setOpenDropdown(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !currentFilters.difficulty || currentFilters.difficulty === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              All Levels
            </button>
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { updateFilters('difficulty', option.value); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentFilters.difficulty === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        {/* Duration Dropdown */}
        <FilterDropdown
          label={durationLabel}
          icon={Clock}
          iconColor="text-cyan-500"
          isOpen={openDropdown === 'duration'}
          onToggle={() => toggleDropdown('duration')}
          hasValue={!!currentFilters.duration && currentFilters.duration !== 'all'}
        >
          <div className="space-y-1 min-w-[150px]">
            <button
              onClick={() => { updateFilters('duration', ''); setOpenDropdown(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !currentFilters.duration || currentFilters.duration === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Any Duration
            </button>
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { updateFilters('duration', option.value); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentFilters.duration === option.value
                    ? 'bg-cyan-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
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
            hasValue={!!currentFilters.region && currentFilters.region !== 'all'}
          >
            <div className="max-h-[250px] overflow-y-auto space-y-1 min-w-[180px]">
              <button
                onClick={() => { updateFilters('region', ''); setOpenDropdown(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !currentFilters.region || currentFilters.region === 'all'
                    ? 'bg-teal-500 text-white'
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
                      ? 'bg-teal-500 text-white'
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
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('sort', option.value)}
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
