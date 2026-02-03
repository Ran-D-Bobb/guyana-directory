'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  X,
  MapPin,
  ArrowUpDown,
  Clock,
  Search,
  Sparkles,
  Calendar as CalendarIcon,
  Check,
  Music,
  GraduationCap,
  Users,
  PartyPopper,
  Trophy,
  Briefcase,
  Utensils,
  Palette,
  Heart,
  Calendar,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type EventCategory = Database['public']['Tables']['event_categories']['Row'] & {
  event_count?: number
}

interface MobileEventCategoryFilterBarProps {
  categories: EventCategory[]
  currentCategorySlug?: string
  regions: Array<{ id: string; name: string }>
}

const iconMap: Record<string, LucideIcon> = {
  Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, Calendar
}

export function MobileEventCategoryFilterBar({
  categories,
  currentCategorySlug,
  regions
}: MobileEventCategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local filter state
  const [localRegion, setLocalRegion] = useState(searchParams.get('region') || 'all')
  const [localSort, setLocalSort] = useState(searchParams.get('sort') || 'featured')
  const [localTime, setLocalTime] = useState(searchParams.get('time') || 'upcoming')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Sync local state when URL changes
  useEffect(() => {
    setLocalRegion(searchParams.get('region') || 'all')
    setLocalSort(searchParams.get('sort') || 'featured')
    setLocalTime(searchParams.get('time') || 'upcoming')
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Count active filters
  const activeFiltersCount = [
    searchParams.get('region') && searchParams.get('region') !== 'all',
    searchParams.get('sort') && searchParams.get('sort') !== 'featured',
    searchParams.get('time') && searchParams.get('time') !== 'upcoming',
    searchParams.get('q')
  ].filter(Boolean).length

  const localActiveFiltersCount = [
    localRegion !== 'all',
    localSort !== 'featured',
    localTime !== 'upcoming',
    searchQuery.trim()
  ].filter(Boolean).length

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (localRegion !== 'all') params.set('region', localRegion)
    if (localSort !== 'featured') params.set('sort', localSort)
    if (localTime !== 'upcoming') params.set('time', localTime)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    router.push(`${pathname}?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setLocalRegion('all')
    setLocalSort('featured')
    setLocalTime('upcoming')
    setSearchQuery('')
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
    params.delete('page')
    const queryString = params.toString()

    if (!categorySlug) {
      return queryString ? `/events?${queryString}` : '/events'
    }
    return queryString ? `/events/category/${categorySlug}?${queryString}` : `/events/category/${categorySlug}`
  }

  return (
    <>
      {/* Category Pills Bar - Mobile Only */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-amber-100 shadow-sm">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        >
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border-2 ${
              activeFiltersCount > 0
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-6 bg-gray-200" />

          {/* All Events Pill */}
          <Link
            href={buildCategoryUrl()}
            data-active={!currentCategorySlug}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              !currentCategorySlug
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Check className={`h-3.5 w-3.5 ${!currentCategorySlug ? 'opacity-100' : 'opacity-0 w-0'}`} />
            <span>All</span>
            <span className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
              {categories.reduce((sum, c) => sum + (c.event_count || 0), 0)}
            </span>
          </Link>

          {/* Category Pills */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Calendar : Calendar
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={buildCategoryUrl(category.slug)}
                data-active={isActive}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{category.name}</span>
                {category.event_count !== undefined && (
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.event_count}
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
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Filter Sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-white to-amber-50/30 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isFilterOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-amber-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <SlidersHorizontal className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900">Filters</h2>
              {localActiveFiltersCount > 0 && (
                <p className="text-sm text-amber-600 font-medium">{localActiveFiltersCount} active</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-2 hover:bg-amber-50 rounded-xl transition-colors"
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
              <Search className="h-4 w-4 text-emerald-600" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
            />
          </div>

          {/* Time Filter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Clock className="h-4 w-4 text-emerald-600" />
              When
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'upcoming', label: 'Upcoming', icon: Clock, activeClass: 'bg-emerald-500 text-white shadow-lg' },
                { value: 'ongoing', label: 'Happening Now', icon: Sparkles, activeClass: 'bg-emerald-500 text-white shadow-lg' },
                { value: 'past', label: 'Past Events', icon: CalendarIcon, activeClass: 'bg-gray-600 text-white shadow-lg' },
                { value: 'all', label: 'All Events', icon: null, activeClass: 'bg-gray-800 text-white shadow-lg' }
              ].map((timeOption) => (
                <button
                  key={timeOption.value}
                  onClick={() => setLocalTime(timeOption.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    localTime === timeOption.value
                      ? timeOption.activeClass
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {timeOption.icon && <timeOption.icon className="h-4 w-4" />}
                  {timeOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="h-4 w-4 text-amber-500" />
              Location
            </label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="block w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium"
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
              <ArrowUpDown className="h-4 w-4 text-amber-500" />
              Sort By
            </label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e.target.value)}
              className="block w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium"
            >
              <option value="featured">Featured First</option>
              <option value="date">Date (Soonest)</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-amber-100 bg-amber-50/50 safe-area-inset-bottom">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg transition-all"
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
