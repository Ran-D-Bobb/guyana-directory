import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DiscoverPageClient } from '@/components/discover/DiscoverPageClient';
import { Compass, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Discover Around You | Waypoint',
  description:
    'Find hidden gems, local favorites, and unique experiences near you in Guyana.',
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function DiscoverPage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [
    { data: businesses },
    { data: tourism },
    { data: rentals },
    { data: events },
  ] = await Promise.all([
    // Businesses with photos and category info
    supabase
      .from('businesses')
      .select(
        `
        id, name, slug, description, rating, review_count,
        is_featured, is_verified, latitude, longitude,
        phone, email, address,
        categories:category_id (name),
        business_photos (image_url, is_primary)
      `
      )
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),

    // Tourism experiences
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
      .limit(100),

    // Rentals
    supabase
      .from('rentals')
      .select(
        `
        id, name, slug, description, rating, review_count,
        is_featured, latitude, longitude,
        whatsapp_number, email, address, price_per_month,
        rental_categories:category_id (name),
        rental_photos (image_url, is_primary)
      `
      )
      .eq('is_approved', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),

    // Events (upcoming only)
    supabase
      .from('events')
      .select(
        `
        id, title, slug, description,
        is_featured, location, image_url, latitude, longitude,
        event_categories:category_id (name)
      `
      )
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(50),
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

  const totalCount =
    processedBusinesses.length +
    processedTourism.length +
    processedRentals.length +
    processedEvents.length;

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))] pb-20 lg:pb-0">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh-dark" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--jungle-900))]/95 via-[hsl(var(--jungle-800))]/90 to-[hsl(var(--jungle-700))]/85" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--gold-500))]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--jungle-400))]/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay opacity-30" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--gold-500))]/20 border border-[hsl(var(--gold-500))]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--gold-400))]" />
              <span className="text-sm font-medium text-[hsl(var(--gold-300))]">
                {totalCount} Experiences to Discover
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-[1.1]">
              Discover
              <span className="block text-gradient-gold animate-text-shimmer bg-[length:200%_auto]">
                Around You
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-[hsl(var(--jungle-200))] max-w-xl leading-relaxed">
              Hidden gems, local favorites, and unique experiences — all waiting
              to be found near you.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gold-500))]/20 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[hsl(var(--gold-400))]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {totalCount}
                  </div>
                  <div className="text-sm text-[hsl(var(--gold-300))]">
                    Experiences
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(var(--jungle-50))] to-transparent" />
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
