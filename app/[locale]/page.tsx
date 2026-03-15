import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createStaticClient } from '@/lib/supabase/static'
import { HomeFeedClient } from '@/components/home'
import type { FeedItem } from '@/components/home'
import { getCategoryImage, getFallbackImage } from '@/lib/category-images'
import { resolveRegionFilter, getRegionDisplayName } from '@/lib/regions'
import { RegionRedirect } from '@/components/RegionRedirect'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Waypoint - Discover Guyana | Businesses, Experiences, Events & Stays',
  description: 'Find the best restaurants, shops, guided tours, events, and accommodation across Guyana. Trusted reviews, verified listings, and local knowledge in the Land of Many Waters.',
  alternates: { canonical: '/' },
}

export default async function Home({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const supabase = createStaticClient()
  const regionSlug = (await searchParams).region || 'all'
  const regionIds = await resolveRegionFilter(supabase, regionSlug)

  // Fetch all items from each table in parallel (more items for the feed)
  const [
    { data: businesses },
    { data: experiences },
    { data: rentals },
    { data: events },
  ] = await Promise.all([
    // Businesses - fetch for the feed
    (() => {
      let q = supabase
        .from('businesses')
        .select(`
          id, name, slug, description, rating, review_count,
          is_featured, is_verified,
          categories:category_id (name, slug),
          regions:region_id (name, slug),
          business_photos (image_url, is_primary)
        `)
        .eq('is_active', true)
      if (regionIds) q = q.in('region_id', regionIds)
      return q.order('rating', { ascending: false, nullsFirst: false }).limit(24)
    })(),

    // Tourism experiences
    (() => {
      let q = supabase
        .from('tourism_experiences')
        .select(`
          id, name, slug, description, rating, review_count, price_from,
          is_featured, is_verified,
          tourism_categories:tourism_category_id (name),
          regions:region_id (name, slug),
          tourism_photos (image_url, is_primary)
        `)
        .eq('is_approved', true)
      if (regionIds) q = q.in('region_id', regionIds)
      return q.order('rating', { ascending: false, nullsFirst: false }).limit(24)
    })(),

    // Rentals
    (() => {
      let q = supabase
        .from('rentals')
        .select(`
          id, name, slug, description, rating, review_count, price_per_month,
          is_featured,
          rental_categories:category_id (name, slug),
          regions:region_id (name, slug),
          rental_photos (image_url, is_primary)
        `)
        .eq('is_approved', true)
      if (regionIds) q = q.in('region_id', regionIds)
      return q.order('rating', { ascending: false, nullsFirst: false }).limit(24)
    })(),

    // Events - upcoming only
    (() => {
      let q = supabase
        .from('events')
        .select(`
          id, title, slug, description, image_url, interest_count, location,
          is_featured,
          event_categories:category_id (name, slug)
        `)
        .gte('end_date', new Date().toISOString())
      if (regionIds) q = q.in('region_id', regionIds)
      return q.order('start_date', { ascending: true }).limit(12)
    })(),
  ])

  // Helper to get primary image from photo array
  const getPrimaryImage = (
    photos: { image_url: string; is_primary: boolean }[] | null,
    fallback: string
  ): string => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return fallback
    const primary = photos.find((p) => p.is_primary)
    return primary?.image_url || photos[0]?.image_url || fallback
  }

  // Transform to FeedItem format
  const feedItems: FeedItem[] = [
    // Businesses
    ...(businesses || []).map((b): FeedItem => {
      const catSlug = (b.categories as { name: string; slug: string } | null)?.slug
      const fallback = getCategoryImage(catSlug || '')
      return {
        id: b.id,
        type: 'business',
        name: b.name,
        slug: b.slug,
        description: b.description,
        image_url: getPrimaryImage(
          b.business_photos as { image_url: string; is_primary: boolean }[] | null,
          fallback
        ),
        rating: b.rating,
        review_count: b.review_count || 0,
        category_name: (b.categories as { name: string } | null)?.name || null,
        is_featured: b.is_featured || false,
        is_verified: b.is_verified || false,
        location: (() => {
          const reg = b.regions as { name: string; slug?: string } | null
          return reg ? getRegionDisplayName(reg.slug || null, reg.name) : null
        })(),
      }
    }),

    // Tourism experiences
    ...(experiences || []).map((exp): FeedItem => ({
      id: exp.id,
      type: 'tourism',
      name: exp.name,
      slug: exp.slug,
      description: exp.description,
      image_url: getPrimaryImage(
        exp.tourism_photos as { image_url: string; is_primary: boolean }[] | null,
        getFallbackImage((exp.tourism_categories as { name: string } | null)?.name || null, 'tourism')
      ),
      rating: exp.rating,
      review_count: exp.review_count || 0,
      category_name: (exp.tourism_categories as { name: string } | null)?.name || null,
      is_featured: exp.is_featured || false,
      is_verified: exp.is_verified || false,
      location: (() => {
        const reg = exp.regions as { name: string; slug?: string } | null
        return reg ? getRegionDisplayName(reg.slug || null, reg.name) : null
      })(),
      price_display: exp.price_from ? `From GYD ${exp.price_from.toLocaleString()}` : null,
    })),

    // Rentals
    ...(rentals || []).map((r): FeedItem => ({
      id: r.id,
      type: 'rental',
      name: r.name,
      slug: r.slug,
      description: r.description,
      image_url: getPrimaryImage(
        r.rental_photos as { image_url: string; is_primary: boolean }[] | null,
        getFallbackImage((r.rental_categories as { name: string } | null)?.name || null, 'rental')
      ),
      rating: r.rating,
      review_count: r.review_count || 0,
      category_name: (r.rental_categories as { name: string } | null)?.name || null,
      is_featured: r.is_featured || false,
      is_verified: false,
      location: (() => {
        const reg = r.regions as { name: string; slug?: string } | null
        return reg ? getRegionDisplayName(reg.slug || null, reg.name) : null
      })(),
      price_display: r.price_per_month ? `GYD ${r.price_per_month.toLocaleString()}/mo` : null,
    })),

    // Events
    ...(events || []).map((e): FeedItem => ({
      id: e.id,
      type: 'event',
      name: e.title,
      slug: e.slug,
      description: e.description,
      image_url: e.image_url || getFallbackImage((e.event_categories as { name: string } | null)?.name || null, 'event'),
      rating: null,
      review_count: e.interest_count || 0,
      category_name: (e.event_categories as { name: string } | null)?.name || null,
      is_featured: e.is_featured || false,
      is_verified: false,
      location: e.location || null,
    })),
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://waypointgy.com/#website',
        name: 'Waypoint',
        url: 'https://waypointgy.com',
        description: 'Discover local businesses, tourism experiences, events, and rentals across Guyana.',
        publisher: { '@id': 'https://waypointgy.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://waypointgy.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://waypointgy.com/#organization',
        name: 'Waypoint',
        url: 'https://waypointgy.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://waypointgy.com/icons/icon-512x512.png',
          width: 512,
          height: 512,
        },
        description: 'Discover local businesses, tourism experiences, events, and rentals across Guyana.',
        areaServed: {
          '@type': 'Country',
          name: 'Guyana',
          sameAs: 'https://en.wikipedia.org/wiki/Guyana',
        },
      },
      {
        '@type': 'WebPage',
        '@id': 'https://waypointgy.com/#webpage',
        url: 'https://waypointgy.com',
        name: 'Waypoint - Discover Local Businesses in Guyana',
        isPartOf: { '@id': 'https://waypointgy.com/#website' },
        about: { '@id': 'https://waypointgy.com/#organization' },
        description: 'Find restaurants, shops, tourism experiences, events, and rentals across Guyana.',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Suspense fallback={null}><RegionRedirect /></Suspense>
      <HomeFeedClient items={feedItems} />
    </>
  )
}
