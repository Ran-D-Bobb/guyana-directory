'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, MapPin, BadgeCheck, Sparkles, Star, ArrowUpRight } from 'lucide-react'
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
  } | null
  regions: {
    name: string
  } | null
}

interface RentalCardProps {
  rental: Rental
  variant?: 'default' | 'featured' | 'compact'
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
      return { amount: pricePerNight.toLocaleString(), period: '/night', raw: pricePerNight }
    }
    if (pricePerMonth) {
      return { amount: pricePerMonth.toLocaleString(), period: '/mo', raw: pricePerMonth }
    }
    return { amount: 'Contact', period: '', raw: 0 }
  }

  const price = formatPrice(rental.price_per_month, rental.price_per_night)
  const isFeatured = rental.is_featured
  const isBestValue = rental.is_best_value

  // Unified card design - same structure for all cards
  return (
    <Link
      href={`/rentals/${rental.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 hover:border-emerald-200 h-full flex flex-col"
    >
      {/* Photo Section - Fixed height */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0">
        <Image
          src={displayPhoto}
          alt={rental.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Subtle gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-md">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {isBestValue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-500 text-white rounded-full shadow-md">
              <BadgeCheck className="w-3 h-3" />
              Best Value
            </span>
          )}
        </div>

        {/* Rating Badge */}
        {rental.rating != null && rental.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900">
              {rental.rating.toFixed(1)}
            </span>
            {rental.review_count != null && rental.review_count > 0 && (
              <span className="text-xs text-gray-500">({rental.review_count})</span>
            )}
          </div>
        )}
      </div>

      {/* Content Section - Flex grow to fill remaining space */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Property Type */}
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          {rental.property_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Rental'}
        </p>

        {/* Name - Using display font */}
        <h3 className="font-display text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {rental.name}
        </h3>

        {/* Location - Fixed height container */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 min-h-[20px]">
          {rental.regions && (
            <>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{rental.regions.name}</span>
            </>
          )}
        </div>

        {/* Stats Row - Fixed height container */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 min-h-[20px]">
          {rental.bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{rental.bedrooms === 0 ? 'Studio' : `${rental.bedrooms} bed`}</span>
            </div>
          )}
          {rental.bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{rental.bathrooms} bath</span>
            </div>
          )}
        </div>

        {/* Price Row - Push to bottom with mt-auto */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
            <p className="font-display text-2xl text-gray-900">
              <span className="text-sm font-sans text-gray-500">GYD </span>
              {price.amount}
              <span className="text-sm font-sans text-gray-500">{price.period}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <span>View</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
