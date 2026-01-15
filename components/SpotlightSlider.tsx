'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

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
}

const typeConfig = {
  business: {
    label: 'Shop',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-amber-500/20',
  },
  tourism: {
    label: 'Experience',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  rental: {
    label: 'Stay',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'group-hover:shadow-blue-500/20',
  },
  event: {
    label: 'Event',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'group-hover:shadow-purple-500/20',
  },
}

const defaultImages = {
  business: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  tourism: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  rental: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
}

function SpotlightCard({ item, index }: { item: SpotlightItem; index: number }) {
  const config = typeConfig[item.type]
  const href =
    item.type === 'business'
      ? `/businesses/${item.slug}`
      : item.type === 'tourism'
      ? `/tourism/${item.slug}`
      : item.type === 'rental'
      ? `/rentals/${item.slug}`
      : `/events/${item.slug}`

  return (
    <Link
      href={href}
      className={`group block flex-shrink-0 w-[clamp(260px,75vw,340px)] sm:w-[300px] md:w-[340px] snap-start animate-fade-up touch-manipulation`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`relative bg-white rounded-2xl md:rounded-3xl overflow-hidden transition-shadow duration-300 card-elevated ${config.glow} active:scale-[0.99]`}
      >
        {/* Image container with overlay */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={item.image_url || defaultImages[item.type]}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 300px, (max-width: 768px) 340px, 380px"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Type badge - top left */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${config.gradient} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}
            >
              {config.label}
            </span>
          </div>

          {/* Rating badge - top right */}
          {item.rating > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{item.rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* Price badge - bottom right (shows on hover) */}
          {item.price && (
            <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="bg-white/95 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                {item.price}
              </span>
            </div>
          )}
        </div>

        {/* Content - fixed height for consistency, compact on mobile */}
        <div className="p-3 md:p-5 flex flex-col h-[140px] md:h-[160px]">
          {/* Category - always reserve space */}
          <p className="text-[10px] md:text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1 md:mb-2 h-3 md:h-4">
            {item.category || '\u00A0'}
          </p>

          {/* Title */}
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors font-display leading-tight">
            {item.name}
          </h3>

          {/* Location - always reserve space */}
          <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-gray-500 h-4 md:h-5">
            {item.location ? (
              <>
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                <span className="line-clamp-1">{item.location}</span>
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>

          {/* Bottom row - pushed to bottom */}
          <div className="flex items-center justify-between mt-auto pt-2 md:pt-4 border-t border-gray-100">
            {item.rating > 0 ? (
              <span className="text-[10px] md:text-xs text-gray-400">
                {item.review_count} {item.review_count === 1 ? 'review' : 'reviews'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-amber-600 font-medium">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                New
              </span>
            )}

            <span className="text-[10px] md:text-xs font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function SpotlightSlider({ items }: { items: SpotlightItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    updateScrollButtons()
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', updateScrollButtons)
      return () => container.removeEventListener('scroll', updateScrollButtons)
    }
  }, [])

  useEffect(() => {
    if (isMobile || isHovered || !scrollRef.current) return

    const container = scrollRef.current
    const cardWidth = 380 + 24

    const interval = setInterval(() => {
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScroll = scrollWidth - clientWidth

      if (scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollTo({ left: scrollLeft + cardWidth, behavior: 'smooth' })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isMobile, isHovered])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = 380 + 24
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <section className="py-10 md:py-20 lg:py-28 gradient-mesh-jungle noise-overlay relative">
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="px-4 md:px-6 mb-6 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="animate-fade-up">
            <span className="text-emerald-600 font-semibold text-xs md:text-sm uppercase tracking-wider mb-1 md:mb-2 block">
              Handpicked for you
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-gray-900 mb-1 md:mb-3">
              Featured this week
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-md">
              The best spots, experiences, and events across Guyana
            </p>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-3 animate-fade-up delay-200">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full transition-all duration-300 ${
                canScrollLeft
                  ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-3 rounded-full transition-all duration-300 ${
                canScrollRight
                  ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-6 pb-4"
        >
          {items.map((item, index) => (
            <SpotlightCard key={`${item.type}-${item.id}`} item={item} index={index} />
          ))}
        </div>

        {/* Mobile hint */}
        <div className="md:hidden flex justify-center mt-4 animate-fade-up delay-300">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-6 h-0.5 bg-gray-300 rounded-full" />
            Swipe to explore
            <span className="w-6 h-0.5 bg-gray-300 rounded-full" />
          </p>
        </div>
      </div>
    </section>
  )
}
