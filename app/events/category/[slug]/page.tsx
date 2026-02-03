import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EventCategorySidebar } from '@/components/EventCategorySidebar'
import { EventPageClient } from '@/components/EventPageClient'
import { MobileEventCategoryFilterBar } from '@/components/MobileEventCategoryFilterBar'
import { getEventCategoriesWithCounts } from '@/lib/category-counts'

interface EventCategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    time?: string
    sort?: string
    q?: string
    region?: string
    view?: string
  }>
}

export default async function EventCategoryPage({ params, searchParams }: EventCategoryPageProps) {
  const { slug } = await params
  const { time = 'upcoming', sort = 'featured', q, region, view = 'grid' } = await searchParams
  const supabase = await createClient()

  // Fetch the category
  const { data: category } = await supabase
    .from('event_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  // Fetch all event categories with counts based on time filter
  const validTimeFilter = ['upcoming', 'ongoing', 'past', 'all'].includes(time) ? time as 'upcoming' | 'ongoing' | 'past' | 'all' : 'upcoming'
  const categoriesWithCount = await getEventCategoriesWithCounts(validTimeFilter)

  // Get current time for main query
  const now = new Date().toISOString()

  // Fetch all regions for filters
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Build the query for events
  let query = supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug)
    `)
    .eq('category_id', category.id)

  // Apply time filter
  switch (time) {
    case 'upcoming':
      query = query.gt('start_date', now)
      break
    case 'ongoing':
      query = query.lte('start_date', now).gte('end_date', now)
      break
    case 'past':
      query = query.lt('end_date', now)
      break
    case 'all':
      // No filter
      break
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
      query = query.order('start_date', { ascending: true })
      break
    case 'date':
      query = query.order('start_date', { ascending: true })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
  }

  const { data: rawEvents, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Events category query error:', error)
  }

  // Map events to ensure proper types
  const events = (rawEvents || []).map(event => ({
    ...event,
    event_categories: event.event_categories ? {
      name: event.event_categories.name,
      icon: event.event_categories.icon || ''
    } : null,
    businesses: event.businesses ? {
      name: event.businesses.name,
      slug: event.businesses.slug
    } : null,
    profiles: null as { name: string | null } | null
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Event Category Sidebar */}
      <EventCategorySidebar categories={categoriesWithCount} currentCategorySlug={slug} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Mobile Header - Sticky */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b-0 px-4 py-4 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {category.name}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold text-gray-900">{events.length}</span> events
          </p>
        </div>

        {/* Mobile Category & Filter Bar */}
        <MobileEventCategoryFilterBar
          categories={categoriesWithCount}
          currentCategorySlug={slug}
          regions={regions || []}
        />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Category Header - Desktop Only */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              {category.name} Events
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Discover {category.name.toLowerCase()} events happening in Guyana
            </p>
          </div>

          {/* Events Grid/Calendar with View Controls */}
          <EventPageClient events={events} searchParams={{ category: category.id, time, sort, q, region, view }} />
        </main>
      </div>

    </div>
  )
}
