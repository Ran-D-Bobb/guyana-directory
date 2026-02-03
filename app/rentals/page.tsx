import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RentalCard } from '@/components/RentalCard'
import { RentalCategorySidebar } from '@/components/RentalCategorySidebar'
import { MobileRentalCategoryFilterBar } from '@/components/MobileRentalCategoryFilterBar'
import { RentalFilterPanel } from '@/components/RentalFilterPanel'
import { FeaturedRentalsHero } from '@/components/rentals/FeaturedRentalsHero'
import { getRentalCategoriesWithCounts } from '@/lib/category-counts'
import { Home, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

// Revalidate every 5 minutes
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Browse Rentals - Guyana Directory',
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
    const { data: featured } = await supabase
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
  if (params.q) {
    const searchTerm = params.q.trim()
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_details.ilike.%${searchTerm}%`)
  }

  // Apply category filter
  if (params.category) {
    const { data: category } = await supabase
      .from('rental_categories')
      .select('id')
      .eq('slug', params.category)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
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
  if (params.region) {
    const { data: region } = await supabase
      .from('regions')
      .select('id')
      .eq('slug', params.region)
      .single()

    if (region) {
      query = query.eq('region_id', region.id)
    }
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

  if (params.q) {
    const searchTerm = params.q.trim()
    countQuery = countQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_details.ilike.%${searchTerm}%`)
  }
  if (params.category) {
    const { data: category } = await supabase
      .from('rental_categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    if (category) {
      countQuery = countQuery.eq('category_id', category.id)
    }
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
  if (params.region) {
    const { data: region } = await supabase
      .from('regions')
      .select('id')
      .eq('slug', params.region)
      .single()
    if (region) {
      countQuery = countQuery.eq('region_id', region.id)
    }
  }

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: rentals, error } = await query

  if (error) {
    console.error('Error fetching rentals:', JSON.stringify(error, null, 2))
    return <div>Error loading rentals: {error.message || 'Unknown error'}</div>
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

  return (
    <div className="min-h-screen flex">
      {/* Desktop Category Sidebar */}
      <RentalCategorySidebar categories={categoriesWithCounts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pb-20 lg:pb-0 lg:h-[calc(100vh-74px)] lg:overflow-y-auto">
        {/* Hero Section - Only show when no filters applied */}
        {!hasFilters && featuredRentals.length > 0 && (
          <div className="flex-shrink-0 w-full">
            <FeaturedRentalsHero rentals={featuredRentals} />
          </div>
        )}

        {/* Search & Filters Section - sticky on desktop only */}
        <div className={`${hasFilters ? 'gradient-mesh-jungle' : 'bg-white/80 backdrop-blur-xl'} border-b border-gray-200/50 lg:sticky lg:top-0 lg:z-30`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
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
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 mb-6 shadow-lg">
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {(() => {
              const totalRentals = totalCount || 0
              const totalPages = Math.ceil(totalRentals / ITEMS_PER_PAGE)

              if (totalPages <= 1) return null

              const goToPage = (page: number) => {
                const urlParams = new URLSearchParams()
                if (params.q) urlParams.set('q', params.q)
                if (params.category) urlParams.set('category', params.category)
                if (params.beds) urlParams.set('beds', params.beds)
                if (params.baths) urlParams.set('baths', params.baths)
                if (params.price_min) urlParams.set('price_min', params.price_min)
                if (params.price_max) urlParams.set('price_max', params.price_max)
                if (params.region) urlParams.set('region', params.region)
                if (params.sort) urlParams.set('sort', params.sort)
                if (params.amenities) urlParams.set('amenities', params.amenities)
                urlParams.set('page', page.toString())
                return `/rentals?${urlParams.toString()}`
              }

              return (
                <div className="mt-12 animate-fade-up" style={{ animationDelay: '1000ms' }}>
                  <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
                    <Link
                      href={currentPage > 1 ? goToPage(currentPage - 1) : '#'}
                      className={`p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true
                        if (page === 1 || page === totalPages) return true
                        if (Math.abs(page - currentPage) <= 1) return true
                        return false
                      })
                      .map((page, index, arr) => {
                        const showEllipsis = index > 0 && page - arr[index - 1] > 1
                        return (
                          <span key={page} className="flex items-center">
                            {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                            <Link
                              href={goToPage(page)}
                              className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                              aria-current={currentPage === page ? 'page' : undefined}
                            >
                              {page}
                            </Link>
                          </span>
                        )
                      })}

                    <Link
                      href={currentPage < totalPages ? goToPage(currentPage + 1) : '#'}
                      className={`p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </nav>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalRentals)} of {totalRentals} properties
                  </p>
                </div>
              )
            })()}
          </div>
        </main>
      </div>
    </div>
  )
}
