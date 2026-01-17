import { createClient } from '@/lib/supabase/server'
import { EventCategorySidebar } from '@/components/EventCategorySidebar'
import { EventPageClient } from '@/components/EventPageClient'
import { MobileEventCategoryDrawer } from '@/components/MobileEventCategoryDrawer'
import { EventFilterPanel } from '@/components/EventFilterPanel'
import { FeaturedEventsShowcase } from '@/components/FeaturedEventsShowcase'
import { getEventCategoriesWithCounts } from '@/lib/category-counts'
import { Calendar, Compass, Sparkles } from 'lucide-react'
import { MobileEventFilterSheet } from '@/components/MobileEventFilterSheet'
import { TimelineBanner } from '@/components/TimelineBanner'
import Link from 'next/link'

// Revalidate every 5 minutes
export const revalidate = 300

interface EventsPageProps {
  searchParams: Promise<{
    category?: string
    time?: string
    sort?: string
    q?: string
    region?: string
    view?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 24

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category, time = 'upcoming', sort = 'featured', q, region, view = 'grid', page = '1' } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

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

  // Fetch timeline events for the banner preview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timelineEvents } = await (supabase as any)
    .from('timeline_events')
    .select('title, month_short, gradient_colors, media_type')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(3)

  // Build the query for events
  let query = supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug)
    `)

  // Apply time filter (now already defined above)
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

  // Apply category filter if selected
  if (category && category !== 'all') {
    query = query.eq('category_id', category)
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

  // Build count query with same filters
  let countQuery = supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  // Apply same time filter to count
  switch (time) {
    case 'upcoming':
      countQuery = countQuery.gt('start_date', now)
      break
    case 'ongoing':
      countQuery = countQuery.lte('start_date', now).gte('end_date', now)
      break
    case 'past':
      countQuery = countQuery.lt('end_date', now)
      break
  }
  if (category && category !== 'all') {
    countQuery = countQuery.eq('category_id', category)
  }
  if (region && region !== 'all') {
    countQuery = countQuery.eq('region_id', region)
  }
  if (q && q.trim()) {
    countQuery = countQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
  }

  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: rawEvents, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Events query error:', error)
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

  // Check if we should show the featured showcase (only on default view with no search)
  const showFeaturedShowcase = !q && !category && !region && time === 'upcoming' && sort === 'featured'
  const hasFeaturedEvents = events.some(e => e.is_featured)

  // Filter out featured events from main grid if showing showcase
  const gridEvents = showFeaturedShowcase && hasFeaturedEvents
    ? events.filter(e => !e.is_featured)
    : events

  // Pagination data
  const totalEvents = totalCount || 0
  const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-white flex pb-0 lg:pb-0">
      {/* Desktop Event Category Sidebar */}
      <EventCategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Page Header - Premium styling */}
          <div className="mb-8 animate-fade-up">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
              Events in Guyana
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Discover local events, workshops, festivals, and community gatherings across Guyana
            </p>
          </div>

          {/* Annual Events Timeline Banner */}
          <TimelineBanner previewEvents={timelineEvents || undefined} />

          {/* Desktop Filter Panel - Sticky */}
          <div className="hidden lg:block sticky top-0 z-30 mb-8 -mx-2 px-2 py-2 bg-gradient-to-b from-white via-white to-transparent">
            <EventFilterPanel
              regions={regions || []}
              currentFilters={{
                region,
                time,
                sort,
                view,
              }}
            />
          </div>

          {/* Featured Events Showcase - Only show on default view */}
          {showFeaturedShowcase && hasFeaturedEvents && (
            <FeaturedEventsShowcase events={events} />
          )}

          {/* Section divider when showing featured */}
          {showFeaturedShowcase && hasFeaturedEvents && gridEvents.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              <span className="text-sm font-medium text-gray-500 px-4">All Events</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
            </div>
          )}

          {/* Events Grid/Calendar with View Controls */}
          {events && events.length > 0 ? (
            <EventPageClient
              events={gridEvents.length > 0 ? gridEvents : events}
              searchParams={{ category, time, sort, q, region, view }}
              pagination={{
                currentPage,
                totalPages,
                totalItems: totalEvents,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
              }}
            />
          ) : (
            /* Premium Empty State */
            <div className="text-center py-16 lg:py-24 animate-fade-in">
              {/* Decorative background */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/40 to-amber-200/40 rounded-full blur-2xl scale-150" />
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-50 border border-emerald-200/50 shadow-lg">
                  <Calendar className="w-12 h-12 text-emerald-600" />
                </div>
              </div>

              <h3 className="font-display text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">
                The stage is waiting...
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                No events match your current filters. Try adjusting your search or explore other options.
              </p>

              {/* Suggested actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-colors"
                >
                  <Compass className="w-5 h-5" />
                  Browse All Events
                </Link>
                <Link
                  href="/events/timeline"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-emerald-200 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  View Annual Timeline
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Event Category Drawer */}
      <MobileEventCategoryDrawer categories={categoriesWithCount} />
      {/* Mobile Event Filter Sheet */}
      <MobileEventFilterSheet regions={regions || []} />
    </div>
  )
}
