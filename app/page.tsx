import { createClient } from '@/lib/supabase/server'
import { HomeFeedClient } from '@/components/home'
import type { FeedItem } from '@/components/home'

export default async function Home() {
  const supabase = await createClient()

  // Fetch all items from each table in parallel (more items for the feed)
  const [
    { data: businesses },
    { data: experiences },
    { data: rentals },
    { data: events },
  ] = await Promise.all([
    // Businesses - fetch for the feed
    supabase
      .from('businesses')
      .select(`
        id, name, slug, description, rating, review_count,
        is_featured, is_verified,
        categories:category_id (name),
        regions:region_id (name),
        business_photos (image_url, is_primary)
      `)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),

    // Tourism experiences
    supabase
      .from('tourism_experiences')
      .select(`
        id, name, slug, description, rating, review_count, price_from,
        is_featured, is_verified,
        tourism_categories:tourism_category_id (name),
        regions:region_id (name),
        tourism_photos (image_url, is_primary)
      `)
      .eq('is_approved', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),

    // Rentals
    supabase
      .from('rentals')
      .select(`
        id, name, slug, description, rating, review_count, price_per_month,
        is_featured,
        rental_categories:category_id (name),
        regions:region_id (name),
        rental_photos (image_url, is_primary)
      `)
      .eq('is_approved', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),

    // Events - upcoming only
    supabase
      .from('events')
      .select(`
        id, title, slug, description, image_url, interest_count, location,
        is_featured,
        event_categories:category_id (name)
      `)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(50),
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
    ...(businesses || []).map((b): FeedItem => ({
      id: b.id,
      type: 'business',
      name: b.name,
      slug: b.slug,
      description: b.description,
      image_url: getPrimaryImage(
        b.business_photos as { image_url: string; is_primary: boolean }[] | null,
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
      ),
      rating: b.rating,
      review_count: b.review_count || 0,
      category_name: (b.categories as { name: string } | null)?.name || null,
      is_featured: b.is_featured || false,
      is_verified: b.is_verified || false,
      location: (b.regions as { name: string } | null)?.name || null,
    })),

    // Tourism experiences
    ...(experiences || []).map((exp): FeedItem => ({
      id: exp.id,
      type: 'tourism',
      name: exp.name,
      slug: exp.slug,
      description: exp.description,
      image_url: getPrimaryImage(
        exp.tourism_photos as { image_url: string; is_primary: boolean }[] | null,
        'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80'
      ),
      rating: exp.rating,
      review_count: exp.review_count || 0,
      category_name: (exp.tourism_categories as { name: string } | null)?.name || null,
      is_featured: exp.is_featured || false,
      is_verified: exp.is_verified || false,
      location: (exp.regions as { name: string } | null)?.name || null,
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
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'
      ),
      rating: r.rating,
      review_count: r.review_count || 0,
      category_name: (r.rental_categories as { name: string } | null)?.name || null,
      is_featured: r.is_featured || false,
      is_verified: false,
      location: (r.regions as { name: string } | null)?.name || null,
      price_display: r.price_per_month ? `GYD ${r.price_per_month.toLocaleString()}/mo` : null,
    })),

    // Events
    ...(events || []).map((e): FeedItem => ({
      id: e.id,
      type: 'event',
      name: e.title,
      slug: e.slug,
      description: e.description,
      image_url: e.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
      rating: null,
      review_count: e.interest_count || 0,
      category_name: (e.event_categories as { name: string } | null)?.name || null,
      is_featured: e.is_featured || false,
      is_verified: false,
      location: e.location || null,
    })),
  ]

  return <HomeFeedClient items={feedItems} />
}
