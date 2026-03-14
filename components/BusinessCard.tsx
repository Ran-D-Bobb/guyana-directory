import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, Sparkles, ArrowRight, Phone } from 'lucide-react'
import { Database } from '@/types/supabase'
import { StarRating } from './StarRating'
import { SaveBusinessButton } from './SaveBusinessButton'
import { BusinessStatusBadge, type BusinessHours } from './BusinessStatusBadge'
import { formatPhoneDisplay } from '@/lib/utils'
import { getCategoryImage, DEFAULT_CATEGORY_IMAGE } from '@/lib/category-images'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string; slug?: string } | null
  regions: { name: string } | null
  business_tags?: Array<{ category_tags: { name: string; slug: string } | null }>
}

interface BusinessCardProps {
  business: Business
  primaryPhoto?: string | null
  userId?: string | null
  isSaved?: boolean
}

export function BusinessCard({ business, primaryPhoto, userId, isSaved = false }: BusinessCardProps) {
  const categorySlug = business.categories?.slug
  const fallbackImage = categorySlug ? getCategoryImage(categorySlug) : DEFAULT_CATEGORY_IMAGE
  const imageUrl = primaryPhoto || fallbackImage
  const formattedPhone = formatPhoneDisplay(business.phone)

  return (
    <div className="group block rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-card border border-border hover:border-primary/30">
      <Link
        href={`/businesses/${business.slug}`}
        className="block active:scale-[0.99] touch-manipulation"
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
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
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
          <h3 className="font-bold text-lg sm:text-xl text-foreground mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {business.name}
          </h3>

          {/* Category + Open/Closed status */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            {business.categories && (
              <p className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span className="truncate">{business.categories.name}</span>
              </p>
            )}
            {business.hours && (
              <div className="flex-shrink-0">
                <BusinessStatusBadge hours={business.hours as BusinessHours} variant="inline" />
              </div>
            )}
          </div>

          {/* Tags */}
          {business.business_tags && business.business_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {business.business_tags.slice(0, 3).map((bt, i) => (
                bt.category_tags && (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    {bt.category_tags.name}
                  </span>
                )
              ))}
              {business.business_tags.length > 3 && (
                <span className="text-[10px] sm:text-xs text-gray-400">
                  +{business.business_tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          {business.regions && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/70 flex-shrink-0" />
              <span className="truncate">{business.regions.name}</span>
            </div>
          )}

          {/* Actions row: View Details + Phone quick-tap */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary py-1">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Phone quick-tap button - outside Link to prevent navigation */}
      {business.phone && formattedPhone && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
          <a
            href={`tel:${business.phone}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary font-semibold text-sm transition-colors active:scale-[0.98] touch-manipulation"
          >
            <Phone className="w-4 h-4" />
            <span>{formattedPhone}</span>
          </a>
        </div>
      )}
    </div>
  )
}
