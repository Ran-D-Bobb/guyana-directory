'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

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
  business: { label: 'Business', color: 'bg-amber-500' },
  tourism: { label: 'Experience', color: 'bg-emerald-500' },
  rental: { label: 'Stay', color: 'bg-blue-500' },
  event: { label: 'Event', color: 'bg-purple-500' },
}

const defaultImages = {
  business: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  tourism: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  rental: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
}

function SpotlightCard({ item }: { item: SpotlightItem }) {
  const config = typeConfig[item.type]
  const href = item.type === 'business'
    ? `/businesses/${item.slug}`
    : item.type === 'tourism'
    ? `/tourism/${item.slug}`
    : item.type === 'rental'
    ? `/rentals/${item.slug}`
    : `/events/${item.slug}`

  return (
    <Link
      href={href}
      className="group block flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-start"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={item.image_url || defaultImages[item.type]}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
          />
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`${config.color} text-white text-xs font-medium px-3 py-1.5 rounded-full`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {item.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
              {item.category}
            </p>
          )}

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">
            {item.name}
          </h3>

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}

          {/* Rating & Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {item.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-900">{item.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({item.review_count})</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">New</span>
            )}

            {item.price && (
              <span className="text-sm font-semibold text-gray-900">{item.price}</span>
            )}
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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update scroll button states
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

  // Auto-scroll for desktop (pauses on hover)
  useEffect(() => {
    if (isMobile || isHovered || !scrollRef.current) return

    const container = scrollRef.current
    const cardWidth = 360 + 16 // card width + gap

    const interval = setInterval(() => {
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScroll = scrollWidth - clientWidth

      if (scrollLeft >= maxScroll - 10) {
        // Reset to start smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll one card
        container.scrollTo({ left: scrollLeft + cardWidth, behavior: 'smooth' })
      }
    }, 4000) // Scroll every 4 seconds

    return () => clearInterval(interval)
  }, [isMobile, isHovered])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = 360 + 16
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-6 mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Featured this week
            </h2>
            <p className="text-gray-600">
              Hand-picked across Guyana
            </p>
          </div>

          {/* Desktop navigation arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border transition-all ${
                canScrollLeft
                  ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border transition-all ${
                canScrollRight
                  ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
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
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item) => (
            <SpotlightCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="md:hidden flex justify-center mt-4">
          <p className="text-xs text-gray-400">Swipe to see more</p>
        </div>
      </div>
    </section>
  )
}
