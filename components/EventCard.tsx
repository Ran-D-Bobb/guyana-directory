import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Building2, Sparkles, User, Users, Tag } from 'lucide-react'

type Event = {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  is_featured: boolean | null
  view_count: number | null
  interest_count: number | null
  event_categories: { name: string; icon: string | null } | null
  businesses: { name: string; slug: string } | null
  profiles?: { name: string | null } | null
  source_type?: 'community' | 'business'
  business_slug?: string | null
}

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

// Default event image from Unsplash
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  // Format date range
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)
  const isSameDay = startDate.toDateString() === endDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const dateDisplay = isSameDay
    ? `${formatDate(startDate)} at ${formatTime(startDate)}`
    : `${formatDate(startDate)} - ${formatDate(endDate)}`

  // Check if event is upcoming or ongoing
  const now = new Date()
  const isOngoing = startDate <= now && endDate >= now
  const isPast = endDate < now
  const isFeatured = event.is_featured
  const isBusinessEvent = event.source_type === 'business'

  // Business events link to the business page, community events link to the event detail page
  const href = isBusinessEvent && event.business_slug
    ? `/businesses/${event.business_slug}`
    : `/events/${event.slug}`

  // Dynamic classes based on variant and featured status
  const cardClasses = `
    group block rounded-2xl overflow-hidden transition-all duration-500 ease-out
    ${isFeatured && variant !== 'compact'
      ? 'bg-gradient-to-br from-white via-white to-emerald-50/30 border border-emerald-200/60 shadow-lg shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 hover:border-emerald-300/80'
      : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1'
    }
  `

  return (
    <Link href={href} className={cardClasses}>
      {/* Event Image */}
      <div className="relative w-full h-56 bg-gradient-to-br from-emerald-100 via-amber-50/30 to-emerald-50 overflow-hidden">
        <Image
          src={event.image_url || DEFAULT_EVENT_IMAGE}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay - always visible, intensifies on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Top gradient for badges */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Status Badge - Live indicator with glow instead of pulse */}
        {isOngoing && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-transparent">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Live Now
            </span>
          </div>
        )}
        {isPast && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gray-900/70 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full">
            Past Event
          </div>
        )}

        {/* Featured badge on image */}
        {isFeatured && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </span>
          </div>
        )}

        {/* Promotion badge for business events */}
        {isBusinessEvent && !isFeatured && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Promotion
            </span>
          </div>
        )}

        {/* Date overlay on image bottom */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold drop-shadow-lg">{dateDisplay}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Category Badge */}
        {event.event_categories && (
          <div className="mb-3">
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
              isBusinessEvent
                ? 'bg-purple-50 text-purple-700 border-purple-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              {event.event_categories.name}
            </span>
          </div>
        )}

        {/* Event title */}
        <h3 className="font-display font-semibold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
          {event.title}
        </h3>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-2.5 mb-4">
            <div className="p-1.5 bg-amber-50 rounded-lg flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-600 line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Organizer and Interest */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {event.businesses ? (
              <>
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-emerald-700 font-medium line-clamp-1">
                  {event.businesses.name}
                </span>
              </>
            ) : event.profiles?.name ? (
              <>
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-600 font-medium line-clamp-1">
                  {event.profiles.name}
                </span>
              </>
            ) : null}
          </div>

          {/* Interest Count - social proof */}
          {event.interest_count != null && event.interest_count > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-full border border-amber-200/50">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{event.interest_count} interested</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
