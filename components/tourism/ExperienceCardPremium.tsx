'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Star, Sparkles, ShieldCheck, Award, Eye } from 'lucide-react'
import { TourismExperience } from '@/types/tourism'
import { getFallbackImage } from '@/lib/category-images'

interface ExperienceCardPremiumProps {
  experience: TourismExperience
  priority?: boolean
}

// Difficulty badge colors
const difficultyStyles: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  challenging: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700'
}

export function ExperienceCardPremium({ experience, priority = false }: ExperienceCardPremiumProps) {
  const [imageError, setImageError] = useState(false)

  // Get primary photo
  const photos = Array.isArray(experience.tourism_photos) ? experience.tourism_photos : []
  const categoryFallback = getFallbackImage(experience.tourism_categories?.name, 'tourism')
  const primaryPhoto = imageError ? categoryFallback : (photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || categoryFallback)

  // Determine which badge to show (only show one primary badge)
  const primaryBadge = experience.is_featured ? 'featured'
    : experience.is_tourism_authority_approved ? 'approved'
    : experience.is_verified ? 'verified'
    : null

  return (
    <Link
      href={`/tourism/${experience.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5 border border-gray-100/80"
    >
      {/* Image Container - 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50">
        <Image
          src={primaryPhoto}
          alt={experience.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Top Row: Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {primaryBadge === 'featured' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </span>
          )}
          {primaryBadge === 'approved' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm">
              <Award className="w-3.5 h-3.5" />
              TA Approved
            </span>
          )}
          {primaryBadge === 'verified' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Bottom Row: Category + Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          {/* Category Badge */}
          {experience.tourism_categories && (
            <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full">
              {experience.tourism_categories.name}
            </span>
          )}

          {/* Price Tag */}
          {experience.price_from !== null && (
            <div className="px-3 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">From</div>
              <div className="text-lg font-bold text-emerald-600 leading-tight">
                GYD {experience.price_from.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
          {experience.name}
        </h3>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
          {/* Location */}
          {experience.regions && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="truncate">{experience.regions.name}</span>
            </div>
          )}

          {/* Duration */}
          {experience.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span>{experience.duration}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Rating + Difficulty */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Rating */}
          <div className="flex items-center gap-2">
            {experience.rating && experience.rating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">{experience.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({experience.review_count} {experience.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{experience.view_count || 0} views</span>
              </div>
            )}
          </div>

          {/* Difficulty */}
          {experience.difficulty_level && (
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${difficultyStyles[experience.difficulty_level] || difficultyStyles.easy}`}>
              {experience.difficulty_level.charAt(0).toUpperCase() + experience.difficulty_level.slice(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
