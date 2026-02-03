import { createClient } from '@/lib/supabase/server'
import { CategorySidebar } from '@/components/CategorySidebar'
import { BusinessesPageClient } from '@/components/BusinessesPageClient'
import { MobileCategoryFilterBar } from '@/components/MobileCategoryFilterBar'
import { BusinessFilterPanel } from '@/components/BusinessFilterPanel'
import { BusinessSearch } from '@/components/BusinessSearch'
import { getBusinessCategoriesWithCounts } from '@/lib/category-counts'

// Revalidate every 5 minutes - categories and regions don't change often
export const revalidate = 300

interface BusinessesPageProps {
  searchParams: Promise<{
    category?: string
    region?: string
    sort?: string
    q?: string
    rating?: string
    verified?: string
    featured?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 24

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const { category, region, sort = 'featured', q, rating, verified, featured, page = '1' } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

  // Fetch user for saved businesses
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's saved businesses if logged in
  let savedBusinessIds: string[] = []
  if (user) {
    const { data: savedBusinesses } = await supabase
      .from('saved_businesses')
      .select('business_id')
      .eq('user_id', user.id)
    savedBusinessIds = savedBusinesses?.map(sb => sb.business_id) || []
  }

  // Fetch all categories with business counts
  const categoriesWithCount = await getBusinessCategoriesWithCounts()

  // Fetch all regions for filters
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Resolve category slug to ID if needed
  let categoryId: string | null = null
  if (category && category !== 'all') {
    // Check if it's a UUID (category_id) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)
    if (isUUID) {
      categoryId = category
    } else {
      // Look up category by slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      categoryId = categoryData?.id || null
    }
  }

  // Resolve region slug to ID if needed
  let regionId: string | null = null
  if (region && region !== 'all') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(region)
    if (isUUID) {
      regionId = region
    } else {
      // Look up region by slug
      const { data: regionData } = await supabase
        .from('regions')
        .select('id')
        .eq('slug', region)
        .single()
      regionId = regionData?.id || null
    }
  }

  // Build the query for businesses
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

  // Apply category filter if selected
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  // Apply region filter if selected
  if (regionId) {
    query = query.eq('region_id', regionId)
  }

  // Apply search filter if query exists
  if (q && q.trim()) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
  }

  // Apply rating filter
  if (rating && rating !== 'all') {
    const minRating = parseFloat(rating)
    if (!isNaN(minRating)) {
      query = query.gte('rating', minRating)
    }
  }

  // Apply verified filter
  if (verified === 'true') {
    query = query.eq('is_verified', true)
  }

  // Apply featured filter
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  // Apply sorting
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
  }

  // Get total count for pagination (before applying limit)
  let countQuery = supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  // Apply same filters to count query
  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId)
  }
  if (regionId) {
    countQuery = countQuery.eq('region_id', regionId)
  }
  if (q && q.trim()) {
    countQuery = countQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
  }
  if (rating && rating !== 'all') {
    const minRating = parseFloat(rating)
    if (!isNaN(minRating)) {
      countQuery = countQuery.gte('rating', minRating)
    }
  }
  if (verified === 'true') {
    countQuery = countQuery.eq('is_verified', true)
  }
  if (featured === 'true') {
    countQuery = countQuery.eq('is_featured', true)
  }

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: businesses, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Businesses query error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
  }

  // Process businesses to extract primary photo
  const businessesWithPhotos = (businesses || []).map(b => ({
    ...b,
    primary_photo: Array.isArray(b.business_photos)
      ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || null
      : null
  }))

  // Pagination data
  const totalBusinesses = totalCount || 0
  const totalPages = Math.ceil(totalBusinesses / ITEMS_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))] flex pb-0 lg:pb-0">
      {/* Desktop Category Sidebar */}
      <CategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">

        {/* Compact Header with Search - only sticky on desktop */}
        <header className="bg-white border-b border-gray-200 lg:sticky lg:top-0 lg:z-40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Title and count */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl text-[hsl(var(--jungle-900))]">
                  {q ? `Results for "${q}"` : 'Local Businesses'}
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'} found
                </p>
              </div>

              {/* Search Input */}
              <BusinessSearch initialQuery={q || ''} />
            </div>
          </div>
        </header>

        {/* Mobile Category & Filter Bar */}
        <MobileCategoryFilterBar
          categories={categoriesWithCount}
          regions={regions || []}
          currentFilters={{ region, sort, rating, verified, featured }}
          basePath="/businesses"
          categoryPath="/businesses/category"
        />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block mb-6 relative z-20">
            <BusinessFilterPanel
              regions={regions || []}
              currentFilters={{
                region,
                sort,
                rating,
                verified,
                featured,
              }}
            />
          </div>

          {/* Business Grid */}
          <BusinessesPageClient
            businesses={businessesWithPhotos}
            pagination={{
              currentPage,
              totalPages,
              totalItems: totalBusinesses,
              hasNextPage,
              hasPrevPage,
            }}
            userId={user?.id}
            savedBusinessIds={savedBusinessIds}
          />
        </main>
      </div>

    </div>
  )
}
