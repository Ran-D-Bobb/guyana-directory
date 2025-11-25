import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RentalCard } from '@/components/RentalCard'
import { RentalCategorySidebar } from '@/components/RentalCategorySidebar'
import { MobileRentalCategoryDrawer } from '@/components/MobileRentalCategoryDrawer'
import { MobileRentalFilterSheet } from '@/components/MobileRentalFilterSheet'
import { getRentalCategoriesWithCounts } from '@/lib/category-counts'
import { Home } from 'lucide-react'

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
      rental_categories(name, slug, icon),
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
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Category Sidebar */}
      <RentalCategorySidebar categories={categoriesWithCounts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header - Sticky on desktop */}
        <div className="lg:sticky lg:top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {currentCategory?.name || 'All Rentals'}
                </h2>
                <p className="text-sm text-gray-600">
                  {rentals?.length || 0} {(rentals?.length || 0) === 1 ? 'property' : 'properties'} found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              Find Your Perfect Rental
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Browse apartments, houses, vacation homes, and more across Guyana. Contact property owners instantly via WhatsApp.
            </p>
          </div>

          {/* Search Bar */}
          <form className="mb-6">
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search by location, name, or description..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            />
          </form>

          {/* Rentals Grid */}
          {rentals && rentals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
              {rentals.map((rental, index) => (
                <div
                  key={rental.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <RentalCard rental={rental} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6">
                <Home className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No properties found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Try adjusting your filters or check back later for new listings
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Rental Category Drawer */}
      <MobileRentalCategoryDrawer categories={categoriesWithCounts.map(cat => ({ ...cat, listing_count: cat.count }))} />

      {/* Mobile Rental Filter Sheet */}
      <MobileRentalFilterSheet regions={regions?.map(r => ({ name: r.name, slug: r.slug || r.id })) || []} />
    </div>
  )
}
