import Link from 'next/link'
import { MapPin, Star, BadgeCheck, Sparkles, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
}

interface BusinessCardProps {
  business: Business
  primaryPhoto?: string | null
}

// Default business image from Unsplash
const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export function BusinessCard({ business, primaryPhoto }: BusinessCardProps) {
  const imageUrl = primaryPhoto || DEFAULT_BUSINESS_IMAGE

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group block rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
    >
      {/* Business Photo with Overlay */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={imageUrl}
          alt={business.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges - Floating on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {business.is_verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-lg backdrop-blur-sm">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          {business.is_featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Rating Badge - Floating on Image */}
        {business.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900">
              {business.rating.toFixed(1)}
            </span>
            {business.review_count > 0 && (
              <span className="text-xs text-gray-600">({business.review_count})</span>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Business name */}
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {business.name}
        </h3>

        {/* Category */}
        {business.categories && (
          <p className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {business.categories.name}
          </p>
        )}

        {/* Location */}
        {business.regions && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{business.regions.name}</span>
          </div>
        )}

        {/* View Details Link */}
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
