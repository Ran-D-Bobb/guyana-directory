import { createClient } from '@/lib/supabase/server'
import { BusinessCard } from '@/components/BusinessCard'
import { SearchFilters } from '@/components/SearchFilters'
import Link from 'next/link'
import { ChevronLeft, Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    region?: string
    category?: string
    sort?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', region, category, sort = 'featured' } = await searchParams
  const supabase = await createClient()

  // Fetch all regions for the filter dropdown
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Fetch all categories for the filter dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  let businessesWithPhotos = null

  // Only search if there's a query term
  if (q && q.trim() !== '') {
    // Build the query for businesses using full-text search
    let query = supabase
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

    // PostgreSQL full-text search
    // Search in business name and description
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%`
    )

    // Apply region filter if selected
    if (region && region !== 'all') {
      query = query.eq('region_id', region)
    }

    // Apply category filter if selected
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // Apply sorting
    switch (sort) {
      case 'featured':
        query = query.order('is_featured', { ascending: false })
        query = query.order('rating', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: businesses } = await query

    // Process businesses to extract primary photo
    businessesWithPhotos = (businesses || []).map(b => ({
      ...b,
      primary_photo: Array.isArray(b.business_photos)
        ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || null
        : null
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Search Businesses</h1>
          {q && (
            <p className="text-gray-600 mt-2">
              Results for &quot;{q}&quot;
            </p>
          )}
        </div>
      </header>

      {/* Search Bar and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchFilters
            regions={regions || []}
            categories={categories || []}
            initialQuery={q}
          />
        </div>
      </div>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!q || q.trim() === '' ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Enter a search term to find businesses
            </p>
          </div>
        ) : businessesWithPhotos && businessesWithPhotos.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">
              {businessesWithPhotos.length} {businessesWithPhotos.length === 1 ? 'business' : 'businesses'} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessesWithPhotos.map((business) => (
                <BusinessCard key={business.id} business={business} primaryPhoto={business.primary_photo} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              No businesses found for &quot;{q}&quot;
            </p>
            <p className="text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
