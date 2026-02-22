import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EventCategorySidebar } from '@/components/EventCategorySidebar'
import { EventPageClient } from '@/components/EventPageClient'
import { MobileEventCategoryFilterBar } from '@/components/MobileEventCategoryFilterBar'
import { EventFilterPanel } from '@/components/EventFilterPanel'
import { FeaturedEventsShowcase } from '@/components/FeaturedEventsShowcase'
import { getEventCategoriesWithCounts } from '@/lib/category-counts'
import { Calendar, Compass, Sparkles } from 'lucide-react'
import { TimelineBanner } from '@/components/TimelineBanner'
import Link from 'next/link'
import { fetchFilteredEvents } from '@/lib/events'

export const metadata: Metadata = {
  title: 'Events & Festivals in Guyana',
  description: 'Discover upcoming events, festivals, workshops, and community gatherings across Guyana. From Mashramani to local concerts.',
  alternates: { canonical: '/events' },
  openGraph: {
    title: 'Events & Festivals in Guyana | Waypoint',
    description: 'Discover upcoming events, festivals, workshops, and community gatherings across Guyana.',
  },
}

// Revalidate every 5 minutes
export const revalidate = 300

interface EventsPageProps {
  searchParams: Promise<{
    category?: string
    time?: string
    sort?: string
    q?: string
    region?: string
    page?: string
    source?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category, time = 'upcoming', sort = 'featured', q, region, page = '1', source } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

  // Fetch all event categories with counts based on time filter
  const validTimeFilter = ['upcoming', 'ongoing', 'past', 'all'].includes(time) ? time as 'upcoming' | 'ongoing' | 'past' | 'all' : 'upcoming'

  // Parallelize independent data fetches
  const [categoriesWithCount, regionsResult, timelineResult, eventsResult] = await Promise.all([
    getEventCategoriesWithCounts(validTimeFilter),
    supabase.from('regions').select('*').order('name'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('timeline_events')
      .select('title, month_short, gradient_colors, media_type')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(3),
    fetchFilteredEvents(supabase, { category, time, region, source, q, sort }, currentPage),
  ])

  const regions = regionsResult.data
  const timelineEvents = timelineResult.data
  const { events, pagination } = eventsResult

  // Check if we should show the featured showcase (only on default view with no search)
  const showFeaturedShowcase = !q && !category && !region && !source && time === 'upcoming' && sort === 'featured'
  const featuredEvents = events.filter(e => e.is_featured)
  const hasFeaturedEvents = featuredEvents.length > 0

  // Filter out featured events from main grid if showing showcase, but always keep non-featured
  const gridEvents = showFeaturedShowcase && hasFeaturedEvents
    ? events.filter(e => !e.is_featured)
    : events

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-white flex pb-0 lg:pb-0">
      {/* Desktop Event Category Sidebar */}
      <EventCategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Mobile Category & Filter Bar */}
        <MobileEventCategoryFilterBar
          categories={categoriesWithCount}
          regions={regions || []}
        />

        {/* Single main content area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8 animate-fade-up">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
              {source === 'promotions' ? 'Promotions' : 'Events in Guyana'}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              {source === 'promotions'
                ? 'Browse sales, discounts, and special offers from local businesses'
                : 'Discover local events, workshops, festivals, and community gatherings across Guyana'}
            </p>
          </div>

          {/* Annual Events Timeline Banner - above filters for better scanning flow */}
          <TimelineBanner previewEvents={timelineEvents || undefined} />

          {/* Desktop Filter Panel - Sticky */}
          <div className="hidden lg:block sticky top-0 z-30 mb-8 -mx-2 px-2 py-2 bg-gradient-to-b from-white via-white to-transparent">
            <EventFilterPanel
              regions={regions || []}
              currentFilters={{
                region,
                time,
                sort,
                source,
                q,
              }}
            />
          </div>

          {/* Featured Events Showcase - Only show on default view */}
          {showFeaturedShowcase && hasFeaturedEvents && (
            <FeaturedEventsShowcase events={events} />
          )}

          {/* Section divider when showing featured and there are non-featured events */}
          {showFeaturedShowcase && hasFeaturedEvents && gridEvents.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              <span className="text-sm font-medium text-gray-500 px-4">All Events</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
            </div>
          )}

          {/* Events Grid */}
          {events.length > 0 ? (
            <EventPageClient
              events={gridEvents}
              searchParams={{ category, time, sort, q, region }}
              pagination={pagination}
            />
          ) : (
            /* Empty State */
            <div className="text-center py-16 lg:py-24 animate-fade-in">
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
    </div>
  )
}
