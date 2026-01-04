'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, Sparkles, Share2, Heart, Phone } from 'lucide-react'
import { Database } from '@/types/supabase'
import { useState } from 'react'
import { ViewMode } from './ViewModeToggle'
import { StarRating } from './StarRating'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
}

interface EnhancedBusinessCardProps {
  business: Business
  primaryPhoto?: string | null
  viewMode: ViewMode
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export function EnhancedBusinessCard({ business, primaryPhoto, viewMode }: EnhancedBusinessCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const imageUrl = primaryPhoto || DEFAULT_BUSINESS_IMAGE

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!business.phone) return
    window.location.href = `tel:${business.phone}`
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Check out ${business.name} on Guyana Directory`,
        url: `/businesses/${business.slug}`
      })
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  // Grid View (Default)
  if (viewMode === 'grid') {
    return (
      <Link
        href={`/businesses/${business.slug}`}
        className="group block rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
      >
        <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={imageUrl}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {business.is_verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-lg">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </span>
            )}
            {business.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full shadow-lg">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {/* Rating */}
          {business.rating && business.rating > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
              <StarRating rating={business.rating} size="md" />
              <span className="text-sm font-bold text-gray-900">{business.rating.toFixed(1)}</span>
              {business.review_count && business.review_count > 0 && (
                <span className="text-xs text-gray-600">({business.review_count})</span>
              )}
            </div>
          )}

          {/* Quick Actions - Visible on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-2">
              {business.phone && (
                <button
                  onClick={handlePhoneClick}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Call</span>
                </button>
              )}
              <button
                onClick={handleFavorite}
                className={`p-2.5 rounded-xl font-semibold shadow-lg transition-all ${
                  isFavorited ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 bg-white/95 hover:bg-white text-gray-700 rounded-xl font-semibold shadow-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {business.name}
          </h3>
          {business.categories && (
            <p className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              {business.categories.name}
            </p>
          )}
          {business.regions && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{business.regions.name}</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // List View
  if (viewMode === 'list') {
    return (
      <Link
        href={`/businesses/${business.slug}`}
        className="group flex gap-6 p-5 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={imageUrl}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 192px, 192px"
          />
          {business.rating && business.rating > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
              <StarRating rating={business.rating} size="sm" />
              <span className="text-xs font-bold text-gray-900">{business.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                {business.categories && (
                  <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {business.categories.name}
                  </span>
                )}
                {business.regions && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {business.regions.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {business.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
              {business.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{business.description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {business.phone && (
              <button
                onClick={handlePhoneClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </button>
            )}
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-all ${
                isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    )
  }

  // Compact View
  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Small Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="80px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {business.name}
        </h3>
        <div className="flex items-center gap-3 text-sm">
          {business.categories && (
            <span className="text-emerald-600 font-medium">{business.categories.name}</span>
          )}
          {business.regions && (
            <span className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3 text-gray-400" />
              {business.regions.name}
            </span>
          )}
        </div>
      </div>

      {/* Rating & Actions */}
      <div className="flex items-center gap-3">
        {business.rating && business.rating > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
            <StarRating rating={business.rating} size="sm" />
            <span className="text-sm font-bold text-gray-900">{business.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {business.is_verified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
          {business.is_featured && <Sparkles className="w-4 h-4 text-amber-500" />}
        </div>
      </div>
    </Link>
  )
}
