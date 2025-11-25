import { createClient } from '@/lib/supabase/server'
import { PremiumSpotlight } from '@/components/PremiumSpotlight'
import { HeroSection } from '@/components/HeroSection'
import { StatsBar } from '@/components/StatsBar'
import { EventCard } from '@/components/EventCard'
import { ExperienceCard } from '@/components/tourism/ExperienceCard'
import { RentalCard } from '@/components/RentalCard'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { Plane, Home as HomeIcon, Calendar, ArrowRight, Star } from 'lucide-react'

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
  const { data: rawExperiences } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories:tourism_category_id (name, icon),
      regions:region_id (name),
      tourism_photos (image_url, is_primary, display_order)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(30)

  // Map experiences to ensure proper types
  const featuredExperiences = (rawExperiences || []).map(exp => ({
    ...exp,
    tourism_photos: Array.isArray(exp.tourism_photos)
      ? exp.tourism_photos.map(p => ({
          image_url: p.image_url,
          is_primary: p.is_primary ?? false,
          display_order: p.display_order
        }))
      : []
  }))

  // Fetch ALL featured rentals (for both spotlight and rentals section)
  const { data: rawRentals } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories:category_id (name, slug, icon),
      regions:region_id (name),
      rental_photos (id, image_url, is_primary, display_order)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(30)

  // Map rentals to ensure proper types
  const featuredRentals = (rawRentals || []).map(rental => ({
    ...rental,
    rental_photos: Array.isArray(rental.rental_photos)
      ? rental.rental_photos.map(p => ({
          id: p.id,
          image_url: p.image_url,
          is_primary: p.is_primary ?? false,
          display_order: p.display_order ?? 0
        }))
      : []
  }))

  // Fetch ALL featured events (for both spotlight and events section)
  const now = new Date().toISOString()
  const { data: rawEvents } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug)
    `)
    .eq('is_featured', true)
    .gt('start_date', now)
    .order('interest_count', { ascending: false, nullsFirst: false })
    .order('start_date', { ascending: true })
    .limit(30)

  // Map events to ensure proper types
  const featuredEvents = (rawEvents || []).map(event => ({
    ...event,
    event_categories: event.event_categories ? {
      name: event.event_categories.name,
      icon: event.event_categories.icon || ''
    } : null,
    businesses: event.businesses ? {
      name: event.businesses.name,
      slug: event.businesses.slug
    } : null
  }))

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
      whatsapp_number: b.whatsapp_number || undefined,
      price: undefined,
      view_count: b.view_count || 0,
    })),
    ...featuredExperiences.map(exp => {
      const photos = exp.tourism_photos || []
      const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url
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
        whatsapp_number: exp.whatsapp_number || undefined,
        price: exp.price_from ? `From GYD ${exp.price_from.toLocaleString()}` : undefined,
        view_count: exp.view_count || 0,
      }
    }),
    ...featuredRentals.map(rental => {
      const photos = rental.rental_photos || []
      const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url
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
        whatsapp_number: rental.whatsapp_number || undefined,
        price: rental.price_per_month ? `GYD ${rental.price_per_month.toLocaleString()}/month` : undefined,
        view_count: rental.view_count || 0,
      }
    }),
    ...featuredEvents.map(event => {
      return {
        id: event.id,
        name: event.title,
        description: event.description || '',
        image_url: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
        rating: 0,
        review_count: event.interest_count || 0,
        location: event.location || '',
        type: 'event' as const,
        slug: event.slug,
        category: event.event_categories?.name,
        whatsapp_number: event.whatsapp_number || undefined,
        price: undefined,
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
    <div className="min-h-screen pb-20 lg:pb-0">
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
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 md:py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl md:rounded-3xl mt-0 mb-6 md:mb-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap px-2">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg md:shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
                <Plane className="h-6 w-6 md:h-8 md:w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Featured Experiences
              </h2>
              <Star className="h-6 w-6 md:h-8 md:w-8 text-emerald-500 fill-emerald-500" />
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">Discover the beauty of Guyana • Sponsored tours</p>
            <Link
              href="/tourism"
              className="inline-flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl md:rounded-2xl hover:from-emerald-700 hover:to-teal-700 shadow-xl md:shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all font-bold text-sm md:text-lg touch-manipulation"
            >
              Explore All Experiences
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Properties - EXPANDED */}
      {featuredRentals && featuredRentals.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap px-2">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg md:shadow-2xl shadow-blue-500/30 animate-pulse-glow">
                <HomeIcon className="h-6 w-6 md:h-8 md:w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Premium Properties
              </h2>
              <Star className="h-6 w-6 md:h-8 md:w-8 text-blue-500 fill-blue-500" />
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">Featured rentals • Find your perfect home</p>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl md:rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl md:shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all font-bold text-sm md:text-lg touch-manipulation"
            >
              Browse All Properties
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Events - EXPANDED */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 md:py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-2xl md:rounded-3xl my-6 md:my-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap px-2">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg md:shadow-2xl shadow-purple-500/30 animate-pulse-glow">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-gray-900">
                Upcoming Events
              </h2>
              <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-500 fill-purple-500" />
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">Don&apos;t miss out • Featured happenings</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl md:rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-xl md:shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all font-bold text-sm md:text-lg touch-manipulation"
            >
              View All Events
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
