import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requirePersonalAccount } from '@/lib/account-type'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  ChevronLeft,
  MapPin,
  Star,
  Sparkles,
  BadgeCheck,
  Calendar,
  Clock,
  Building2,
  CalendarDays,
  Search
} from 'lucide-react'
import { SaveBusinessButton } from '@/components/SaveBusinessButton'
import { SavedPageTabs } from './SavedPageTabs'

export const metadata = {
  title: 'Saved - Waypoint',
  description: 'Your saved businesses and interested events',
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export default async function SavedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  await requirePersonalAccount(user.id)

  // Fetch saved businesses
  const { data: savedBusinessesData } = await supabase
    .from('saved_businesses')
    .select(`
      id,
      created_at,
      business_id,
      businesses:business_id (
        id,
        name,
        slug,
        description,
        rating,
        review_count,
        is_verified,
        is_featured,
        categories:category_id (name),
        regions:region_id (name),
        business_photos (image_url, is_primary)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch interested events
  const { data: interestedEventsData } = await supabase
    .from('event_interests')
    .select(`
      event_id,
      created_at,
      events:event_id (
        id,
        title,
        slug,
        description,
        image_url,
        start_date,
        end_date,
        location,
        event_categories:category_id (name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Process businesses
  const savedBusinesses = (savedBusinessesData || [])
    .filter(sb => sb.businesses)
    .map(sb => {
      const business = sb.businesses as {
        id: string
        name: string
        slug: string
        description: string | null
        rating: number | null
        review_count: number | null
        is_verified: boolean | null
        is_featured: boolean | null
        categories: { name: string } | null
        regions: { name: string } | null
        business_photos: { image_url: string; is_primary: boolean | null }[]
      }
      const photos = business.business_photos || []
      const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || null
      return {
        ...business,
        primary_photo: primaryPhoto,
        saved_at: sb.created_at,
      }
    })

  // Process events
  const interestedEvents = (interestedEventsData || [])
    .filter(ei => ei.events)
    .map(ei => ei.events as {
      id: string
      title: string
      slug: string
      description: string | null
      image_url: string | null
      start_date: string
      end_date: string | null
      location: string | null
      event_categories: { name: string; slug: string } | null
    })

  // Separate events into upcoming and past
  const now = new Date()
  const upcomingEvents = interestedEvents.filter(e => new Date(e.start_date) >= now)
  const pastEvents = interestedEvents.filter(e => new Date(e.start_date) < now)

  const totalSaved = savedBusinesses.length + interestedEvents.length

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-7 h-7 text-white fill-white/50" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">Saved</h1>
              <p className="text-rose-100">
                {totalSaved} {totalSaved === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SavedPageTabs
        businessCount={savedBusinesses.length}
        eventCount={interestedEvents.length}
      />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        {/* Businesses Section */}
        <section id="businesses" className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">Favorite Businesses</h2>
            <span className="text-sm text-gray-500">({savedBusinesses.length})</span>
          </div>

          {savedBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <Link href={`/businesses/${business.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <Image
                        src={business.primary_photo || DEFAULT_BUSINESS_IMAGE}
                        alt={business.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {business.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        {business.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
                            <BadgeCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {business.rating != null && business.rating > 0 && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-white">{business.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {business.categories && (
                        <p className="text-xs font-semibold text-[hsl(var(--jungle-600))] mb-1 uppercase tracking-wider">
                          {business.categories.name}
                        </p>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-[hsl(var(--jungle-600))] transition-colors">
                        {business.name}
                      </h3>
                      {business.regions && (
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {business.regions.name}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="absolute top-3 right-3 z-10">
                    <SaveBusinessButton
                      businessId={business.id}
                      initialIsSaved={true}
                      userId={user.id}
                      variant="overlay"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Heart className="w-7 h-7 text-rose-400" />
              </div>
              <p className="text-gray-500 mb-4">No saved businesses yet</p>
              <Link
                href="/businesses"
                className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                <Search className="w-4 h-4" />
                Browse businesses
              </Link>
            </div>
          )}
        </section>

        {/* Events Section */}
        <section id="events">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900">Interested Events</h2>
            <span className="text-sm text-gray-500">({interestedEvents.length})</span>
          </div>

          {interestedEvents.length > 0 ? (
            <div className="space-y-8">
              {/* Upcoming */}
              {upcomingEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Upcoming</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents.map((event) => (
                      <EventMiniCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastEvents.length > 0 && (
                <div className="opacity-60">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-500">Past</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastEvents.map((event) => (
                      <EventMiniCard key={event.id} event={event} isPast />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Star className="w-7 h-7 text-purple-400" />
              </div>
              <p className="text-gray-500 mb-4">No interested events yet</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Calendar className="w-4 h-4" />
                Browse events
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// Mini Event Card Component
function EventMiniCard({ event, isPast = false }: {
  event: {
    id: string
    title: string
    slug: string
    image_url: string | null
    start_date: string
    location: string | null
    event_categories: { name: string } | null
  }
  isPast?: boolean
}) {
  const eventDate = new Date(event.start_date)
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
  const day = eventDate.getDate()

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group flex gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all ${isPast ? 'grayscale' : ''}`}
    >
      {/* Date Badge */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white">
        <span className="text-[10px] font-bold uppercase">{month}</span>
        <span className="text-xl font-bold leading-none">{day}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {event.title}
        </h4>
        {event.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {event.location}
          </p>
        )}
      </div>
    </Link>
  )
}
