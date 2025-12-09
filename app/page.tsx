import { createClient } from '@/lib/supabase/server'
import { HeroMinimal } from '@/components/HeroMinimal'
import { SpotlightSlider } from '@/components/SpotlightSlider'
import { CategoryPillars } from '@/components/CategoryPillars'
import { FooterMinimal } from '@/components/FooterMinimal'

export default async function Home() {
  const supabase = await createClient()

  // Fetch top featured items across all types (limited to best 8)
  const { data: featuredBusinesses } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, description, rating, review_count, whatsapp_number,
      categories:category_id (name),
      regions:region_id (name),
      business_photos (image_url, is_primary)
    `)
    .eq('is_featured', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(8)

  const { data: featuredExperiences } = await supabase
    .from('tourism_experiences')
    .select(`
      id, name, slug, description, rating, review_count, price_from, whatsapp_number,
      tourism_categories:tourism_category_id (name),
      regions:region_id (name),
      tourism_photos (image_url, is_primary)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(8)

  const { data: featuredRentals } = await supabase
    .from('rentals')
    .select(`
      id, name, slug, description, rating, review_count, price_per_month, whatsapp_number,
      rental_categories:category_id (name),
      regions:region_id (name),
      rental_photos (image_url, is_primary)
    `)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(8)

  const now = new Date().toISOString()
  const { data: featuredEvents } = await supabase
    .from('events')
    .select(`
      id, title, slug, description, image_url, interest_count, location, whatsapp_number,
      event_categories:category_id (name)
    `)
    .eq('is_featured', true)
    .gt('start_date', now)
    .order('interest_count', { ascending: false, nullsFirst: false })
    .limit(8)

  // Build spotlight items - mix of all types, sorted by quality
  const spotlightItems = [
    ...(featuredBusinesses || []).map(b => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      image_url: Array.isArray(b.business_photos)
        ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
        : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      rating: b.rating || 0,
      review_count: b.review_count || 0,
      location: b.regions?.name || '',
      type: 'business' as const,
      slug: b.slug,
      category: b.categories?.name,
    })),
    ...(featuredExperiences || []).map(exp => ({
      id: exp.id,
      name: exp.name,
      description: exp.description || '',
      image_url: Array.isArray(exp.tourism_photos)
        ? exp.tourism_photos.find(p => p.is_primary)?.image_url || exp.tourism_photos[0]?.image_url || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80'
        : 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      rating: exp.rating || 0,
      review_count: exp.review_count || 0,
      location: exp.regions?.name || '',
      type: 'tourism' as const,
      slug: exp.slug,
      category: exp.tourism_categories?.name,
      price: exp.price_from ? `From GYD ${exp.price_from.toLocaleString()}` : undefined,
    })),
    ...(featuredRentals || []).map(rental => ({
      id: rental.id,
      name: rental.name,
      description: rental.description || '',
      image_url: Array.isArray(rental.rental_photos)
        ? rental.rental_photos.find(p => p.is_primary)?.image_url || rental.rental_photos[0]?.image_url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      rating: rental.rating || 0,
      review_count: rental.review_count || 0,
      location: rental.regions?.name || '',
      type: 'rental' as const,
      slug: rental.slug,
      category: rental.rental_categories?.name,
      price: rental.price_per_month ? `GYD ${rental.price_per_month.toLocaleString()}/mo` : undefined,
    })),
    ...(featuredEvents || []).map(event => ({
      id: event.id,
      name: event.title,
      description: event.description || '',
      image_url: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      rating: 0,
      review_count: event.interest_count || 0,
      location: event.location || '',
      type: 'event' as const,
      slug: event.slug,
      category: event.event_categories?.name,
    })),
  ]
    .sort((a, b) => (b.rating * 10 + b.review_count) - (a.rating * 10 + a.review_count))
    .slice(0, 12)

  // Get counts for category pillars
  const { count: businessCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
  const { count: experienceCount } = await supabase
    .from('tourism_experiences')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
  const { count: rentalCount } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  // Build search suggestions from categories with actual listings
  const searchSuggestions: { label: string; href: string }[] = []

  // Get top business category with listings
  const { data: topBusinessCategory } = await supabase
    .from('categories')
    .select('name, slug, businesses:businesses(count)')
    .limit(5)

  const businessCatWithListings = topBusinessCategory?.find(
    (cat) => cat.businesses && (cat.businesses as unknown as { count: number }[])[0]?.count > 0
  )
  if (businessCatWithListings) {
    searchSuggestions.push({
      label: businessCatWithListings.name,
      href: `/businesses/category/${businessCatWithListings.slug}`,
    })
  }

  // Get top tourism category with listings
  const { data: topTourismCategory } = await supabase
    .from('tourism_categories')
    .select('name, slug, tourism_experiences:tourism_experiences(count)')
    .limit(5)

  const tourismCatWithListings = topTourismCategory?.find(
    (cat) => cat.tourism_experiences && (cat.tourism_experiences as unknown as { count: number }[])[0]?.count > 0
  )
  if (tourismCatWithListings) {
    searchSuggestions.push({
      label: tourismCatWithListings.name,
      href: `/tourism/category/${tourismCatWithListings.slug}`,
    })
  }

  // Get top rental category with listings
  const { data: topRentalCategory } = await supabase
    .from('rental_categories')
    .select('name, slug, rentals:rentals(count)')
    .limit(5)

  const rentalCatWithListings = topRentalCategory?.find(
    (cat) => cat.rentals && (cat.rentals as unknown as { count: number }[])[0]?.count > 0
  )
  if (rentalCatWithListings) {
    searchSuggestions.push({
      label: rentalCatWithListings.name,
      href: `/rentals/category/${rentalCatWithListings.slug}`,
    })
  }

  // Add Events if there are any upcoming
  if (eventCount && eventCount > 0) {
    searchSuggestions.push({
      label: 'Events',
      href: '/events',
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero - full viewport, single focus */}
      <HeroMinimal suggestions={searchSuggestions} />

      {/* Featured spotlight - horizontal slider */}
      <SpotlightSlider items={spotlightItems} />

      {/* Category pillars - clear navigation */}
      <CategoryPillars
        counts={{
          businesses: businessCount || 0,
          experiences: experienceCount || 0,
          rentals: rentalCount || 0,
          events: eventCount || 0,
        }}
      />

      {/* Minimal footer */}
      <FooterMinimal />
    </div>
  )
}
