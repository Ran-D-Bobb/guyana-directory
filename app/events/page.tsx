import { createClient } from '@/lib/supabase/server'
import { EventCategorySidebar } from '@/components/EventCategorySidebar'
import { EventFilterPanel } from '@/components/EventFilterPanel'
import { EventPageClient } from '@/components/EventPageClient'
import { MobileEventCategoryDrawer } from '@/components/MobileEventCategoryDrawer'
import { Calendar } from 'lucide-react'

interface EventsPageProps {
  searchParams: Promise<{
    category?: string
    time?: string
    sort?: string
    q?: string
    region?: string
    view?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category, time = 'upcoming', sort = 'featured', q, region, view = 'grid' } = await searchParams
  const supabase = await createClient()

  // Fetch all event categories with event counts for sidebar and drawer
  const { data: eventCategories } = await supabase
    .from('event_categories')
    .select('*, events:events(count)')
    .order('name')

  // Transform categories to include event count
  const categoriesWithCount = eventCategories?.map((cat) => ({
    ...cat,
    event_count: Array.isArray(cat.events) ? cat.events.length : 0,
  })) || []

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

  // Apply time filter
  const now = new Date().toISOString()
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

  const { data: events, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Events query error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Event Category Sidebar */}
      <EventCategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Event Filter Panel - Sticky, Collapsible */}
        <EventFilterPanel
          regions={regions || []}
          eventCount={events?.length || 0}
          categoryName="Events"
        />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              Events in Guyana
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Discover local events, workshops, festivals, and community gatherings across Guyana
            </p>
          </div>

          {/* Events Grid/Calendar with View Controls */}
          {events && events.length > 0 ? (
            <EventPageClient events={events} searchParams={{ category, time, sort, q, region, view }} />
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                <Calendar className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No events found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Try adjusting your filters or check back later for new events
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Event Category Drawer */}
      <MobileEventCategoryDrawer categories={categoriesWithCount} />
    </div>
  )
}
