import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { createStaticClient } from '@/lib/supabase/static'
import { TourismHero, HeroVideo } from '@/components/tourism/TourismHero'
import { TourismCategoryPills } from '@/components/tourism/TourismCategoryPills'
import { FeaturedExperiences } from '@/components/tourism/FeaturedExperiences'
import { TourismFilterBarPremium } from '@/components/tourism/TourismFilterBarPremium'
import { TourismPageClientPremium } from '@/components/tourism/TourismPageClientPremium'
import { MobileTourismCategoryFilterBar } from '@/components/MobileTourismCategoryFilterBar'
import { getTourismCategoriesWithCounts } from '@/lib/category-counts'
import { resolveRegionFilter } from '@/lib/regions'
import { RegionRedirect } from '@/components/RegionRedirect'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('tourism')
  return {
    title: t('pageTitle'),
    description: 'Discover guided tours, adventures, and cultural experiences across Guyana. From Kaieteur Falls to Rupununi safaris, find your next unforgettable adventure.',
    alternates: { canonical: '/tourism' },
    openGraph: {
      title: 'Things to Do in Guyana | Waypoint',
      description: 'Discover guided tours, adventures, and cultural experiences across Guyana. From Kaieteur Falls to Rupununi safaris.',
    },
  }
}

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

// Sanitize search input: strip Postgres pattern/special chars and backslashes
function sanitizeSearch(raw: string | undefined): string {
  return raw ? raw.replace(/[^a-zA-Z0-9\s\-']/g, ' ').trim() : ''
}

// Apply shared tourism filters to any Supabase query builder (data or count)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyTourismFilters<T extends { eq: (...args: any[]) => T; ilike: (...args: any[]) => T; or: (...args: any[]) => T; in: (...args: any[]) => T }>(
  query: T,
  filters: { category?: string; difficulty?: string; duration?: string; regionIds?: string[] | null; safeQ?: string }
): T {
  const { category, difficulty, duration, regionIds, safeQ } = filters

  if (category && category !== 'all') {
    query = query.eq('tourism_category_id', category)
  }
  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty_level', difficulty)
  }
  if (duration && duration !== 'all') {
    switch (duration) {
      case 'quick':
        query = query.ilike('duration', '%hour%')
        break
      case 'half_day':
        query = query.ilike('duration', '%half%day%')
        break
      case 'full_day':
        query = query.ilike('duration', '%full%day%')
        break
      case 'multi_day':
        query = query.or('duration.ilike.%week%,duration.ilike.%multi%,duration.ilike.%night%')
        break
    }
  }
  if (regionIds) {
    query = query.in('region_id', regionIds)
  }
  if (safeQ) {
    query = query.or(`name.plfts.${safeQ},description.ilike.%${safeQ}%,location_details.ilike.%${safeQ}%`)
  }

  return query
}

export default async function TourismPage({ searchParams }: TourismPageProps) {
  const { category, difficulty, duration, sort = 'featured', q, region, page = '1' } = await searchParams
  const t = await getTranslations('tourism')
  const supabase = createStaticClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

  // Fetch all tourism categories with counts
  const categoriesWithCount = await getTourismCategoriesWithCounts()

  // Fetch hero videos
  const { data: heroVideosData } = await supabase
    .from('tourism_hero_videos')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const heroVideos: HeroVideo[] = heroVideosData || []

  // Fetch all regions for filters
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name, slug')
    .order('name')

  // Resolve region from URL param (RegionRedirect adds it client-side from cookie)
  const effectiveRegion = region || 'all'
  const regionFilterIds = await resolveRegionFilter(supabase, effectiveRegion)

  const safeQ = sanitizeSearch(q)
  const filterParams = { category, difficulty, duration, regionIds: regionFilterIds, safeQ }

  // Build the query for tourism experiences
  let query = applyTourismFilters(
    supabase
      .from('tourism_experiences')
      .select(`
        *,
        tourism_categories:tourism_category_id (name, icon),
        regions:region_id (name),
        tourism_photos:tourism_photos (image_url, is_primary, display_order)
      `)
      .eq('is_approved', true),
    filterParams
  )

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
  const countQuery = applyTourismFilters(
    supabase
      .from('tourism_experiences')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', true),
    filterParams
  )

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: experiences, error } = await query

  if (error) {
    // Only log if there's actual error content
    const errorMessage = error.message || error.code || JSON.stringify(error)
    if (errorMessage && errorMessage !== '{}') {
      console.error('Tourism experiences query error:', errorMessage)
    }
  }

  const hasFilters = !!(category || difficulty || duration || region || q)

  // Fetch featured experiences separately so they don't consume pagination slots
  let featuredExperiences: typeof experiences = []
  if (!hasFilters && currentPage === 1) {
    let featuredQuery = supabase
      .from('tourism_experiences')
      .select(`
        *,
        tourism_categories:tourism_category_id (name, icon),
        regions:region_id (name),
        tourism_photos:tourism_photos (image_url, is_primary, display_order)
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
    if (regionFilterIds) featuredQuery = featuredQuery.in('region_id', regionFilterIds)
    const { data: featured } = await featuredQuery
      .order('rating', { ascending: false })
      .limit(6)

    featuredExperiences = featured || []
  }

  // All paginated experiences go to the grid (featured carousel is separate)
  const gridExperiences = experiences || []

  const totalExperiences = totalCount || 0
  const totalPages = Math.ceil(totalExperiences / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(0,0%,5%)]">
      <Suspense fallback={null}><RegionRedirect /></Suspense>
      {/* Hero Section - Only show when no search/filters */}
      {!hasFilters && (
        <TourismHero totalExperiences={totalExperiences} videos={heroVideos} />
      )}

      {/* Main Content */}
      <div id="tourism-content" className="pb-24 lg:pb-12">
        {/* Mobile Category & Filter Bar */}
        <MobileTourismCategoryFilterBar
          categories={categoriesWithCount}
          regions={regions || []}
        />

        {/* Category Pills Section - Desktop */}
        <section className={`hidden lg:block bg-white border-b border-gray-100 sticky top-0 z-30 ${hasFilters ? 'pt-4' : ''}`}>
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
                {t('allExperiences')}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('subtitle')}
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
                {t('showingResultsFor', { query: q })}
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
    </div>
  )
}
