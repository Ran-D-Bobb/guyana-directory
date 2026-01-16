'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Building2,
  Calendar,
  Compass,
  Home,
  History,
  Sparkles,
} from 'lucide-react'
import { useRecentlyViewed, type RecentlyViewedItemType } from '@/hooks/useRecentlyViewed'

// Type configuration with colors and icons
const typeConfig: Record<
  RecentlyViewedItemType,
  {
    label: string
    icon: typeof Building2
    bgColor: string
    textColor: string
    borderColor: string
    href: (slug: string) => string
  }
> = {
  business: {
    label: 'Business',
    icon: Building2,
    bgColor: 'bg-[hsl(var(--jungle-100))]',
    textColor: 'text-[hsl(var(--jungle-700))]',
    borderColor: 'border-[hsl(var(--jungle-200))]',
    href: (slug) => `/businesses/${slug}`,
  },
  event: {
    label: 'Event',
    icon: Calendar,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    href: (slug) => `/events/${slug}`,
  },
  tourism: {
    label: 'Experience',
    icon: Compass,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    href: (slug) => `/tourism?experience=${slug}`,
  },
  rental: {
    label: 'Rental',
    icon: Home,
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    href: (slug) => `/rentals/${slug}`,
  },
}

interface RecentlyViewedProps {
  /** Maximum number of items to display */
  limit?: number
  /** Optional title override */
  title?: string
  /** Show section even when empty (with empty state) */
  showEmpty?: boolean
  /** Additional CSS classes */
  className?: string
}

export function RecentlyViewed({
  limit = 10,
  title = 'Recently Viewed',
  showEmpty = false,
  className = '',
}: RecentlyViewedProps) {
  const { getRecentItems, clearAll, isLoaded } = useRecentlyViewed()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const items = getRecentItems(limit)

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280 // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Format relative time
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Handle clear with confirmation
  const handleClear = () => {
    if (showClearConfirm) {
      clearAll()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  // Don't render anything while loading or if empty and showEmpty is false
  if (!isLoaded) {
    return null
  }

  if (items.length === 0 && !showEmpty) {
    return null
  }

  // Empty state
  if (items.length === 0) {
    return (
      <section className={`py-6 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[hsl(var(--jungle-100))]">
              <History className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
            </div>
            <h2 className="font-display text-xl text-[hsl(var(--jungle-800))]">
              {title}
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--jungle-50))] to-white border border-[hsl(var(--jungle-100))] p-8">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(var(--gold-100))] to-transparent opacity-50 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[hsl(var(--jungle-100))] to-transparent opacity-40 rounded-tr-full" />

            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--jungle-100))] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[hsl(var(--jungle-400))]" />
              </div>
              <p className="text-[hsl(var(--jungle-600))] font-medium mb-1">
                No browsing history yet
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Items you view will appear here for quick access
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-4 sm:py-6 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[hsl(var(--jungle-100))]">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--jungle-600))]" />
            </div>
            <h2 className="font-display text-section-title-lg text-[hsl(var(--jungle-800))]">
              {title}
            </h2>
            <span className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--jungle-50))] px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation arrows - hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-white border border-[hsl(var(--border))] text-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-50))] hover:border-[hsl(var(--jungle-200))] transition-all duration-200 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-white border border-[hsl(var(--border))] text-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-50))] hover:border-[hsl(var(--jungle-200))] transition-all duration-200 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                showClearConfirm
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showClearConfirm ? 'Confirm clear?' : 'Clear'}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable container */}
        <div className="relative group">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[hsl(var(--jungle-50))] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[hsl(var(--jungle-50))] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[hsl(var(--jungle-200))] scrollbar-track-transparent scroll-smooth snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--jungle-200)) transparent',
            }}
          >
            {items.map((item, index) => {
              const config = typeConfig[item.type]
              const Icon = config.icon

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={config.href(item.slug)}
                  className="group/card flex-shrink-0 w-[220px] sm:w-[260px] snap-start"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="relative bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-sm hover:shadow-lg hover:border-[hsl(var(--jungle-200))] transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-28 sm:h-32 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                        sizes="(max-width: 640px) 220px, 260px"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Type badge */}
                      <div
                        className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor} backdrop-blur-sm`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </div>

                      {/* Time indicator */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.viewedAt)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-semibold text-[hsl(var(--jungle-800))] line-clamp-1 group-hover/card:text-[hsl(var(--jungle-600))] transition-colors">
                        {item.name}
                      </h3>
                      {(item.category || item.location) && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-1">
                          {item.category}
                          {item.category && item.location && ' • '}
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
