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
  whatsapp_number?: string
}

export function PremiumSpotlight({ items }: { items: SpotlightItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (isPaused || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

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
      className="relative h-[600px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0">
        <Image
          src={current.image_url || '/placeholder-business.jpg'}
          alt={current.name}
          fill
          className="object-cover animate-ken-burns"
          priority
          sizes="100vw"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-6 text-white">
          {/* Sponsored Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-bold text-gray-900">PREMIUM SPONSORED</span>
          </div>

          {/* Type Badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getTypeColor(current.type)} rounded-lg shadow-lg`}>
            <span className="text-sm font-semibold uppercase tracking-wider">{getTypeLabel(current.type)}</span>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl">
            {current.name}
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-200 leading-relaxed drop-shadow-lg line-clamp-3">
            {current.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-lg">
            {current.rating > 0 && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{current.rating.toFixed(1)}</span>
                <span className="text-gray-300">({current.review_count} reviews)</span>
              </div>
            )}

            {current.location && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <MapPin className="h-6 w-6" />
                <span>{current.location}</span>
              </div>
            )}

            {current.price && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-emerald-400">{current.price}</span>
              </div>
            )}

            {current.category && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-gray-300">{current.category}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href={getTypeLink(current.type, current.slug)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/80 transition-all transform hover:scale-105 text-lg font-bold"
            >
              View Details
              <ExternalLink className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>

            {current.whatsapp_number && (
              <a
                href={`https://wa.me/${current.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/50 text-white rounded-xl shadow-2xl transition-all transform hover:scale-105 text-lg font-bold"
              >
                <Phone className="h-6 w-6" />
                Contact Now
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all shadow-2xl"
            aria-label="Previous"
          >
            <ChevronLeft className="h-8 w-8 text-white" strokeWidth={3} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all shadow-2xl"
            aria-label="Next"
          >
            <ChevronRight className="h-8 w-8 text-white" strokeWidth={3} />
          </button>
        </>
      )}

      {/* Progress Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-12 h-3 bg-white shadow-lg shadow-white/50'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {!isPaused && items.length > 1 && (
        <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Auto-playing
        </div>
      )}
    </section>
  )
}
