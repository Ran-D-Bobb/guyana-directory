import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Building2, Sparkles, User, Star } from 'lucide-react'
import { Database } from '@/types/supabase'

type Event = Database['public']['Tables']['events']['Row'] & {
  event_categories: { name: string; icon: string } | null
  businesses: {
    name: string
    slug: string
  } | null
  profiles?: {
    name: string | null
  } | null
}

interface EventCardProps {
  event: Event
}

// Default event image from Unsplash
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'

export function EventCard({ event }: EventCardProps) {
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

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      {/* Event Image */}
      <div className="relative w-full h-56 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 overflow-hidden">
        <Image
          src={event.image_url || DEFAULT_EVENT_IMAGE}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay - appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        {isOngoing && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full" />
              Happening Now
            </span>
          </div>
        )}
        {isPast && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gray-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            Past Event
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {event.is_featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </span>
          )}
          {event.event_categories && (
            <span className="px-3 py-1.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
              {event.event_categories.name}
            </span>
          )}
        </div>

        {/* Event title */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
          {event.title}
        </h3>

        {/* Date */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700 font-medium line-clamp-2 leading-relaxed">{dateDisplay}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-2.5 mb-4">
            <div className="p-1.5 bg-pink-100 rounded-lg">
              <MapPin className="w-4 h-4 text-pink-600" />
            </div>
            <span className="text-sm text-gray-600 line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Organizer and Interest */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {event.businesses ? (
              <>
                <div className="p-1 bg-emerald-100 rounded">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-emerald-600 font-semibold line-clamp-1 hover:underline">
                  {event.businesses.name}
                </span>
              </>
            ) : event.profiles?.name ? (
              <>
                <div className="p-1 bg-gray-100 rounded">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-600 font-medium line-clamp-1">
                  {event.profiles.name}
                </span>
              </>
            ) : null}
          </div>

          {/* Interest Count */}
          {event.interest_count != null && event.interest_count > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
              <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
              <span className="text-sm font-bold text-purple-700">{event.interest_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
