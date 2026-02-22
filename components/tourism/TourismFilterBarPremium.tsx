'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  X,
  ChevronDown,
  SlidersHorizontal,
  MapPin,
  Mountain,
  Clock,
  Sparkles,
  Star,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface TourismFilterBarPremiumProps {
  regions?: Array<{ id: string; name: string }>
  currentFilters?: {
    region?: string
    difficulty?: string
    duration?: string
    sort?: string
  }
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-amber-600' },
  { value: 'challenging', label: 'Challenging', color: 'text-orange-600' },
  { value: 'expert', label: 'Expert', color: 'text-red-600' },
]

const durationOptions = [
  { value: 'quick', label: '1-2 hours' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'multi_day', label: 'Multi-Day' },
]

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: Sparkles },
  { value: 'rating', label: 'Top Rated', icon: Star },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'price_low', label: 'Price: Low', icon: DollarSign },
  { value: 'price_high', label: 'Price: High', icon: DollarSign },
]

interface DropdownProps {
  label: string
  icon: React.ElementType
  iconColor: string
  options: Array<{ value: string; label: string; color?: string }>
  value: string
  onChange: (value: string) => void
  allLabel: string
}

function FilterDropdown({ label, icon: Icon, iconColor, options, value, onChange, allLabel }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)
  const hasValue = !!value && value !== 'all'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
          hasValue
            ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <Icon className={`w-4 h-4 ${hasValue ? 'text-white' : iconColor}`} />
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${hasValue ? 'text-white/70' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => { onChange(''); setIsOpen(false) }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
              !hasValue ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {allLabel}
          </button>
          <div className="h-px bg-gray-100 my-1" />
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                value === option.value
                  ? 'bg-emerald-50 text-emerald-700'
                  : `text-gray-700 hover:bg-gray-50 ${option.color || ''}`
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TourismFilterBarPremium({ regions = [], currentFilters = {} }: TourismFilterBarPremiumProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  return (
    <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Label */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
          <div className="p-2 bg-gray-100 rounded-lg">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">Filters</span>
        </div>

        {/* Difficulty */}
        <FilterDropdown
          label="Difficulty"
          icon={Mountain}
          iconColor="text-orange-500"
          options={difficultyOptions}
          value={currentFilters.difficulty || ''}
          onChange={(v) => updateFilters('difficulty', v)}
          allLabel="Any Difficulty"
        />

        {/* Duration */}
        <FilterDropdown
          label="Duration"
          icon={Clock}
          iconColor="text-cyan-500"
          options={durationOptions}
          value={currentFilters.duration || ''}
          onChange={(v) => updateFilters('duration', v)}
          allLabel="Any Duration"
        />

        {/* Location */}
        {regions.length > 0 && (
          <FilterDropdown
            label="Location"
            icon={MapPin}
            iconColor="text-teal-500"
            options={regions.map(r => ({ value: r.id, label: r.name }))}
            value={currentFilters.region || ''}
            onChange={(v) => updateFilters('region', v)}
            allLabel="All Locations"
          />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Options */}
        <div className="flex items-center gap-1 pl-4 border-l border-gray-200">
          <span className="text-xs text-gray-500 font-medium mr-2 hidden lg:block">Sort:</span>
          {sortOptions.map((option) => {
            const Icon = option.icon
            const isActive = (currentFilters.sort || 'featured') === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('sort', option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title={option.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )
}
