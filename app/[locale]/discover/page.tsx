import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createStaticClient } from '@/lib/supabase/static';
import { DiscoverPageClient } from '@/components/discover/DiscoverPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('discover')
  return {
    title: t('pageTitle'),
    description:
      'Find restaurants, shops, tours, events, and stays near your location in Guyana.',
  }
}

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function DiscoverPage() {
  const supabase = createStaticClient();

  // Fetch all data in parallel
  const [
    { data: businesses },
    { data: tourism },
    { data: rentals },
    { data: events },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select(
        `
        id, name, slug, description, rating, review_count,
        is_featured, is_verified, latitude, longitude,
        phone, email, address,
        categories:category_id (name, slug),
        business_photos (image_url, is_primary)
      `
      )
      .eq('is_active', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(50),

    supabase
      .from('tourism_experiences')
      .select(
        `
        id, name, slug, description, rating, review_count,
        is_featured, is_verified, latitude, longitude,
        whatsapp_number, email, price_from,
        tourism_categories:tourism_category_id (name),
        tourism_photos (image_url, is_primary)
      `
      )
      .eq('is_approved', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(50),

    supabase
      .from('rentals')
      .select(
        `
        id, name, slug, description, rating, review_count,
        is_featured, latitude, longitude,
        whatsapp_number, email, address, price_per_month,
        rental_categories:category_id (name, slug),
        rental_photos (image_url, is_primary)
      `
      )
      .eq('is_approved', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(50),

    supabase
      .from('events')
      .select(
        `
        id, title, slug, description,
        is_featured, location, image_url, latitude, longitude,
        event_categories:category_id (name, slug)
      `
      )
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(30),
  ]);

  // Process businesses
  const processedBusinesses = (businesses || []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description,
    rating: b.rating,
    review_count: b.review_count || 0,
    is_featured: b.is_featured || false,
    is_verified: b.is_verified || false,
    latitude: b.latitude,
    longitude: b.longitude,
    image_url:
      (b.business_photos as { image_url: string; is_primary: boolean }[])?.find(
        (p) => p.is_primary
      )?.image_url ||
      (b.business_photos as { image_url: string }[])?.[0]?.image_url ||
      null,
    category_name: (b.categories as { name: string } | null)?.name || null,
    phone: b.phone,
    email: b.email,
    address: b.address,
  }));

  // Process tourism
  const processedTourism = (tourism || []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    rating: t.rating,
    review_count: t.review_count || 0,
    is_featured: t.is_featured || false,
    is_verified: t.is_verified || false,
    latitude: t.latitude,
    longitude: t.longitude,
    image_url:
      (t.tourism_photos as { image_url: string; is_primary: boolean }[])?.find(
        (p) => p.is_primary
      )?.image_url ||
      (t.tourism_photos as { image_url: string }[])?.[0]?.image_url ||
      null,
    category_name:
      (t.tourism_categories as { name: string } | null)?.name || null,
    whatsapp_number: t.whatsapp_number,
    email: t.email,
    price_from: t.price_from,
  }));

  // Process rentals
  const processedRentals = (rentals || []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    rating: r.rating,
    review_count: r.review_count || 0,
    is_featured: r.is_featured || false,
    is_verified: false,
    latitude: r.latitude,
    longitude: r.longitude,
    image_url:
      (r.rental_photos as { image_url: string; is_primary: boolean }[])?.find(
        (p) => p.is_primary
      )?.image_url ||
      (r.rental_photos as { image_url: string }[])?.[0]?.image_url ||
      null,
    category_name:
      (r.rental_categories as { name: string } | null)?.name || null,
    whatsapp_number: r.whatsapp_number,
    email: r.email,
    address: r.address,
    price_from: r.price_per_month,
  }));

  // Process events
  const processedEvents = (events || []).map((e) => ({
    id: e.id,
    name: e.title,
    slug: e.slug,
    description: e.description,
    rating: null,
    review_count: 0,
    is_featured: e.is_featured || false,
    is_verified: false,
    latitude: e.latitude,
    longitude: e.longitude,
    image_url: e.image_url,
    category_name:
      (e.event_categories as { name: string } | null)?.name || null,
    address: e.location,
  }));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-20 lg:pb-0">
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <DiscoverPageClient
          businesses={processedBusinesses}
          tourism={processedTourism}
          rentals={processedRentals}
          events={processedEvents}
        />
      </main>
    </div>
  );
}
