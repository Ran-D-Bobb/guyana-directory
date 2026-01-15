import { createClient } from '@/lib/supabase/server'
import { EventViewTracker } from '@/components/EventViewTracker'
import { EventInterestButton } from '@/components/EventInterestButton'
import { StaticMapCard } from '@/components/StaticMapCard'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar, MapPin, Building2, Clock, Sparkles, Eye, User, Phone } from 'lucide-react'

// Default event image from Unsplash
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch the event with category, business, and creator
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (
        id,
        name,
        slug,
        phone,
        email,
        website,
        address,
        regions:region_id (name)
      )
    `)
    .eq('slug', slug)
    .single()

  // Fetch creator profile separately if there's a user_id
  let creatorProfile = null
  if (event?.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', event.user_id)
      .single()
    creatorProfile = profile
  }

  if (!event) {
    notFound()
  }

  // Check if current user has marked interest
  let userIsInterested = false
  if (user) {
    const { data: interest } = await supabase
      .from('event_interests')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()

    userIsInterested = !!interest
  }

  // Format dates
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)
  const isSameDay = startDate.toDateString() === endDate.toDateString()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  // Check event status
  const now = new Date()
  const isOngoing = startDate <= now && endDate >= now
  const isPast = endDate < now

  return (
    <>
      {/* Track event view */}
      <EventViewTracker eventId={event.id} />

      {/* Track recently viewed */}
      <RecentlyViewedTracker
        type="event"
        id={event.id}
        slug={event.slug}
        name={event.title}
        image={event.image_url || DEFAULT_EVENT_IMAGE}
        category={event.event_categories?.name}
        location={event.location || undefined}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Events</span>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 animate-slide-in">
              {/* Event Image */}
              <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video w-full relative overflow-hidden">
                  <Image
                    src={event.image_url || DEFAULT_EVENT_IMAGE}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    priority
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                {/* Badges */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {event.is_featured && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-md animate-scale-in">
                      <Sparkles className="w-4 h-4" />
                      Featured Event
                    </span>
                  )}
                  {event.event_categories && (
                    <span className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-700 rounded-full border-2 border-purple-200 hover:bg-purple-200 transition-colors duration-200">
                      {event.event_categories.name}
                    </span>
                  )}
                  {isOngoing && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-md animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Happening Now
                    </span>
                  )}
                  {isPast && (
                    <span className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                      Past Event
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                  {event.title}
                </h1>

                {/* Event Type */}
                {event.event_type && (
                  <p className="text-lg text-purple-600 font-semibold mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {event.event_type}
                  </p>
                )}

                {/* Date and Time */}
                <div className="space-y-4 mb-8 pb-8 border-b-2 border-gray-100">
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                    <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-1">
                        {isSameDay ? formatDate(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {isSameDay
                          ? `${formatTime(startDate)} - ${formatTime(endDate)}`
                          : `Starts ${formatTime(startDate)}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors duration-200">
                      <div className="p-2 bg-pink-600 rounded-lg shadow-md">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-900 font-semibold flex-1 leading-relaxed">{event.location}</p>
                    </div>
                  )}

                  {/* Location Map */}
                  {event.latitude && event.longitude && (
                    <div className="mt-4">
                      <StaticMapCard
                        latitude={event.latitude}
                        longitude={event.longitude}
                        address={event.location}
                        name={event.title}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                      About This Event
                    </h2>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg pl-5 border-l-2 border-purple-100">
                      {event.description}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {event.view_count} {event.view_count === 1 ? 'view' : 'views'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24 space-y-6 hover:shadow-xl transition-shadow duration-300">
                {/* Interest Button */}
                {!isPast && (
                  <div className="pb-6 border-b-2 border-gray-100">
                    <EventInterestButton
                      eventId={event.id}
                      initialIsInterested={userIsInterested}
                      initialInterestCount={event.interest_count || 0}
                      userId={user?.id || null}
                    />
                  </div>
                )}

                {/* Contact Button */}
                {event.businesses && event.businesses.phone && (
                  <div className={!isPast ? "" : "pb-6 border-b-2 border-gray-100"}>
                    <a
                      href={`tel:${event.businesses.phone}`}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Phone className="w-6 h-6" />
                      <span>Contact Organizer</span>
                    </a>
                  </div>
                )}

                {/* Organizer Info */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                    Organized By
                  </h3>

                  {event.businesses ? (
                    /* Business Organizer */
                    <div className="space-y-4">
                      <Link
                        href={`/businesses/${event.businesses.slug}`}
                        className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-300 hover:shadow-md border border-emerald-100"
                      >
                        <div className="p-2 bg-emerald-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 mb-1">
                            {event.businesses.name}
                          </p>
                          {event.businesses.regions && (
                            <p className="text-sm text-gray-600 font-medium">
                              📍 {event.businesses.regions.name}
                            </p>
                          )}
                        </div>
                      </Link>

                      {event.businesses.address && (
                        <div className="flex items-start gap-3 text-sm text-gray-700 pl-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <MapPin className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{event.businesses.address}</span>
                        </div>
                      )}
                    </div>
                  ) : creatorProfile?.name ? (
                    /* User Organizer */
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                      <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          {creatorProfile.name}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">
                          Community Organizer
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">Organizer information unavailable</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
