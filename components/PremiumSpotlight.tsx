'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, MapPin, Phone, ExternalLink, Sparkles } from 'lucide-react'

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
  phone?: string
}

export function PremiumSpotlight({ items }: { items: SpotlightItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (isPaused || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

  // Reset image loaded state when changing slides
  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  // Touch event handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setIsHorizontalSwipe(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return

    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const diffX = Math.abs(currentX - touchStartX)
    const diffY = Math.abs(currentY - touchStartY)

    // Determine if this is a horizontal swipe (more X movement than Y)
    if (!isHorizontalSwipe && diffX > 10 && diffX > diffY) {
      setIsHorizontalSwipe(true)
    }

    // Only prevent default and track if horizontal swipe
    if (isHorizontalSwipe || diffX > diffY * 1.5) {
      e.preventDefault()
      setTouchEndX(currentX)
    }
  }

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return

    const distance = touchStartX - touchEndX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }

    // Reset states
    setTouchStartX(null)
    setTouchStartY(null)
    setTouchEndX(null)
    setIsHorizontalSwipe(false)
  }

  if (!items || items.length === 0) return null

  const current = items[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'from-amber-500 to-orange-600'
      case 'tourism':
        return 'from-emerald-500 to-teal-600'
      case 'rental':
        return 'from-blue-500 to-indigo-600'
      case 'event':
        return 'from-purple-500 to-pink-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'business':
        return 'Featured Business'
      case 'tourism':
        return 'Featured Experience'
      case 'rental':
        return 'Featured Property'
      case 'event':
        return 'Featured Event'
      default:
        return 'Featured'
    }
  }

  const getTypeLink = (type: string, slug: string) => {
    switch (type) {
      case 'business':
        return `/businesses/${slug}`
      case 'tourism':
        return `/tourism/${slug}`
      case 'rental':
        return `/rentals/${slug}`
      case 'event':
        return `/events/${slug}`
      default:
        return '/'
    }
  }

  return (
    <section
      className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0">
        {/* Show loading skeleton while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
        )}
        <Image
          src={current.image_url || '/placeholder-business.jpg'}
          alt={current.name}
          fill
          className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100 animate-ken-burns' : 'opacity-0'}`}
          priority
          sizes="100vw"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Dark Gradient Overlay - Enhanced for mobile readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 md:from-black/80 md:via-black/50 md:to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-3 md:space-y-6 text-white pb-16 md:pb-0">
          {/* Sponsored Badge */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-bold text-gray-900">PREMIUM SPONSORED</span>
          </div>

          {/* Type Badge */}
          <div className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r ${getTypeColor(current.type)} rounded-lg shadow-lg`}>
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">{getTypeLabel(current.type)}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl leading-tight">
            {current.name}
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-2xl text-gray-200 leading-relaxed drop-shadow-lg line-clamp-2 md:line-clamp-3">
            {current.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-lg">
            {current.rating > 0 && (
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg">
                <Star className="h-4 w-4 md:h-6 md:w-6 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{current.rating.toFixed(1)}</span>
                <span className="text-gray-300 hidden sm:inline">({current.review_count})</span>
              </div>
            )}

            {current.location && (
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg">
                <MapPin className="h-4 w-4 md:h-6 md:w-6" />
                <span className="truncate max-w-[120px] md:max-w-none">{current.location}</span>
              </div>
            )}

            {current.price && (
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg">
                <span className="text-lg md:text-2xl font-bold text-emerald-400">{current.price}</span>
              </div>
            )}

            {current.category && (
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg">
                <span className="text-gray-300 truncate max-w-[100px] md:max-w-none">{current.category}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons - Horizontal on all screens */}
          <div className="flex items-center gap-2 md:gap-4 pt-2 md:pt-4">
            <Link
              href={getTypeLink(current.type, current.slug)}
              className="group inline-flex items-center justify-center gap-2 md:gap-3 px-4 py-2.5 md:px-8 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg md:rounded-xl shadow-xl md:shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/80 transition-all transform hover:scale-105 active:scale-95 text-sm md:text-lg font-bold flex-1 md:flex-initial touch-manipulation"
            >
              <span>View Details</span>
              <ExternalLink className="h-4 w-4 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
            </Link>

            {current.phone && (
              <a
                href={`tel:${current.phone.replace(/\D/g, '')}`}
                className="group inline-flex items-center justify-center gap-2 md:gap-3 px-4 py-2.5 md:px-8 md:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/50 text-white rounded-lg md:rounded-xl shadow-xl md:shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-sm md:text-lg font-bold flex-1 md:flex-initial touch-manipulation"
              >
                <Phone className="h-4 w-4 md:h-6 md:w-6" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Desktop only (swipe on mobile) */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all shadow-2xl"
            aria-label="Previous"
          >
            <ChevronLeft className="h-8 w-8 text-white" strokeWidth={3} />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all shadow-2xl"
            aria-label="Next"
          >
            <ChevronRight className="h-8 w-8 text-white" strokeWidth={3} />
          </button>
        </>
      )}

      {/* Progress Dots - Optimized for mobile */}
      {items.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all rounded-full touch-manipulation ${
                index === currentIndex
                  ? 'w-8 h-2 md:w-12 md:h-3 bg-white shadow-lg shadow-white/50'
                  : 'w-2 h-2 md:w-3 md:h-3 bg-white/40 hover:bg-white/60 active:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator - Hidden on mobile for cleaner UI */}
      {!isPaused && items.length > 1 && (
        <div className="absolute top-4 md:top-8 right-4 md:right-8 hidden md:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs md:text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Auto-playing
        </div>
      )}
    </section>
  )
}
