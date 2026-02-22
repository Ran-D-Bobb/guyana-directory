'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, MapPin, ChevronDown, Sparkles, CalendarClock, Clock, History, CalendarDays, TrendingUp, Tag, Search } from 'lucide-react'

interface EventFilterPanelProps {
  regions?: Array<{ id: string; name: string; slug?: string | null }>
  currentFilters?: {
    region?: string
    time?: string
    sort?: string
    source?: string
    q?: string
  }
}

const timeOptions = [
  { value: 'upcoming', label: 'Upcoming', icon: CalendarClock },
  { value: 'ongoing', label: 'Now', icon: Clock },
  { value: 'past', label: 'Past', icon: History },
  { value: 'all', label: 'All', icon: CalendarDays },
]

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: Sparkles },
  { value: 'date', label: 'Date', icon: CalendarDays },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
]

// Premium dropdown component with glass effect
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
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          hasValue
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20'
            : 'bg-white/60 text-gray-700 border border-gray-200/80 hover:border-emerald-300 hover:bg-white'
        }`}
      >
        <Icon className={`h-4 w-4 ${hasValue ? 'text-white' : iconColor}`} />
        <span className="max-w-[100px] truncate">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${hasValue ? 'text-white/80' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-emerald-900/10 border border-emerald-100 p-2 z-[100] min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export function EventFilterPanel({ regions = [], currentFilters = {} }: EventFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState(currentFilters.q || '')

  const activeFilterCount = [
    currentFilters.region && currentFilters.region !== 'all',
    currentFilters.time && currentFilters.time !== 'upcoming',
    currentFilters.sort && currentFilters.sort !== 'featured',
    currentFilters.source === 'promotions',
    currentFilters.q,
  ].filter(Boolean).length

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'time' && value === 'upcoming') {
      params.delete(key)
    } else if (key === 'sort' && value === 'featured') {
      params.delete(key)
    } else if (key === 'region' && (!value || value === 'all')) {
      params.delete(key)
    } else if (key === 'source' && (!value || value === 'all')) {
      params.delete(key)
    } else if (key === 'q' && !value.trim()) {
      params.delete(key)
    } else if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('region')
    params.delete('time')
    params.delete('sort')
    params.delete('source')
    params.delete('q')
    params.delete('page')
    setSearchValue('')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('q', searchValue)
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // Get display labels
  const regionLabel = regions.find(r => r.id === currentFilters.region)?.name || 'All Locations'

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-emerald-900/5 border border-white/80 p-4 relative z-40 space-y-3">
      {/* Top row: Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-20 py-2.5 bg-white/80 border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-300 transition-all"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => { setSearchValue(''); updateFilters('q', '') }}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Bottom row: Filter controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Time Filter Pills - Primary filter group */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
          {timeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = (currentFilters.time || 'upcoming') === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('time', option.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

        {/* Location Dropdown */}
        {regions.length > 0 && (
          <FilterDropdown
            label={regionLabel}
            icon={MapPin}
            iconColor="text-amber-500"
            isOpen={openDropdown === 'region'}
            onToggle={() => toggleDropdown('region')}
            hasValue={!!currentFilters.region && currentFilters.region !== 'all'}
          >
            <div className="max-h-[280px] overflow-y-auto space-y-1 scrollbar-thin">
              <button
                onClick={() => { updateFilters('region', ''); setOpenDropdown(null) }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !currentFilters.region || currentFilters.region === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm'
                    : 'hover:bg-emerald-50 text-gray-700'
                }`}
              >
                All Locations
              </button>
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => { updateFilters('region', region.id); setOpenDropdown(null) }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentFilters.region === region.id
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm'
                      : 'hover:bg-emerald-50 text-gray-700'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </FilterDropdown>
        )}

        {/* Promotions Toggle */}
        <button
          onClick={() => updateFilters('source', currentFilters.source === 'promotions' ? '' : 'promotions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            currentFilters.source === 'promotions'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'bg-white/60 text-gray-700 border border-gray-200/80 hover:border-purple-300 hover:bg-white'
          }`}
        >
          <Tag className={`h-4 w-4 ${currentFilters.source === 'promotions' ? 'text-white' : 'text-purple-500'}`} />
          <span>Promotions</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl">
          {sortOptions.map((option) => {
            const Icon = option.icon
            const isSelected = (currentFilters.sort || 'featured') === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateFilters('sort', option.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-amber-500' : ''}`} />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all duration-200 ml-1"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-100 text-red-600 rounded-full">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
