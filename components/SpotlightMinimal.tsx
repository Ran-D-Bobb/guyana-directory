'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'

type SpotlightItem = {
  id: string
  name: string
  description: string
  image_url: string
  rating: number
  review_count: number
  location: string
  type: 'business' | 'tourism' | 'rental' | 'event'
  slug: string
  price?: string
  category?: string
}

const typeConfig = {
  business: { label: 'Business', href: '/businesses', color: 'bg-amber-500' },
  tourism: { label: 'Experience', href: '/tourism', color: 'bg-emerald-500' },
  rental: { label: 'Property', href: '/rentals', color: 'bg-blue-500' },
  event: { label: 'Event', href: '/events', color: 'bg-purple-500' },
}

function SpotlightCard({ item }: { item: SpotlightItem }) {
  const config = typeConfig[item.type]
  const href = item.type === 'business'
    ? `/businesses/${item.slug}`
    : item.type === 'tourism'
    ? `/tourism/${item.slug}`
    : item.type === 'rental'
    ? `/rentals/${item.slug}`
    : `/events/${item.slug}`

  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image_url || '/placeholder.jpg'}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className={`${config.color} text-white text-xs font-medium px-3 py-1.5 rounded-full`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {item.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {item.category}
          </p>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
          {item.name}
        </h3>

        {/* Location */}
        {item.location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}

        {/* Rating & Price row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {item.rating > 0 ? (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-900">{item.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({item.review_count})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">New</span>
          )}

          {item.price && (
            <span className="text-sm font-semibold text-gray-900">{item.price}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function SpotlightMinimal({ items }: { items: SpotlightItem[] }) {
  // Take only top 4 items for clean grid
  const displayItems = items.slice(0, 4)

  if (!displayItems.length) return null

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header - minimal */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured this week
          </h2>
          <p className="text-lg text-gray-600">
            Hand-picked businesses, experiences, and stays across Guyana
          </p>
        </div>

        {/* Grid - 4 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((item) => (
            <SpotlightCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
