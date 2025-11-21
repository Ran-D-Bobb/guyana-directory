import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RentalCard } from '@/components/RentalCard'
import { RentalCategorySidebar } from '@/components/RentalCategorySidebar'
import { RentalFilterPanel } from '@/components/RentalFilterPanel'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  const { data: category } = await supabase
    .from('rental_categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found - Guyana Directory',
    }
  }

  return {
    title: `${category.name} - Rentals - Guyana Directory`,
    description: category.description || `Browse ${category.name} in Guyana`,
  }
}

export default async function RentalCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    q?: string
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
  const { slug } = await params
  const filters = await searchParams

  // Get category
  const { data: category, error: categoryError } = await supabase
    .from('rental_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

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
    .eq('category_id', category.id)

  // Apply search filter - uses PostgreSQL full-text search index (idx_rentals_search)
  if (filters.q) {
    const searchTerm = filters.q.trim()
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_details.ilike.%${searchTerm}%`)
  }

  // Apply bedrooms filter
  if (filters.beds) {
    const beds = filters.beds === '4+' ? 4 : parseInt(filters.beds)
    if (filters.beds === '4+') {
      query = query.gte('bedrooms', beds)
    } else {
      query = query.eq('bedrooms', beds)
    }
  }

  // Apply bathrooms filter
  if (filters.baths) {
    const baths = filters.baths === '3+' ? 3 : parseFloat(filters.baths)
    if (filters.baths === '3+') {
      query = query.gte('bathrooms', baths)
    } else {
      query = query.eq('bathrooms', baths)
    }
  }

  // Apply price range filter
  if (filters.price_min) {
    query = query.gte('price_per_month', parseInt(filters.price_min))
  }
  if (filters.price_max) {
    query = query.lte('price_per_month', parseInt(filters.price_max))
  }

  // Apply region filter
  if (filters.region) {
    const { data: region } = await supabase
      .from('regions')
      .select('id')
      .eq('slug', filters.region)
      .single()

    if (region) {
      query = query.eq('region_id', region.id)
    }
  }

  // Apply amenities filter
  if (filters.amenities) {
    const selectedAmenities = filters.amenities.split(',').filter(Boolean)

    // The amenities field is a JSONB array, so we need to check if all selected amenities exist
    selectedAmenities.forEach(amenity => {
      query = query.contains('amenities', [amenity])
    })
  }

  // Apply sorting
  const sort = filters.sort || 'newest'
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

  // Limit to 20 per page
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
        <RentalCategorySidebar
          categories={categoriesWithCounts}
          currentCategory={slug}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Category Header */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{category.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              </div>
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {rentals?.length || 0} properties available
              </p>

              {/* Search Bar */}
              <form className="mt-4">
                <input
                  type="text"
                  name="q"
                  defaultValue={filters.q}
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
                beds: filters.beds,
                baths: filters.baths,
                price_min: filters.price_min,
                price_max: filters.price_max,
                region: filters.region,
                sort: filters.sort,
                amenities: filters.amenities,
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
