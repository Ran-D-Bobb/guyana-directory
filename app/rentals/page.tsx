import { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { RentalCard } from '@/components/RentalCard'
import { RentalCategorySidebar } from '@/components/RentalCategorySidebar'
import { MobileRentalCategoryFilterBar } from '@/components/MobileRentalCategoryFilterBar'
import { RentalFilterPanel } from '@/components/RentalFilterPanel'
import { FeaturedRentalsHero } from '@/components/rentals/FeaturedRentalsHero'
import { getRentalCategoriesWithCounts } from '@/lib/category-counts'
import { Home, Search, SlidersHorizontal, AlertTriangle, RefreshCw } from 'lucide-react'
import { Pagination } from '@/components/Pagination'
import { getSelectedRegionSlug, resolveRegionFilter } from '@/lib/regions'

// Revalidate every 5 minutes
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Browse Stays',
  description: 'Find apartments, houses, vacation homes, and more in Guyana',
}

const ITEMS_PER_PAGE = 24

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    beds?: string
    baths?: string
    price_min?: string
    price_max?: string
    region?: string
    sort?: string
    amenities?: string
    page?: string
  }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1') || 1)

  // Resolve region: use URL param if present, otherwise fall back to cookie
  const cookieStore = await cookies()
  const effectiveRegion = params.region || getSelectedRegionSlug(cookieStore)
  const regionFilterIds = await resolveRegionFilter(supabase, effectiveRegion)

  // Check if any filters are applied
  const hasFilters = params.q || params.category || params.beds || params.baths ||
    params.price_min || params.price_max || params.region || params.amenities ||
    (params.sort && params.sort !== 'newest')

  // Build query for featured rentals (for hero - only when no filters)
  let featuredRentals: Array<{
    id: string
    name: string
    slug: string
    description?: string | null
    price_per_month?: number | null
    price_per_night?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    rating?: number | null
    review_count?: number | null
    rental_categories?: { name: string; slug?: string } | null
    regions?: { name: string } | null
    rental_photos?: Array<{ image_url: string; is_primary?: boolean | null; display_order?: number | null }>
  }> = []
  if (!hasFilters) {
    let featuredQuery = supabase
      .from('rentals')
      .select(`
        id, name, slug, description, price_per_month, price_per_night,
        bedrooms, bathrooms, rating, review_count,
        rental_categories(name, slug),
        regions(name),
        rental_photos(image_url, is_primary, display_order)
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
    if (regionFilterIds) featuredQuery = featuredQuery.in('region_id', regionFilterIds)
    const { data: featured } = await featuredQuery
      .order('created_at', { ascending: false })
      .limit(5)

    featuredRentals = featured || []
  }

  // Build main query
  let query = supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug, icon),
      regions(name),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('is_approved', true)

  // Apply search filter
  const safeSearchTerm = params.q ? params.q.replace(/[%_(),.*]/g, ' ').trim() : ''
  if (safeSearchTerm) {
    query = query.or(`name.ilike.%${safeSearchTerm}%,description.ilike.%${safeSearchTerm}%,location_details.ilike.%${safeSearchTerm}%`)
  }

  // Resolve category slug to ID once (reused for count query)
  let resolvedCategoryId: string | null = null
  if (params.category) {
    const { data: category } = await supabase
      .from('rental_categories')
      .select('id')
      .eq('slug', params.category)
      .single()

    resolvedCategoryId = category?.id || null
    if (resolvedCategoryId) {
      query = query.eq('category_id', resolvedCategoryId)
    }
  }

  // Apply bedrooms filter
  if (params.beds) {
    const beds = params.beds === '4+' ? 4 : parseInt(params.beds)
    if (params.beds === '4+') {
      query = query.gte('bedrooms', beds)
    } else {
      query = query.eq('bedrooms', beds)
    }
  }

  // Apply bathrooms filter
  if (params.baths) {
    const baths = params.baths === '3+' ? 3 : parseFloat(params.baths)
    if (params.baths === '3+') {
      query = query.gte('bathrooms', baths)
    } else {
      query = query.eq('bathrooms', baths)
    }
  }

  // Apply price range filter
  if (params.price_min) {
    query = query.gte('price_per_month', parseInt(params.price_min))
  }
  if (params.price_max) {
    query = query.lte('price_per_month', parseInt(params.price_max))
  }

  // Apply region filter
  if (regionFilterIds) {
    query = query.in('region_id', regionFilterIds)
  }

  // Apply amenities filter
  if (params.amenities) {
    const selectedAmenities = params.amenities.split(',').filter(Boolean)
    const amenityToDbValue: Record<string, string> = {
      'WiFi': 'wifi',
      'Air Conditioning': 'ac',
      'Parking': 'parking',
      'Pool': 'pool',
      'Kitchen': 'kitchen',
      'Washer/Dryer': 'washer_dryer',
      'TV': 'tv',
      'Hot Water': 'hot_water',
      'Furnished': 'furnished',
      'Security': 'security',
      'Generator': 'generator',
      'Garden': 'yard',
      'Balcony': 'balcony',
      'Gym': 'gym',
      'Elevator': 'elevator',
      'Pet Friendly': 'pet_friendly',
      'Wheelchair Accessible': 'wheelchair_accessible',
      'Smoke Detector': 'smoke_detector',
      'Fire Extinguisher': 'fire_extinguisher',
      'First Aid Kit': 'first_aid_kit',
    }
    const dbAmenities = selectedAmenities.map(amenity =>
      amenityToDbValue[amenity] || amenity.toLowerCase().replace(/\s+/g, '_')
    )
    query = query.contains('amenities', JSON.stringify(dbAmenities))
  }

  // Apply sorting
  const sort = params.sort || 'newest'
  switch (sort) {
    case 'price_low':
      query = query.order('price_per_month', { ascending: true })
      break
    case 'price_high':
      query = query.order('price_per_month', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Build count query with same filters
  let countQuery = supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)

  if (safeSearchTerm) {
    countQuery = countQuery.or(`name.ilike.%${safeSearchTerm}%,description.ilike.%${safeSearchTerm}%,location_details.ilike.%${safeSearchTerm}%`)
  }
  if (resolvedCategoryId) {
    countQuery = countQuery.eq('category_id', resolvedCategoryId)
  }
  if (params.beds) {
    const beds = params.beds === '4+' ? 4 : parseInt(params.beds)
    if (params.beds === '4+') {
      countQuery = countQuery.gte('bedrooms', beds)
    } else {
      countQuery = countQuery.eq('bedrooms', beds)
    }
  }
  if (params.baths) {
    const baths = params.baths === '3+' ? 3 : parseFloat(params.baths)
    if (params.baths === '3+') {
      countQuery = countQuery.gte('bathrooms', baths)
    } else {
      countQuery = countQuery.eq('bathrooms', baths)
    }
  }
  if (params.price_min) {
    countQuery = countQuery.gte('price_per_month', parseInt(params.price_min))
  }
  if (params.price_max) {
    countQuery = countQuery.lte('price_per_month', parseInt(params.price_max))
  }
  if (regionFilterIds) {
    countQuery = countQuery.in('region_id', regionFilterIds)
  }

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: rentals, error } = await query

  if (error) {
    console.error('Error fetching rentals:', JSON.stringify(error, null, 2))
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to load properties
          </h2>
          <p className="text-gray-500 text-lg mb-6">
            We had trouble loading rental listings. Please try again in a moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get categories with counts
  const categoriesWithCounts = await getRentalCategoriesWithCounts()

  // Get regions for filter
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Get current category name for header
  const currentCategory = params.category
    ? categoriesWithCounts.find(c => c.slug === params.category)
    : null

  const totalRentals = totalCount || 0
  const totalPages = Math.ceil(totalRentals / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen flex">
      {/* Desktop Category Sidebar */}
      <RentalCategorySidebar categories={categoriesWithCounts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 lg:h-[calc(100vh-74px)] lg:overflow-y-auto">
        {/* Hero Section - Only show when no filters applied */}
        {!hasFilters && featuredRentals.length > 0 && (
          <div className="flex-shrink-0 w-full">
            <FeaturedRentalsHero rentals={featuredRentals} />
          </div>
        )}

        {/* Search & Filters Section */}
        <div className={`${hasFilters ? 'gradient-mesh-jungle' : 'bg-white/80 backdrop-blur-xl'} border-b border-gray-200/50 sticky top-0 z-30`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentCategory?.name || 'All Rentals'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {totalCount || 0} {(totalCount || 0) === 1 ? 'property' : 'properties'} found
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Search by location, property name, or description..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-gray-900 placeholder:text-gray-500 transition-all"
                />
              </div>
              {/* Preserve active filters on search submit */}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.beds && <input type="hidden" name="beds" value={params.beds} />}
              {params.baths && <input type="hidden" name="baths" value={params.baths} />}
              {params.price_min && <input type="hidden" name="price_min" value={params.price_min} />}
              {params.price_max && <input type="hidden" name="price_max" value={params.price_max} />}
              {params.region && <input type="hidden" name="region" value={params.region} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              {params.amenities && <input type="hidden" name="amenities" value={params.amenities} />}
            </form>

            {/* Desktop Filter Panel */}
            <div className="hidden lg:block">
              <RentalFilterPanel
                regions={regions?.map(r => ({ name: r.name, slug: r.slug || r.id })) || []}
                currentFilters={{
                  beds: params.beds,
                  baths: params.baths,
                  price_min: params.price_min,
                  price_max: params.price_max,
                  region: params.region,
                  sort: params.sort,
                  amenities: params.amenities,
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Category & Filter Bar */}
        <MobileRentalCategoryFilterBar
          categories={categoriesWithCounts.map(cat => ({ ...cat, listing_count: cat.count }))}
          regions={regions?.map(r => ({ name: r.name, slug: r.slug || r.id })) || []}
        />

        {/* Main Content with Gradient Background */}
        <main className="flex-1 relative">
          {/* Background Texture */}
          <div className="absolute inset-0 gradient-mesh-jungle opacity-50" />
          <div className="absolute inset-0 grain-overlay" />

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 max-w-screen-2xl mx-auto w-full">
            {/* Section Header - Only show when there are filters */}
            {hasFilters && (
              <div className="mb-8 animate-fade-up">
                <h1 className="font-display text-3xl lg:text-4xl text-gray-900 mb-2">
                  {currentCategory?.name || 'Search Results'}
                </h1>
                <p className="text-gray-600 text-lg">
                  {params.q ? `Results for "${params.q}"` : 'Filtered properties matching your criteria'}
                </p>
              </div>
            )}

            {/* Intro Section - Only when no filters */}
            {!hasFilters && (
              <div className="mb-10 animate-fade-up">
                <h1 className="font-display text-3xl lg:text-4xl text-gray-900 mb-3">
                  Discover Your Perfect Home
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Browse our curated collection of apartments, houses, and vacation rentals across Guyana.
                  Contact property owners directly to find your ideal space.
                </p>
              </div>
            )}

            {/* Rentals Grid */}
            {rentals && rentals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {rentals.map((rental, index) => (
                  <div
                    key={rental.id}
                    className="animate-fade-up h-full"
                    style={{ animationDelay: `${Math.min(index * 80, 800)}ms` }}
                  >
                    <RentalCard rental={rental} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 animate-fade-up">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-100 mb-6 shadow-lg">
                  <Home className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="font-display text-2xl text-gray-900 mb-3">
                  No properties found
                </h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto mb-6">
                  Try adjusting your filters or search terms to discover available rentals
                </p>
                <Link
                  href="/rentals"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 animate-fade-up" style={{ animationDelay: '1000ms' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl="/rentals"
                  searchParams={{
                    q: params.q,
                    category: params.category,
                    beds: params.beds,
                    baths: params.baths,
                    price_min: params.price_min,
                    price_max: params.price_max,
                    region: params.region,
                    sort: params.sort,
                    amenities: params.amenities,
                  }}
                />
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalRentals)} of {totalRentals} properties
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
