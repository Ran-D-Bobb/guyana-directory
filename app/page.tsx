import { createClient } from '@/lib/supabase/server'
import { PremiumSpotlight } from '@/components/PremiumSpotlight'
import { HeroSection } from '@/components/HeroSection'
import { StatsBar } from '@/components/StatsBar'
import { EnhancedBusinessCard } from '@/components/EnhancedBusinessCard'
import { EventCard } from '@/components/EventCard'
import { ExperienceCard } from '@/components/tourism/ExperienceCard'
import { RentalCard } from '@/components/RentalCard'
import Link from 'next/link'
import { TrendingUp, Plane, Home, Calendar, ArrowRight, Sparkles, Star, Crown } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Fetch ALL featured businesses (for both spotlight and businesses section)
  const { data: featuredBusinesses } = await supabase
    .from('businesses')
    .select(`
      *,
      categories:category_id (name),
      regions:region_id (name),
      business_photos (
        image_url,
        is_primary
      )
    `)
    .eq('is_featured', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(30)

  const allFeaturedBusinesses = (featuredBusinesses || []).map(b => ({
    ...b,
    primary_photo: Array.isArray(b.business_photos)
      ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || null
      : null
  }))

  // Fetch ALL featured tourism experiences (for both spotlight and experiences section)
  const { data: featuredExperiences } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories:tourism_category_id (name, icon),
      regions:region_id (name),
      tourism_photos:tourism_photos (image_url, is_primary, display_order)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(30)

  // Fetch ALL featured rentals (for both spotlight and rentals section)
  const { data: featuredRentals } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories:category_id (name, slug, icon),
      regions:region_id (name),
      rental_photos:rental_photos (image_url, is_primary, display_order)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(30)

  // Fetch ALL featured events (for both spotlight and events section)
  const now = new Date().toISOString()
  const { data: featuredEvents } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug),
      profiles:user_id (name)
    `)
    .eq('is_featured', true)
    .gt('start_date', now)
    .order('interest_count', { ascending: false, nullsFirst: false })
    .order('start_date', { ascending: true })
    .limit(30)

  // Prepare spotlight items - mix ALL featured items from all types, sorted by quality
  const allSpotlightCandidates = [
    ...allFeaturedBusinesses.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      image_url: b.primary_photo || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
      rating: b.rating || 0,
      review_count: b.review_count || 0,
      location: b.regions?.name || '',
      type: 'business' as const,
      slug: b.slug,
      category: b.categories?.name,
      whatsapp_number: b.whatsapp_number,
      price: undefined,
      view_count: b.view_count || 0,
    })),
    ...(featuredExperiences || []).map(exp => {
      const primaryPhoto = Array.isArray(exp.tourism_photos)
        ? exp.tourism_photos.find(p => p.is_primary)?.image_url || exp.tourism_photos[0]?.image_url
        : null
      return {
        id: exp.id,
        name: exp.name,
        description: exp.description || '',
        image_url: primaryPhoto || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=600&fit=crop',
        rating: exp.rating || 0,
        review_count: exp.review_count || 0,
        location: exp.regions?.name || '',
        type: 'tourism' as const,
        slug: exp.slug,
        category: exp.tourism_categories?.name,
        whatsapp_number: exp.whatsapp_number,
        price: exp.price_from ? `From GYD ${exp.price_from.toLocaleString()}` : undefined,
        view_count: exp.view_count || 0,
      }
    }),
    ...(featuredRentals || []).map(rental => {
      const primaryPhoto = Array.isArray(rental.rental_photos)
        ? rental.rental_photos.find(p => p.is_primary)?.image_url || rental.rental_photos[0]?.image_url
        : null
      return {
        id: rental.id,
        name: rental.name,
        description: rental.description || '',
        image_url: primaryPhoto || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop',
        rating: rental.rating || 0,
        review_count: rental.review_count || 0,
        location: rental.regions?.name || '',
        type: 'rental' as const,
        slug: rental.slug,
        category: rental.rental_categories?.name,
        whatsapp_number: rental.whatsapp_number,
        price: rental.price_per_month ? `GYD ${rental.price_per_month.toLocaleString()}/month` : undefined,
        view_count: rental.view_count || 0,
      }
    }),
    ...(featuredEvents || []).map(event => {
      return {
        id: event.id,
        name: event.name,
        description: event.description || '',
        image_url: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
        rating: 0,
        review_count: event.interest_count || 0,
        location: event.location || '',
        type: 'event' as const,
        slug: event.slug,
        category: event.event_categories?.name,
        whatsapp_number: event.whatsapp_number,
        price: event.is_free ? 'Free Event' : (event.ticket_price ? `GYD ${event.ticket_price}` : undefined),
        view_count: event.view_count || 0,
      }
    }),
  ]

  // Sort by quality score (rating * 10 + view_count/100) and take top 25-30
  const spotlightItems = allSpotlightCandidates
    .sort((a, b) => {
      const scoreA = (a.rating * 10) + (a.view_count / 100)
      const scoreB = (b.rating * 10) + (b.view_count / 100)
      return scoreB - scoreA
    })
    .slice(0, 30)

  // Get counts for stats
  const { count: businessCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true })
  const { count: experienceCount } = await supabase.from('tourism_experiences').select('*', { count: 'exact', head: true }).eq('is_approved', true)
  const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('is_approved', true)
  const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen">
      {/* Immersive Hero Section */}
      <HeroSection />

      {/* Premium Spotlight Carousel */}
      <section className="py-0 bg-gradient-to-b from-white via-gray-50 to-white">
        <PremiumSpotlight items={spotlightItems} />
      </section>

      {/* Stats Bar - Powering Guyana's Discovery */}
      <StatsBar
        businesses={businessCount || 0}
        experiences={experienceCount || 0}
        rentals={rentalCount || 0}
        events={eventCount || 0}
      />

      {/* Featured Tourism Experiences - EXPANDED */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      {featuredExperiences && featuredExperiences.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-3xl mt-0 mb-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
                <Plane className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Featured Experiences
              </h2>
              <Star className="h-8 w-8 text-emerald-500 fill-emerald-500" />
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Discover the beauty of Guyana • Sponsored tours</p>
            <Link
              href="/tourism"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all font-bold text-lg"
            >
              Explore All Experiences
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Properties - EXPANDED */}
      {featuredRentals && featuredRentals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse-glow">
                <Home className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Premium Properties
              </h2>
              <Star className="h-8 w-8 text-blue-500 fill-blue-500" />
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Featured rentals • Find your perfect home</p>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all font-bold text-lg"
            >
              Browse All Properties
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Events - EXPANDED */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-3xl my-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse-glow">
                <Calendar className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Upcoming Events
              </h2>
              <Star className="h-8 w-8 text-purple-500 fill-purple-500" />
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Don&apos;t miss out • Featured happenings</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all font-bold text-lg"
            >
              View All Events
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center shadow-lg shadow-black/30 border border-gray-700">
                  <span className="text-2xl font-bold text-white">W</span>
                </div>
                <span className="text-3xl font-bold text-white">
                  Waypoint
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Guyana&apos;s premier discovery platform for businesses, tourism experiences, properties, and events.
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 Waypoint. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Discover</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/businesses" className="hover:text-emerald-400 transition-colors">Businesses</Link></li>
                <li><Link href="/tourism" className="hover:text-emerald-400 transition-colors">Tourism</Link></li>
                <li><Link href="/rentals" className="hover:text-emerald-400 transition-colors">Rentals</Link></li>
                <li><Link href="/events" className="hover:text-emerald-400 transition-colors">Events</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard/my-business" className="hover:text-emerald-400 transition-colors">List Your Business</Link></li>
                <li><Link href="/dashboard/my-tourism" className="hover:text-emerald-400 transition-colors">List Your Experience</Link></li>
                <li><Link href="/dashboard/my-rentals" className="hover:text-emerald-400 transition-colors">List Your Property</Link></li>
                <li>
                  <a
                    href="https://wa.me/5925551234?text=I need help with Waypoint"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
