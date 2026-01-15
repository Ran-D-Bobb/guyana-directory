'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  MapPin,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface FeaturedRental {
  id: string
  name: string
  slug: string
  description?: string | null
  price_per_month?: number | null
  price_per_night?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  rating?: number | null
  review_count?: number | null
  rental_photos?: Array<{
    image_url: string
    is_primary?: boolean | null
  }>
  rental_categories?: {
    name: string
  } | null
  regions?: {
    name: string
  } | null
}

interface FeaturedRentalsHeroProps {
  rentals: FeaturedRental[]
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80'

export function FeaturedRentalsHero({ rentals }: FeaturedRentalsHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const featuredRentals = rentals.slice(0, 5)

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 800)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % featuredRentals.length)
  }, [currentIndex, featuredRentals.length, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + featuredRentals.length) % featuredRentals.length)
  }, [currentIndex, featuredRentals.length, goToSlide])

  // Auto-advance
  useEffect(() => {
    if (isPaused || featuredRentals.length <= 1) return
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [nextSlide, isPaused, featuredRentals.length])

  if (featuredRentals.length === 0) return null

  const currentRental = featuredRentals[currentIndex]

  const formatPrice = (rental: FeaturedRental) => {
    if (rental.price_per_night) {
      return { amount: rental.price_per_night.toLocaleString(), period: 'night' }
    }
    if (rental.price_per_month) {
      return { amount: rental.price_per_month.toLocaleString(), period: 'month' }
    }
    return { amount: 'Contact', period: '' }
  }

  const price = formatPrice(currentRental)

  return (
    <section
      className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with Ken Burns */}
      {featuredRentals.map((rental, index) => {
        const photo = rental.rental_photos?.find(p => p.is_primary)?.image_url
          || rental.rental_photos?.[0]?.image_url
          || DEFAULT_IMAGE
        return (
          <div
            key={rental.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <Image
              src={photo}
              alt={rental.name}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        )
      })}

      {/* Layered Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content - Fixed positioning with proper padding */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-16 lg:px-20 py-6 sm:py-8 flex flex-col justify-center">
        <div className="w-full lg:w-3/5 space-y-3 sm:space-y-4">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg transition-all duration-700 ${
              isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured</span>
          </div>

          {/* Category */}
          {currentRental.rental_categories?.name && (
            <p
              className={`text-emerald-400 font-semibold tracking-wide uppercase text-xs sm:text-sm transition-all duration-700 ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              {currentRental.rental_categories.name}
            </p>
          )}

          {/* Title */}
          <h1
            className={`font-display text-2xl sm:text-3xl lg:text-4xl text-white leading-tight tracking-tight transition-all duration-700 line-clamp-2 ${
              isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {currentRental.name}
          </h1>

          {/* Location */}
          {currentRental.regions?.name && (
            <div
              className={`flex items-center gap-1.5 text-white/80 transition-all duration-700 ${
                isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-sm sm:text-base">{currentRental.regions.name}</span>
            </div>
          )}

          {/* Stats Row */}
          <div
            className={`flex flex-wrap items-center gap-2 sm:gap-3 transition-all duration-700 ${
              isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {currentRental.bedrooms !== null && currentRental.bedrooms !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <Bed className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-medium">
                  {currentRental.bedrooms === 0 ? 'Studio' : `${currentRental.bedrooms} Bed`}
                </span>
              </div>
            )}
            {currentRental.bathrooms !== null && currentRental.bathrooms !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <Bath className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-medium">{currentRental.bathrooms} Bath</span>
              </div>
            )}
            {currentRental.rating && currentRental.rating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-sm">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span className="text-white font-bold">{currentRental.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Price & CTA */}
          <div
            className={`flex flex-wrap items-center gap-4 sm:gap-6 pt-2 transition-all duration-700 ${
              isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            <div>
              <p className="text-white/60 text-xs font-medium mb-0.5">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display text-white">
                  GYD {price.amount}
                </span>
                {price.period && (
                  <span className="text-white/70 text-sm">/{price.period}</span>
                )}
              </div>
            </div>

            <Link
              href={`/rentals/${currentRental.slug}`}
              className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>View</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile (users can swipe) */}
      {featuredRentals.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            aria-label="Previous property"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            aria-label="Next property"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredRentals.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {featuredRentals.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentIndex
                  ? 'w-8 sm:w-10 h-1.5 sm:h-2 bg-white'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Property Thumbnails - Desktop Only */}
      {featuredRentals.length > 1 && (
        <div className="hidden xl:flex absolute bottom-6 right-8 z-20 gap-2">
          {featuredRentals.map((rental, index) => {
            const thumb = rental.rental_photos?.find(p => p.is_primary)?.image_url
              || rental.rental_photos?.[0]?.image_url
              || DEFAULT_IMAGE
            return (
              <button
                key={rental.id}
                onClick={() => goToSlide(index)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumb}
                  alt={rental.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
