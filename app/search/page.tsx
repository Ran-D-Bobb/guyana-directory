import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UnifiedSearchResults } from '@/components/UnifiedSearchResults'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for businesses, tourism experiences, events, and rentals across Guyana.',
  alternates: { canonical: '/search' },
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: 'all' | 'businesses' | 'experiences' | 'rentals' | 'events'
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', type = 'all' } = await searchParams
  const supabase = await createClient()

  const searchTerm = q.trim()

  // Search across all content types in parallel
  const [
    { data: businesses },
    { data: experiences },
    { data: rentals },
    { data: events },
  ] = await Promise.all([
    // Businesses
    searchTerm
      ? supabase
          .from('businesses')
          .select(`
            id, name, slug, description, rating, review_count,
            categories:category_id (name),
            regions:region_id (name),
            business_photos (image_url, is_primary)
          `)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(20)
      : Promise.resolve({ data: null }),

    // Tourism experiences
    searchTerm
      ? supabase
          .from('tourism_experiences')
          .select(`
            id, name, slug, description, rating, review_count, price_from,
            tourism_categories:tourism_category_id (name),
            regions:region_id (name),
            tourism_photos (image_url, is_primary)
          `)
          .eq('is_approved', true)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(20)
      : Promise.resolve({ data: null }),

    // Rentals
    searchTerm
      ? supabase
          .from('rentals')
          .select(`
            id, name, slug, description, rating, review_count, price_per_month,
            rental_categories:category_id (name),
            regions:region_id (name),
            rental_photos (image_url, is_primary)
          `)
          .eq('is_approved', true)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(20)
      : Promise.resolve({ data: null }),

    // Events
    searchTerm
      ? supabase
          .from('events')
          .select(`
            id, title, slug, description, image_url, location, start_date, interest_count,
            event_categories:category_id (name)
          `)
          .gt('start_date', new Date().toISOString())
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('is_featured', { ascending: false })
          .order('start_date', { ascending: true })
          .limit(20)
      : Promise.resolve({ data: null }),
  ])

  // Transform results into unified format
  const results = {
    businesses: (businesses || []).map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description || '',
      image: Array.isArray(b.business_photos)
        ? b.business_photos.find((p) => p.is_primary)?.image_url || b.business_photos[0]?.image_url
        : null,
      category: b.categories?.name || '',
      location: b.regions?.name || '',
      rating: b.rating || 0,
      reviewCount: b.review_count || 0,
      type: 'business' as const,
      href: `/businesses/${b.slug}`,
    })),
    experiences: (experiences || []).map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description || '',
      image: Array.isArray(e.tourism_photos)
        ? e.tourism_photos.find((p) => p.is_primary)?.image_url || e.tourism_photos[0]?.image_url
        : null,
      category: e.tourism_categories?.name || '',
      location: e.regions?.name || '',
      rating: e.rating || 0,
      reviewCount: e.review_count || 0,
      price: e.price_from ? `From GYD ${e.price_from.toLocaleString()}` : undefined,
      type: 'experience' as const,
      href: `/tourism/${e.slug}`,
    })),
    rentals: (rentals || []).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      image: Array.isArray(r.rental_photos)
        ? r.rental_photos.find((p) => p.is_primary)?.image_url || r.rental_photos[0]?.image_url
        : null,
      category: r.rental_categories?.name || '',
      location: r.regions?.name || '',
      rating: r.rating || 0,
      reviewCount: r.review_count || 0,
      price: r.price_per_month ? `GYD ${r.price_per_month.toLocaleString()}/mo` : undefined,
      type: 'rental' as const,
      href: `/rentals/${r.slug}`,
    })),
    events: (events || []).map((e) => ({
      id: e.id,
      name: e.title,
      slug: e.slug,
      description: e.description || '',
      image: e.image_url,
      category: e.event_categories?.name || '',
      location: e.location || '',
      rating: 0,
      reviewCount: e.interest_count || 0,
      date: e.start_date,
      type: 'event' as const,
      href: `/events/${e.slug}`,
    })),
  }

  const totalResults =
    results.businesses.length +
    results.experiences.length +
    results.rentals.length +
    results.events.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {searchTerm ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Results for &ldquo;{searchTerm}&rdquo;
              </h1>
              <p className="text-gray-500 mt-2">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </p>
            </>
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search</h1>
          )}
        </div>
      </header>

      {/* Search input */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <form action="/search" method="GET">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={searchTerm}
                placeholder="Search businesses, experiences, stays, events..."
                className="w-full px-5 py-4 pr-12 text-lg bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {!searchTerm ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              Start typing to search across all listings
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-medium mb-2">No results found</p>
            <p className="text-gray-500">
              Try different keywords or browse categories
            </p>
          </div>
        ) : (
          <UnifiedSearchResults results={results} activeType={type} />
        )}
      </main>
    </div>
  )
}
