import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import { RentalDetailClient } from './RentalDetailClient'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { RentalViewTracker } from '@/components/RentalViewTracker'
import { getFallbackImage } from '@/lib/category-images'

// Revalidate every 2 minutes
export const revalidate = 120

// Pre-render top 50 most-viewed rentals at build time
export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: rentals } = await supabase
    .from('rentals')
    .select('slug')
    .eq('is_approved', true)
    .order('view_count', { ascending: false })
    .limit(50)

  return (rentals || []).map((rental) => ({
    slug: rental.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  const { data: rental } = await supabase
    .from('rentals')
    .select('name, description, rental_categories(name), regions(name), rental_photos(image_url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!rental) {
    return {
      title: 'Property Not Found | Waypoint',
    }
  }

  const photo = Array.isArray(rental.rental_photos)
    ? rental.rental_photos.find((p: { is_primary: boolean | null }) => p.is_primary)?.image_url || rental.rental_photos[0]?.image_url
    : null
  const categoryName = (rental.rental_categories as { name: string } | null)?.name || ''
  const regionName = (rental.regions as { name: string } | null)?.name || ''
  const description = rental.description
    ? rental.description.slice(0, 155)
    : `${rental.name} - ${categoryName} in ${regionName}, Guyana.`

  return {
    title: `${rental.name} - Stays`,
    description,
    alternates: { canonical: `/rentals/${slug}` },
    openGraph: {
      title: `${rental.name} | Waypoint`,
      description,
      ...(photo ? { images: [{ url: photo, width: 1200, height: 630, alt: rental.name }] } : {}),
    },
  }
}

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // Get rental details
  const { data: rental, error } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug, icon),
      regions(name, slug),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (error || !rental) {
    notFound()
  }

  // Get reviews with ratings breakdown
  const { data: reviews } = await supabase
    .from('rental_reviews')
    .select(`*`)
    .eq('rental_id', rental.id)
    .order('created_at', { ascending: false })

  // Get similar properties (same property type, different property)
  const { data: similarRentalsRaw } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug),
      regions(name),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('property_type', rental.property_type)
    .eq('is_approved', true)
    .neq('id', rental.id)
    .neq('slug', rental.slug)
    .limit(4)

  // Deduplicate by slug in case of data issues
  const seenSlugs = new Set<string>()
  const similarRentals = (similarRentalsRaw || []).filter((r) => {
    if (seenSlugs.has(r.slug)) return false
    seenSlugs.add(r.slug)
    return true
  })

  // Sort photos (primary first, then by display_order)
  interface RentalPhoto {
    image_url: string
    is_primary: boolean | null
    display_order: number | null
  }

  const photos = rental.rental_photos?.sort((a: RentalPhoto, b: RentalPhoto) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  }) || []

  // Default image if no photos
  const defaultImage = getFallbackImage(rental.rental_categories?.name, 'rental')

  // Get primary image for recently viewed
  const primaryImage = photos[0]?.image_url || defaultImage

  // JSON-LD structured data for LodgingBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: rental.name,
    description: rental.description || undefined,
    url: `https://waypointgy.com/rentals/${rental.slug}`,
    image: primaryImage,
    ...(rental.regions ? {
      address: {
        '@type': 'PostalAddress',
        addressRegion: (rental.regions as { name: string }).name,
        addressCountry: 'GY',
        ...(rental.location_details ? { streetAddress: rental.location_details } : {}),
      },
    } : {}),
    ...(rental.price_per_month ? {
      priceRange: `GYD ${rental.price_per_month.toLocaleString()}/month`,
    } : {}),
    ...(rental.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rental.rating,
        reviewCount: reviews?.length || 0,
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

      {/* Track view count */}
      <RentalViewTracker rentalId={rental.id} />

      {/* Track recently viewed */}
      <RecentlyViewedTracker
        type="rental"
        id={rental.id}
        slug={rental.slug}
        name={rental.name}
        image={primaryImage}
        category={rental.rental_categories?.name}
        location={rental.regions?.name}
      />

      <RentalDetailClient
        rental={rental}
        photos={photos}
        defaultImage={defaultImage}
        reviews={reviews || []}
        similarRentals={similarRentals}
      />
    </>
  )
}
