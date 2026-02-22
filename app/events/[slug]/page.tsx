import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { EventViewTracker } from '@/components/EventViewTracker'
import { EventInterestButton } from '@/components/EventInterestButton'
import { EventShareButton } from '@/components/EventShareButton'
import { EventDetailHeader } from '@/components/EventDetailHeader'
import { StaticMapCard } from '@/components/StaticMapCard'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { EventCard } from '@/components/EventCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Building2, Clock, Sparkles, Eye, User, Phone, Users, ArrowRight } from 'lucide-react'

// Default event image from Unsplash
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'

// Revalidate every 2 minutes
export const revalidate = 120

// Pre-render top 50 most-viewed events at build time
export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: events } = await supabase
    .from('events')
    .select('slug')
    .order('view_count', { ascending: false })
    .limit(50)

  return (events || []).map((event) => ({
    slug: event.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, event_categories:category_id (name), image_url, start_date')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Event Not Found' }

  const categoryName = (event.event_categories as { name: string } | null)?.name || ''
  const dateStr = event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const description = event.description
    ? event.description.slice(0, 155)
    : `${event.title} - ${categoryName} event in Guyana${dateStr ? ` on ${dateStr}` : ''}.`

  return {
    title: `${event.title}${dateStr ? ` - ${dateStr}` : ''}`,
    description,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title: `${event.title} | Waypoint`,
      description,
      ...(event.image_url ? { images: [{ url: event.image_url, width: 1200, height: 630, alt: event.title }] } : {}),
    },
  }
}

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Parallelize auth + event fetch (independent queries)
  const [userResult, eventResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('events')
      .select(`
        *,
        event_categories:category_id (id, name, icon),
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
      .single(),
  ])

  const user = userResult.data.user
  const event = eventResult.data

  if (!event) {
    notFound()
  }

  // Parallelize creator profile, interest check, and related events (all independent)
  const [creatorProfileResult, interestResult, relatedEventsResult] = await Promise.all([
    event.user_id
      ? supabase.from('profiles').select('name').eq('id', event.user_id).single()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('event_interests').select('id').eq('event_id', event.id).eq('user_id', user.id).single()
      : Promise.resolve({ data: null }),
    event.event_categories?.id
      ? supabase
          .from('events')
          .select(`
            id, title, slug, start_date, end_date, image_url, location,
            is_featured, view_count, interest_count,
            event_categories:category_id (name, icon),
            businesses:business_id (name, slug)
          `)
          .eq('category_id', event.event_categories.id)
          .neq('id', event.id)
          .gt('end_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3)
      : Promise.resolve({ data: null }),
  ])

  const creatorProfile = creatorProfileResult.data as { name: string | null } | null
  const userIsInterested = !!interestResult.data
  const relatedEvents = (relatedEventsResult.data || []) as Array<{
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
  }>

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

  // JSON-LD structured data for Event
  const eventBusiness = event.businesses as { name: string; slug: string; address: string; regions: { name: string } | null } | null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || undefined,
    url: `https://waypointgy.com/events/${event.slug}`,
    image: event.image_url || undefined,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.location || eventBusiness ? {
      location: {
        '@type': 'Place',
        name: event.location || eventBusiness?.name,
        ...(eventBusiness?.address ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: eventBusiness.address,
            addressRegion: eventBusiness.regions?.name,
            addressCountry: 'GY',
          },
        } : {}),
      },
    } : {}),
    ...(eventBusiness ? {
      organizer: {
        '@type': 'Organization',
        name: eventBusiness.name,
        url: `https://waypointgy.com/businesses/${eventBusiness.slug}`,
      },
    } : {}),
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

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

      <div className={`min-h-screen ${isPast ? 'bg-gradient-to-br from-gray-50 via-gray-100/30 to-gray-50' : 'bg-gradient-to-br from-gray-50 via-emerald-50/30 to-amber-50/20'}`}>
        {/* Improved sticky header with title and share */}
        <EventDetailHeader title={event.title} slug={event.slug} />

        <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 animate-slide-in">
              {/* Event Image */}
              <div className={`group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${isPast ? 'opacity-80' : ''}`}>
                <div className="aspect-video w-full relative overflow-hidden">
                  <Image
                    src={event.image_url || DEFAULT_EVENT_IMAGE}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    priority
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Past event overlay */}
                  {isPast && (
                    <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                      <span className="px-6 py-3 bg-gray-900/70 backdrop-blur-sm text-white font-semibold rounded-full text-lg">
                        This event has ended
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                {/* Badges */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {event.is_featured && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-full shadow-md animate-scale-in">
                      <Sparkles className="w-4 h-4" />
                      Featured Event
                    </span>
                  )}
                  {event.event_categories && (
                    <span className="px-4 py-2 text-sm font-semibold bg-emerald-100 text-emerald-700 rounded-full border-2 border-emerald-200 hover:bg-emerald-200 transition-colors duration-200">
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {event.title}
                </h1>

                {/* Event Type */}
                {event.event_type && (
                  <p className="text-lg text-emerald-600 font-semibold mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    {event.event_type}
                  </p>
                )}

                {/* Date and Time */}
                <div className="space-y-4 mb-8 pb-8 border-b-2 border-gray-100">
                  <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100/70 transition-colors duration-200">
                    <div className="p-2 bg-emerald-600 rounded-lg shadow-md">
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
                    <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100/70 transition-colors duration-200">
                      <div className="p-2 bg-amber-600 rounded-lg shadow-md">
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
                      <span className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-amber-500 rounded-full" />
                      About This Event
                    </h2>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg pl-5 border-l-2 border-emerald-100">
                      {event.description}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Eye className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {event.view_count} {event.view_count === 1 ? 'view' : 'views'}
                    </span>
                  </div>
                  {(event.interest_count ?? 0) > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {event.interest_count} interested
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-amber-500 rounded-full" />
                      More {event.event_categories?.name || ''} Events
                    </h2>
                    {event.event_categories && (
                      <Link
                        href={`/events?category=${event.event_categories.id}`}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        View all
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedEvents.map((relatedEvent) => (
                      <EventCard
                        key={relatedEvent.id}
                        event={{
                          ...relatedEvent,
                          is_featured: relatedEvent.is_featured ?? false,
                          event_categories: relatedEvent.event_categories ? {
                            name: relatedEvent.event_categories.name,
                            icon: relatedEvent.event_categories.icon || ''
                          } : null,
                          businesses: relatedEvent.businesses,
                        }}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past event CTA */}
              {isPast && (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                  <p className="text-gray-600 mb-4">This event has ended. Check out upcoming events!</p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Browse Upcoming Events
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-20 space-y-6 hover:shadow-xl transition-shadow duration-300">
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

                {/* Share Button */}
                <div className={!isPast ? '' : 'pb-6 border-b-2 border-gray-100'}>
                  <EventShareButton title={event.title} slug={event.slug} />
                </div>

                {/* Contact Button */}
                {event.businesses && event.businesses.phone && (
                  <div>
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
                <div className="pt-6 border-t-2 border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-emerald-600 to-amber-500 rounded-full" />
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
                            <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              {event.businesses.regions.name}
                            </p>
                          )}
                        </div>
                      </Link>

                      {event.businesses.address && (
                        <div className="flex items-start gap-3 text-sm text-gray-700 pl-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{event.businesses.address}</span>
                        </div>
                      )}
                    </div>
                  ) : creatorProfile?.name ? (
                    /* User Organizer */
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-100">
                      <div className="p-2 bg-emerald-600 rounded-lg shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          {creatorProfile.name}
                        </p>
                        <p className="text-sm text-emerald-600 font-medium">
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
