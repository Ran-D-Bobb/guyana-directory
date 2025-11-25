'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, MapPin, BadgeCheck, Sparkles, ArrowRight, Star } from 'lucide-react'
import { Database } from '@/types/supabase'

type Rental = Database['public']['Tables']['rentals']['Row'] & {
  rental_photos: Array<{
    id?: string
    image_url: string
    is_primary: boolean | null
    display_order: number | null
  }>
  rental_categories: {
    name: string
    icon: string
  }
  regions: {
    name: string
  } | null
}

interface RentalCardProps {
  rental: Rental
}

const DEFAULT_RENTAL_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'

export function RentalCard({ rental }: RentalCardProps) {
  const photos = rental.rental_photos
    ?.sort((a, b) => {
      if (a.is_primary) return -1
      if (b.is_primary) return 1
      return (a.display_order || 0) - (b.display_order || 0)
    }) || []

  const displayPhoto = photos[0]?.image_url || DEFAULT_RENTAL_IMAGE

  const formatPrice = (pricePerMonth?: number | null, pricePerNight?: number | null) => {
    if (pricePerNight) {
      return `GYD ${pricePerNight.toLocaleString()}/night`
    }
    if (pricePerMonth) {
      return `GYD ${pricePerMonth.toLocaleString()}/month`
    }
    return 'Contact for price'
  }

  return (
    <Link
      href={`/rentals/${rental.slug}`}
      className="group block rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
    >
      {/* Photo with Overlay */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={displayPhoto}
          alt={rental.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges - Floating on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {rental.is_featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {rental.is_best_value && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-lg backdrop-blur-sm">
              <BadgeCheck className="w-3 h-3" />
              Best Value
            </span>
          )}
        </div>

        {/* Rating Badge - Floating on Image */}
        {rental.rating != null && rental.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">
              {rental.rating.toFixed(1)}
            </span>
            {rental.review_count != null && rental.review_count > 0 && (
              <span className="text-xs text-gray-600">({rental.review_count})</span>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Rental name */}
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {rental.name}
        </h3>

        {/* Category & Price */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {rental.rental_categories.name}
          </p>
          <p className="text-sm font-bold text-gray-900">
            {formatPrice(rental.price_per_month, rental.price_per_night)}
          </p>
        </div>

        {/* Location */}
        {rental.regions && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{rental.regions.name}</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {rental.bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-gray-400" />
              <span>{rental.bedrooms === 0 ? 'Studio' : `${rental.bedrooms} bed`}</span>
            </div>
          )}
          {rental.bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-gray-400" />
              <span>{rental.bathrooms} bath</span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
