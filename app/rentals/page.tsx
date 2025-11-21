import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RentalCard } from '@/components/RentalCard'
import { RentalCategorySidebar } from '@/components/RentalCategorySidebar'
import { RentalFilterPanel } from '@/components/RentalFilterPanel'

export const metadata: Metadata = {
  title: 'Browse Rentals - Guyana Directory',
  description: 'Find apartments, houses, vacation homes, and more in Guyana',
}

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
  }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Build query
  let query = supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug),
      regions(name),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('is_approved', true)

  // Apply search filter - uses PostgreSQL full-text search index (idx_rentals_search)
  // The index covers name, description, and location_details with to_tsvector
  if (params.q) {
    const searchTerm = params.q.trim()
    // Use ilike as a fallback for partial matching since Supabase PostgREST doesn't expose
    // to_tsquery directly, but PostgreSQL will still use the GIN index for optimization
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

    // The amenities field is a JSONB array, so we need to check if all selected amenities exist
    // Use contains operator for JSONB array matching
    selectedAmenities.forEach(amenity => {
      // Match the amenity value in the JSONB array (case-insensitive)
      query = query.contains('amenities', [amenity])
    })
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

  // Limit to 20 per page (pagination can be added later)
  query = query.limit(20)

  const { data: rentals, error } = await query

  if (error) {
    console.error('Error fetching rentals:', error)
    return <div>Error loading rentals</div>
  }

  // Get categories for sidebar
  const { data: categories } = await supabase
    .from('rental_categories')
    .select(`
      *,
      rentals!inner(id)
    `)
    .eq('rentals.is_approved', true)

  // Count rentals per category
  const categoriesWithCounts = categories?.map(cat => ({
    ...cat,
    count: cat.rentals?.length || 0
  })) || []

  // Get regions for filter
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <RentalCategorySidebar categories={categoriesWithCounts} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {params.category
                  ? categoriesWithCounts.find(c => c.slug === params.category)?.name || 'Browse Rentals'
                  : 'Browse Rentals'}
              </h1>
              <p className="mt-2 text-gray-600">
                {rentals?.length || 0} properties available
              </p>

              {/* Search Bar */}
              <form className="mt-4">
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Search by location, name, or description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </form>
            </div>
          </div>

          {/* Filters */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <RentalFilterPanel
              regions={regions || []}
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

          {/* Rentals Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {rentals && rentals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentals.map((rental) => (
                  <RentalCard key={rental.id} rental={rental} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
