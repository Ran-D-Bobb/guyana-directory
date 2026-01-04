'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeCheck, Sparkles, Phone, Star, ArrowRight, Search } from 'lucide-react'
import { Database } from '@/types/supabase'

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
  primary_photo?: string | null
}

interface BusinessesPageClientProps {
  businesses: Business[]
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

// Editorial Hero Card - Large featured card
function HeroBusinessCard({ business, index }: { business: Business; index: number }) {
  const imageUrl = business.primary_photo || DEFAULT_BUSINESS_IMAGE

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!business.phone) return
    window.location.href = `tel:${business.phone}`
  }

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`group relative block rounded-3xl overflow-hidden bg-white card-elevated animate-fade-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Full-width image */}
      <div className="relative aspect-[16/10] lg:aspect-[21/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 animate-ken-burns-slow"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {business.is_featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[hsl(var(--gold-500))] text-[hsl(var(--jungle-900))] rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </span>
          )}
          {business.is_verified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[hsl(var(--jungle-500))] text-white rounded-full shadow-lg">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex-1">
              {business.categories && (
                <div className="text-sm font-medium text-[hsl(var(--gold-400))] mb-2 uppercase tracking-wider">
                  {business.categories.name}
                </div>
              )}
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-3 group-hover:text-[hsl(var(--gold-300))] transition-colors">
                {business.name}
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {business.regions && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="w-4 h-4" />
                    {business.regions.name}
                  </span>
                )}
                {business.rating && business.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <Star className="w-4 h-4 fill-[hsl(var(--gold-400))] text-[hsl(var(--gold-400))]" />
                    {business.rating.toFixed(1)}
                    {business.review_count && ` (${business.review_count})`}
                  </span>
                )}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              {business.phone && (
                <button
                  onClick={handlePhoneClick}
                  className="btn-shine flex items-center gap-2 px-5 py-3 bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-400))] text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call</span>
                </button>
              )}
              <span className="flex items-center gap-1 px-5 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all">
                View Details
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Editorial Standard Card
function EditorialBusinessCard({ business, index, size = 'default' }: { business: Business; index: number; size?: 'default' | 'tall' }) {
  const imageUrl = business.primary_photo || DEFAULT_BUSINESS_IMAGE

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!business.phone) return
    window.location.href = `tel:${business.phone}`
  }

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white card-elevated animate-fade-up"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${size === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {business.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-[hsl(var(--gold-500))] text-[hsl(var(--jungle-900))] rounded-full uppercase tracking-wide">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {business.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-[hsl(var(--jungle-500))] text-white rounded-full uppercase tracking-wide">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Rating */}
        {business.rating && business.rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <Star className="w-3.5 h-3.5 fill-[hsl(var(--gold-400))] text-[hsl(var(--gold-400))]" />
            <span className="text-xs font-bold text-white">{business.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay with Phone */}
        <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {business.phone && (
            <button
              onClick={handlePhoneClick}
              className="btn-shine flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-400))] text-white rounded-xl font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5">
        {business.categories && (
          <div className="text-xs font-semibold text-[hsl(var(--jungle-500))] mb-1.5 uppercase tracking-wider">
            {business.categories.name}
          </div>
        )}
        <h3 className="font-display text-lg lg:text-xl text-[hsl(var(--jungle-900))] mb-2 line-clamp-1 group-hover:text-[hsl(var(--jungle-600))] transition-colors">
          {business.name}
        </h3>
        {business.regions && (
          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{business.regions.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function BusinessesPageClient({ businesses }: BusinessesPageClientProps) {
  const [viewAll, setViewAll] = useState(false)

  // Separate featured and regular businesses
  const featuredBusinesses = businesses.filter(b => b.is_featured)
  const regularBusinesses = businesses.filter(b => !b.is_featured)

  // For display, show first featured as hero, rest in grid
  const heroBusinesses = featuredBusinesses.slice(0, 1)
  const gridBusinesses = viewAll
    ? [...featuredBusinesses.slice(1), ...regularBusinesses]
    : [...featuredBusinesses.slice(1), ...regularBusinesses].slice(0, 11)

  const hasMore = [...featuredBusinesses.slice(1), ...regularBusinesses].length > 11

  if (businesses.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--jungle-100))] to-[hsl(var(--jungle-200))] mb-6">
          <Search className="w-10 h-10 text-[hsl(var(--jungle-500))]" />
        </div>
        <h3 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-900))] mb-3">
          No businesses found
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-md mx-auto">
          Try adjusting your filters or check back later for new listings
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - First featured business */}
      {heroBusinesses.length > 0 && (
        <section>
          {heroBusinesses.map((business, index) => (
            <HeroBusinessCard key={business.id} business={business} index={index} />
          ))}
        </section>
      )}

      {/* Editorial Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
        {gridBusinesses.map((business, index) => (
          <EditorialBusinessCard
            key={business.id}
            business={business}
            index={index}
            size={index % 5 === 0 ? 'tall' : 'default'}
          />
        ))}
      </section>

      {/* Load More Button */}
      {hasMore && !viewAll && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setViewAll(true)}
            className="group flex items-center gap-2 px-8 py-4 bg-[hsl(var(--jungle-900))] hover:bg-[hsl(var(--jungle-800))] text-white rounded-2xl font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>View All Businesses</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  )
}
