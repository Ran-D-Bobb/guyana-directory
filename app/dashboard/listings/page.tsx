import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireBusinessAccount } from '@/lib/account-type'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  LayoutGrid,
  Building2,
  CalendarDays,
  Compass,
  Home,
  Plus,
  Eye,
  Star,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react'

export const metadata = {
  title: 'My Listings - Waypoint',
  description: 'Manage all your listings in one place',
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export default async function ListingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  await requireBusinessAccount(user.id)

  // Fetch all user listings in parallel
  const [businessResult, eventsResult, tourismResult, rentalsResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, slug, rating, review_count, view_count, is_featured, is_verified, categories(name), business_photos(image_url, is_primary)')
      .eq('owner_id', user.id)
      .limit(3),
    supabase
      .from('events')
      .select('id, title, slug, start_date, view_count, interest_count, image_url, event_categories:category_id(name)')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(4),
    supabase
      .from('tourism_experiences')
      .select('id, name, slug, rating, review_count, view_count, tourism_categories(name), tourism_photos(image_url, is_primary)')
      .eq('operator_id', user.id)
      .limit(3),
    supabase
      .from('rentals')
      .select('id, name, slug, price_per_month, view_count, rating, rental_categories(name), rental_photos(image_url, is_primary)')
      .eq('landlord_id', user.id)
      .limit(3),
  ])

  const business = businessResult.data?.[0] || null
  const events = eventsResult.data || []
  const tourismExperiences = tourismResult.data || []
  const rentals = rentalsResult.data || []

  // Calculate totals
  const totalListings = (business ? 1 : 0) + events.length + tourismExperiences.length + rentals.length
  const hasAnyListings = totalListings > 0

  // Listing type configs
  const listingTypes = [
    {
      id: 'business',
      label: 'Business',
      icon: Building2,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50',
      href: '/dashboard/my-business',
      createHref: '/dashboard/my-business/create',
      count: business ? 1 : 0,
      items: business ? [business] : [],
    },
    {
      id: 'events',
      label: 'Events',
      icon: CalendarDays,
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
      lightBg: 'bg-purple-50',
      href: '/dashboard/my-events',
      createHref: '/dashboard/my-events/create',
      count: events.length,
      items: events,
    },
    {
      id: 'tourism',
      label: 'Tourism',
      icon: Compass,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50',
      href: '/dashboard/my-tourism',
      createHref: '/dashboard/my-tourism/create',
      count: tourismExperiences.length,
      items: tourismExperiences,
    },
    {
      id: 'rentals',
      label: 'Rentals',
      icon: Home,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      lightBg: 'bg-blue-50',
      href: '/dashboard/my-rentals',
      createHref: '/dashboard/my-rentals/create',
      count: rentals.length,
      items: rentals,
    },
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--jungle-700))] via-[hsl(var(--jungle-800))] to-[hsl(var(--jungle-900))]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[hsl(var(--gold-400))]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[hsl(var(--jungle-400))]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <LayoutGrid className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">My Listings</h1>
                <p className="text-white/60">
                  {totalListings} {totalListings === 1 ? 'listing' : 'listings'} across all categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-4 gap-3">
          {listingTypes.map((type) => (
            <Link
              key={type.id}
              href={type.href}
              className="card-elevated rounded-xl p-4 text-center group hover:scale-[1.02] transition-transform"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{type.count}</p>
              <p className="text-xs text-gray-500">{type.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {hasAnyListings ? (
          <div className="space-y-8">
            {listingTypes.map((type) => (
              <section key={type.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                    <h2 className="text-lg font-bold text-gray-900">{type.label}</h2>
                    <span className="text-sm text-gray-500">({type.count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={type.createHref}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-${type.color}-600 hover:bg-${type.color}-50 rounded-lg transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </Link>
                    {type.count > 0 && (
                      <Link
                        href={type.href}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        View all
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {type.count > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {type.id === 'business' && business && (
                      <BusinessCard business={business} />
                    )}
                    {type.id === 'events' && events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                    {type.id === 'tourism' && tourismExperiences.map((exp) => (
                      <TourismCard key={exp.id} experience={exp} />
                    ))}
                    {type.id === 'rentals' && rentals.map((rental) => (
                      <RentalCard key={rental.id} rental={rental} />
                    ))}
                  </div>
                ) : (
                  <div className={`${type.lightBg} rounded-2xl p-6 text-center border border-dashed border-gray-200`}>
                    <type.icon className={`w-8 h-8 mx-auto mb-3 text-${type.color}-400`} />
                    <p className="text-gray-600 mb-3">No {type.label.toLowerCase()} yet</p>
                    <Link
                      href={type.createHref}
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${type.gradient} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
                    >
                      <Plus className="w-4 h-4" />
                      Create {type.label}
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--jungle-100))] to-emerald-100 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[hsl(var(--jungle-500))]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start sharing with your community</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first listing to reach locals and visitors across Guyana.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {listingTypes.map((type) => (
                <Link
                  key={type.id}
                  href={type.createHref}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${type.lightBg} hover:scale-105 transition-transform`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                    <type.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Mini Cards for each type
function BusinessCard({ business }: { business: { name: string; slug: string; rating: number | null; view_count: number | null; is_featured: boolean | null; categories: { name: string } | null; business_photos: { image_url: string; is_primary: boolean | null }[] } }) {
  const photo = business.business_photos?.find(p => p.is_primary)?.image_url || business.business_photos?.[0]?.image_url || DEFAULT_IMAGE
  return (
    <Link href={`/businesses/${business.slug}`} className="group flex gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={photo} alt={business.name} fill className="object-cover" sizes="64px" />
        {business.is_featured && (
          <div className="absolute top-1 left-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{business.name}</h3>
        {business.categories && <p className="text-xs text-gray-500">{business.categories.name}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {business.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {business.rating.toFixed(1)}
            </span>
          )}
          {business.view_count != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {business.view_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function EventCard({ event }: { event: { title: string; slug: string; start_date: string; view_count: number | null; interest_count: number | null; image_url: string | null; event_categories: { name: string } | null } }) {
  const eventDate = new Date(event.start_date)
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
  const day = eventDate.getDate()
  const isPast = eventDate < new Date()

  return (
    <Link href={`/events/${event.slug}`} className={`group flex gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white">
        <span className="text-[10px] font-bold uppercase">{month}</span>
        <span className="text-lg font-bold leading-none">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">{event.title}</h3>
        {event.event_categories && <p className="text-xs text-gray-500">{event.event_categories.name}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {event.view_count != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {event.view_count}
            </span>
          )}
          {event.interest_count != null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.interest_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function TourismCard({ experience }: { experience: { name: string; slug: string; rating: number | null; view_count: number | null; tourism_categories: { name: string } | null; tourism_photos: { image_url: string; is_primary: boolean | null }[] | null } }) {
  const photo = experience.tourism_photos?.find(p => p.is_primary)?.image_url || experience.tourism_photos?.[0]?.image_url || null
  return (
    <Link href={`/tourism/${experience.slug}`} className="group flex gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-amber-100">
        {photo ? (
          <Image src={photo} alt={experience.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{experience.name}</h3>
        {experience.tourism_categories && <p className="text-xs text-gray-500">{experience.tourism_categories.name}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {experience.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {experience.rating.toFixed(1)}
            </span>
          )}
          {experience.view_count != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {experience.view_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function RentalCard({ rental }: { rental: { name: string; slug: string; price_per_month: number | null; view_count: number | null; rating: number | null; rental_categories: { name: string } | null; rental_photos: { image_url: string; is_primary: boolean | null }[] | null } }) {
  const photo = rental.rental_photos?.find(p => p.is_primary)?.image_url || rental.rental_photos?.[0]?.image_url || null
  return (
    <Link href={`/rentals/${rental.slug}`} className="group flex gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100">
        {photo ? (
          <Image src={photo} alt={rental.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-6 h-6 text-blue-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{rental.name}</h3>
        {rental.price_per_month && (
          <p className="text-sm font-semibold text-blue-600">${rental.price_per_month.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {rental.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rental.rating.toFixed(1)}
            </span>
          )}
          {rental.view_count != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {rental.view_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
