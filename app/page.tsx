import { createClient } from '@/lib/supabase/server'
import CategoryCarousel from '@/components/CategoryCarousel'
import { FeaturedBusinessCarousel } from '@/components/FeaturedBusinessCarousel'
import { EventCard } from '@/components/EventCard'
import { ExperienceCard } from '@/components/tourism/ExperienceCard'
import { HomeSearchBar } from '@/components/HomeSearchBar'
import Link from 'next/link'
import { Calendar, Sparkles, TrendingUp, ArrowRight, Plane } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Fetch all categories with business counts
  const { data: categories } = await supabase
    .from('categories')
    .select('*, businesses:businesses(count)')
    .order('name')

  // Transform categories to include business count
  const categoriesWithCount = categories?.map((cat) => ({
    ...cat,
    business_count: Array.isArray(cat.businesses) ? cat.businesses.length : 0,
  })) || []

  // Fetch featured businesses with their category, region, and photos
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
    .limit(6)

  // Process businesses to extract primary photo
  const allFeaturedBusinesses = (featuredBusinesses || []).map(b => ({
    ...b,
    primary_photo: Array.isArray(b.business_photos)
      ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || null
      : null
  }))

  // Fetch featured tourism experiences
  const { data: featuredExperiences } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories:tourism_category_id (name, icon),
      regions:region_id (name),
      tourism_photos:tourism_photos (image_url, is_primary, display_order)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true) // Only show approved experiences
    .order('rating', { ascending: false })
    .limit(3)

  // Fetch featured upcoming events
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
    .order('start_date', { ascending: true })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section with Mesh Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Guyana&apos;s Premier Business Directory</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in tracking-tight">
              Discover Local
              <span className="block bg-gradient-to-r from-yellow-200 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                Businesses in Guyana
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-emerald-50 max-w-2xl mx-auto animate-fade-in font-light">
              Connect with businesses instantly via WhatsApp. Browse, discover, and support local.
            </p>

            {/* Enhanced Search Bar */}
            <div className="animate-scale-in">
              <HomeSearchBar />
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48h1440V0s-174.5 48-720 48S0 0 0 0v48z" fill="rgb(249, 250, 251)" />
          </svg>
        </div>
      </section>

      {/* Featured Businesses Section - Compact Carousel */}
      {allFeaturedBusinesses && allFeaturedBusinesses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Featured Businesses
                </h2>
                <p className="text-sm text-gray-600">Connect instantly via WhatsApp</p>
              </div>
            </div>
            <Link
              href="/businesses"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <FeaturedBusinessCarousel businesses={allFeaturedBusinesses} />
        </section>
      )}

      {/* Categories Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Explore Categories
            </h2>
            <p className="text-gray-600">Swipe to discover businesses by category</p>
          </div>
        </div>
        <CategoryCarousel categories={categoriesWithCount} />
      </section>

      {/* Featured Tourism Experiences Section */}
      {featuredExperiences && featuredExperiences.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-3xl">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Plane className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Tourism Experiences
                </h2>
                <p className="text-gray-600">Discover the beauty of Guyana</p>
              </div>
            </div>
            <Link
              href="/tourism"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all font-medium group"
            >
              Explore all experiences
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Events Section */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Upcoming Events
                </h2>
                <p className="text-gray-600">Don&apos;t miss out on local happenings</p>
              </div>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all font-medium group"
            >
              View all events
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-xl font-bold">W</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Waypoint
              </span>
            </div>
            <p className="text-gray-400 mb-2">
              Guyana&apos;s Premier Business Directory
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Waypoint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
