import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, Sparkles, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'
import { StarRating } from './StarRating'
import { SaveBusinessButton } from './SaveBusinessButton'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
}

interface BusinessCardProps {
  business: Business
  primaryPhoto?: string | null
  userId?: string | null
  isSaved?: boolean
}

// Default business image from Unsplash
const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export function BusinessCard({ business, primaryPhoto, userId, isSaved = false }: BusinessCardProps) {
  const imageUrl = primaryPhoto || DEFAULT_BUSINESS_IMAGE

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group block rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-white border border-gray-100 hover:border-emerald-200 active:scale-[0.99] touch-manipulation"
    >
      {/* Business Photo with Overlay - responsive aspect ratio */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Save Button */}
        <SaveBusinessButton
          businessId={business.id}
          initialIsSaved={isSaved}
          userId={userId ?? null}
          variant="overlay"
          size="sm"
        />

        {/* Badges - Floating on Image with enhanced visibility */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          {business.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-full shadow-lg ring-1 sm:ring-2 ring-white/50">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Featured</span>
            </span>
          )}
          {business.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 rounded-full shadow-lg ring-1 sm:ring-2 ring-white/50">
              <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Verified</span>
            </span>
          )}
        </div>

        {/* Rating Badge - Floating on Image */}
        {business.rating != null && business.rating > 0 && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <StarRating rating={business.rating} size="sm" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">
              {business.rating.toFixed(1)}
            </span>
            {business.review_count != null && business.review_count > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-600 hidden sm:inline">({business.review_count})</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {/* Business name */}
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {business.name}
        </h3>

        {/* Category */}
        {business.categories && (
          <p className="text-xs sm:text-sm font-medium text-emerald-600 mb-2 sm:mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
            <span className="truncate">{business.categories.name}</span>
          </p>
        )}

        {/* Location */}
        {business.regions && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{business.regions.name}</span>
          </div>
        )}

        {/* View Details Link - touch-friendly */}
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all py-1">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
