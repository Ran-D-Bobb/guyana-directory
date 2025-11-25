'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Calendar, TrendingUp, Compass, Home, CalendarDays } from 'lucide-react'

type SearchResult = {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  category: string
  location: string
  rating: number
  reviewCount: number
  price?: string
  date?: string
  type: 'business' | 'experience' | 'rental' | 'event'
  href: string
}

type SearchResults = {
  businesses: SearchResult[]
  experiences: SearchResult[]
  rentals: SearchResult[]
  events: SearchResult[]
}

type FilterType = 'all' | 'businesses' | 'experiences' | 'rentals' | 'events'

interface UnifiedSearchResultsProps {
  results: SearchResults
  activeType: FilterType
}

const defaultImages = {
  business: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  experience: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&q=80',
  rental: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
  event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
}

const typeConfig = {
  business: { color: 'bg-amber-500', icon: TrendingUp },
  experience: { color: 'bg-emerald-500', icon: Compass },
  rental: { color: 'bg-blue-500', icon: Home },
  event: { color: 'bg-purple-500', icon: CalendarDays },
}

function ResultCard({ result }: { result: SearchResult }) {
  const config = typeConfig[result.type]
  const Icon = config.icon

  return (
    <Link
      href={result.href}
      className="group flex gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={result.image || defaultImages[result.type]}
          alt={result.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="128px"
        />
        {/* Type indicator */}
        <div className={`absolute top-2 left-2 p-1.5 ${config.color} rounded-md`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        {/* Category */}
        {result.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {result.category}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1 mb-1">
          {result.name}
        </h3>

        {/* Location or Date */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          {result.type === 'event' && result.date ? (
            <>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {result.location && (
                <>
                  <span className="mx-1">·</span>
                  <span className="truncate">{result.location}</span>
                </>
              )}
            </>
          ) : result.location ? (
            <>
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{result.location}</span>
            </>
          ) : null}
        </div>

        {/* Rating & Price */}
        <div className="flex items-center gap-3 text-sm">
          {result.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-900">{result.rating.toFixed(1)}</span>
              <span className="text-gray-400">({result.reviewCount})</span>
            </div>
          )}
          {result.price && (
            <span className="font-medium text-gray-900">{result.price}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function UnifiedSearchResults({ results, activeType }: UnifiedSearchResultsProps) {
  const [filter, setFilter] = useState<FilterType>(activeType)

  const tabs = [
    { key: 'all' as const, label: 'All', count: results.businesses.length + results.experiences.length + results.rentals.length + results.events.length },
    { key: 'businesses' as const, label: 'Businesses', count: results.businesses.length },
    { key: 'experiences' as const, label: 'Experiences', count: results.experiences.length },
    { key: 'rentals' as const, label: 'Stays', count: results.rentals.length },
    { key: 'events' as const, label: 'Events', count: results.events.length },
  ].filter(tab => tab.key === 'all' || tab.count > 0)

  // Get filtered results
  const getFilteredResults = (): SearchResult[] => {
    switch (filter) {
      case 'businesses':
        return results.businesses
      case 'experiences':
        return results.experiences
      case 'rentals':
        return results.rentals
      case 'events':
        return results.events
      case 'all':
      default:
        // Interleave results for variety
        const all: SearchResult[] = []
        const maxLen = Math.max(
          results.businesses.length,
          results.experiences.length,
          results.rentals.length,
          results.events.length
        )
        for (let i = 0; i < maxLen; i++) {
          if (results.businesses[i]) all.push(results.businesses[i])
          if (results.experiences[i]) all.push(results.experiences[i])
          if (results.rentals[i]) all.push(results.rentals[i])
          if (results.events[i]) all.push(results.events[i])
        }
        return all
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className={`text-xs ${filter === tab.key ? 'text-gray-300' : 'text-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {filteredResults.map((result) => (
          <ResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>
    </div>
  )
}
