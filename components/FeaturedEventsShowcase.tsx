'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Sparkles, ArrowRight, Users } from 'lucide-react'

type Event = {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  is_featured: boolean | null
  interest_count: number | null
  event_categories: { name: string; icon: string | null } | null
  businesses: { name: string; slug: string } | null
  source_type?: 'community' | 'business'
  business_slug?: string | null
}

interface FeaturedEventsShowcaseProps {
  events: Event[]
}

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'

export function FeaturedEventsShowcase({ events }: FeaturedEventsShowcaseProps) {
  // Get up to 3 featured events
  const featuredEvents = events.filter(e => e.is_featured).slice(0, 3)

  if (featuredEvents.length === 0) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const heroEvent = featuredEvents[0]
  const sideEvents = featuredEvents.slice(1, 3)

  const getEventHref = (event: Event) =>
    event.source_type === 'business' && event.business_slug
      ? `/businesses/${event.business_slug}`
      : `/events/${event.slug}`

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/25">
            <Sparkles className="h-5 w-5 text-amber-950" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-gray-900">Featured Events</h2>
            <p className="text-sm text-gray-500">Handpicked experiences you won&apos;t want to miss</p>
          </div>
        </div>
        <Link
          href="/events?sort=featured"
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured Grid - Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Hero Featured Event - Large Card */}
        <Link
          href={getEventHref(heroEvent)}
          className="lg:col-span-2 lg:row-span-2 group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50/30 to-emerald-50 min-h-[320px] lg:min-h-[420px]"
        >
          <Image
            src={heroEvent.image_url || DEFAULT_EVENT_IMAGE}
            alt={heroEvent.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Glass card effect at top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </span>
            {heroEvent.event_categories && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
                {heroEvent.event_categories.name}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <h3 className="font-display text-2xl lg:text-3xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-amber-200 transition-colors">
              {heroEvent.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{formatDate(heroEvent.start_date)}</span>
              </div>
              {heroEvent.location && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium line-clamp-1">{heroEvent.location}</span>
                </div>
              )}
            </div>

            {/* Interest count */}
            {heroEvent.interest_count != null && heroEvent.interest_count > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Users className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold text-white">{heroEvent.interest_count} interested</span>
              </div>
            )}
          </div>

          {/* Hover arrow indicator */}
          <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 p-3 bg-white/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </Link>

        {/* Side Featured Events - Smaller Cards */}
        {sideEvents.map((event) => (
          <Link
            key={event.id}
            href={getEventHref(event)}
            className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50/30 to-emerald-50 min-h-[200px] lg:min-h-0"
          >
            <Image
              src={event.image_url || DEFAULT_EVENT_IMAGE}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Featured Badge */}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold rounded-full shadow-md">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
                {event.title}
              </h3>

              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatDate(event.start_date)}</span>
                </div>
                {event.interest_count != null && event.interest_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-medium">{event.interest_count}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile view all link */}
      <Link
        href="/events?sort=featured"
        className="sm:hidden flex items-center justify-center gap-2 mt-4 px-4 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
      >
        View all featured events
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
