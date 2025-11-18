import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TourismCategorySidebar } from '@/components/TourismCategorySidebar'
import { TourismFilterPanel } from '@/components/TourismFilterPanel'
import { TourismPageClient } from '@/components/TourismPageClient'
import { MobileTourismCategoryDrawer } from '@/components/MobileTourismCategoryDrawer'

interface TourismCategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    region?: string
    sort?: string
    difficulty?: string
    duration?: string
    q?: string
  }>
}

export default async function TourismCategoryPage({ params, searchParams }: TourismCategoryPageProps) {
  const { slug } = await params
  const { region, sort = 'featured', difficulty, duration, q } = await searchParams
  const supabase = await createClient()

  // Fetch the tourism category
  const { data: category } = await supabase
    .from('tourism_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  // Fetch all tourism categories with experience counts for sidebar and drawer
  const { data: tourismCategories } = await supabase
    .from('tourism_categories')
    .select('*, tourism_experiences:tourism_experiences(count)')
    .order('display_order')

  // Transform categories to include experience count
  const categoriesWithCount = tourismCategories?.map((cat) => ({
    ...cat,
    experience_count: Array.isArray(cat.tourism_experiences) ? cat.tourism_experiences.length : 0,
  })) || []

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
    .eq('tourism_category_id', category.id)
    .eq('is_approved', true) // Only show approved experiences to public

  // Apply difficulty filter if selected
  if (difficulty && difficulty !== 'all') {
    query = query.eq('difficulty_level', difficulty)
  }

  // Apply duration filter if selected
  if (duration && duration !== 'all') {
    // Map duration filter values to actual database values or ranges
    switch (duration) {
      case 'quick':
        query = query.lte('duration_hours', 2)
        break
      case 'half_day':
        query = query.gte('duration_hours', 3).lte('duration_hours', 4)
        break
      case 'full_day':
        query = query.gte('duration_hours', 5).lte('duration_hours', 8)
        break
      case 'multi_day':
        query = query.gt('duration_hours', 8)
        break
    }
  }

  // Apply region filter if selected
  if (region && region !== 'all') {
    query = query.eq('region_id', region)
  }

  // Apply search filter if query exists
  if (q && q.trim()) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      query = query.order('rating', { ascending: false })
      break
    case 'price_low':
      query = query.order('price_per_person', { ascending: true })
      break
    case 'price_high':
      query = query.order('price_per_person', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
  }

  const { data: experiences, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Tourism experiences query error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Tourism Category Sidebar */}
      <TourismCategorySidebar categories={categoriesWithCount} currentCategorySlug={slug} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Mobile Header - Sticky */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {category.description}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold text-gray-900">{experiences?.length || 0}</span> results
          </p>
        </div>

        {/* Tourism Filter Panel - Desktop Only, Sticky, Collapsible */}
        <TourismFilterPanel
          regions={regions || []}
          experienceCount={experiences?.length || 0}
          categoryName={category.name}
        />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Category Header - Desktop Only */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Experiences Grid */}
          {experiences && experiences.length > 0 ? (
            <TourismPageClient experiences={experiences} searchParams={{ category: category.id, difficulty, duration, sort, q, region }} />
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6">
                <span className="text-4xl">🌴</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No experiences found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Try adjusting your filters or check back later for new experiences in this category
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Tourism Category Drawer */}
      <MobileTourismCategoryDrawer categories={categoriesWithCount} currentCategorySlug={slug} />
    </div>
  )
}
