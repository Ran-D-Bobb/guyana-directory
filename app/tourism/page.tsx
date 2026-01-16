import { createClient } from '@/lib/supabase/server'
import { TourismHero } from '@/components/tourism/TourismHero'
import { TourismCategoryPills } from '@/components/tourism/TourismCategoryPills'
import { FeaturedExperiences } from '@/components/tourism/FeaturedExperiences'
import { TourismFilterBarPremium } from '@/components/tourism/TourismFilterBarPremium'
import { TourismPageClientPremium } from '@/components/tourism/TourismPageClientPremium'
import { MobileTourismFilterSheet } from '@/components/MobileTourismFilterSheet'
import { getTourismCategoriesWithCounts } from '@/lib/category-counts'

// Revalidate every 5 minutes
export const revalidate = 300

interface TourismPageProps {
  searchParams: Promise<{
    category?: string
    difficulty?: string
    duration?: string
    sort?: string
    q?: string
    region?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 24

export default async function TourismPage({ searchParams }: TourismPageProps) {
  const { category, difficulty, duration, sort = 'featured', q, region, page = '1' } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

  // Fetch all tourism categories with counts
  const categoriesWithCount = await getTourismCategoriesWithCounts()

  // Fetch all regions for filters
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Build the query for tourism experiences
  let query = supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories:tourism_category_id (name, icon),
      regions:region_id (name),
      tourism_photos:tourism_photos (image_url, is_primary, display_order)
    `)
    .eq('is_approved', true)

  // Apply category filter if selected
  if (category && category !== 'all') {
    query = query.eq('tourism_category_id', category)
  }

  // Apply difficulty filter if selected
  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty_level', difficulty)
  }

  // Apply duration filter if selected (duration is stored as text like "2 hours", "Half Day", etc.)
  if (duration && duration !== 'all') {
    switch (duration) {
      case 'quick':
        query = query.or('duration.ilike.%hour%,duration.ilike.%1%,duration.ilike.%2%')
        break
      case 'half_day':
        query = query.ilike('duration', '%half%')
        break
      case 'full_day':
        query = query.ilike('duration', '%full%')
        break
      case 'multi_day':
        query = query.or('duration.ilike.%day%,duration.ilike.%week%,duration.ilike.%multi%')
        break
    }
  }

  // Apply region filter if selected
  if (region && region !== 'all') {
    query = query.eq('region_id', region)
  }

  // Apply search filter if query exists
  if (q && q.trim()) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,location_details.ilike.%${q}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      query = query.order('rating', { ascending: false })
      break
    case 'price_low':
      query = query.order('price_from', { ascending: true })
      break
    case 'price_high':
      query = query.order('price_from', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
  }

  // Build count query with same filters
  let countQuery = supabase
    .from('tourism_experiences')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)

  if (category && category !== 'all') {
    countQuery = countQuery.eq('tourism_category_id', category)
  }
  if (difficulty && difficulty !== 'all') {
    countQuery = countQuery.eq('difficulty_level', difficulty)
  }
  if (region && region !== 'all') {
    countQuery = countQuery.eq('region_id', region)
  }
  if (q && q.trim()) {
    countQuery = countQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%,location_details.ilike.%${q}%`)
  }

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: experiences, error } = await query

  if (error) {
    console.error('Tourism experiences query error:', error)
  }

  // Get featured experiences for the carousel (only if no filters applied)
  const hasFilters = !!(category || difficulty || duration || region || q)
  const featuredExperiences = !hasFilters
    ? experiences?.filter(e => e.is_featured).slice(0, 6) || []
    : []

  // Non-featured experiences for the main grid
  const gridExperiences = hasFilters
    ? experiences || []
    : experiences?.filter(e => !featuredExperiences.includes(e)) || []

  const totalExperiences = totalCount || 0
  const totalPages = Math.ceil(totalExperiences / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section - Only show when no search/filters */}
      {!hasFilters && (
        <TourismHero totalExperiences={totalExperiences} />
      )}

      {/* Main Content */}
      <div id="tourism-content" className="pb-24 lg:pb-12">
        {/* Category Pills Section */}
        <section className={`bg-white border-b border-gray-100 sticky top-0 z-30 ${hasFilters ? 'pt-4' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <TourismCategoryPills
              categories={categoriesWithCount}
              currentCategoryId={category}
            />
          </div>
        </section>

        {/* Featured Experiences Carousel - Only show when no filters */}
        {!hasFilters && featuredExperiences.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedExperiences experiences={featuredExperiences} />
          </section>
        )}

        {/* Filter Bar & Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Section Header */}
          {!hasFilters && featuredExperiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                All Experiences
              </h2>
              <p className="text-gray-600 mt-1">
                Browse our complete collection of tourism experiences
              </p>
            </div>
          )}

          {/* Filter Bar - Desktop */}
          <div className="hidden lg:block mb-8">
            <TourismFilterBarPremium
              regions={regions || []}
              currentFilters={{
                region,
                difficulty,
                duration,
                sort,
              }}
            />
          </div>

          {/* Search Query Display */}
          {q && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-emerald-800">
                Showing results for <span className="font-bold">&quot;{q}&quot;</span>
              </p>
            </div>
          )}

          {/* Experiences Grid */}
          <TourismPageClientPremium
            experiences={gridExperiences}
            hasFilters={hasFilters}
            pagination={{
              currentPage,
              totalPages,
              totalItems: totalExperiences,
              hasNextPage: currentPage < totalPages,
              hasPrevPage: currentPage > 1,
            }}
          />
        </section>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileTourismFilterSheet regions={regions || []} />
    </div>
  )
}
