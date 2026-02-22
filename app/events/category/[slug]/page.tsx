import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import { EventCategorySidebar } from '@/components/EventCategorySidebar'
import { EventPageClient } from '@/components/EventPageClient'
import { MobileEventCategoryFilterBar } from '@/components/MobileEventCategoryFilterBar'
import { EventFilterPanel } from '@/components/EventFilterPanel'
import { getEventCategoriesWithCounts } from '@/lib/category-counts'
import { fetchFilteredEvents } from '@/lib/events'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data: category } = await supabase.from('event_categories').select('name').eq('slug', slug).single()
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} Events in Guyana`,
    description: `Find ${category.name} events in Guyana. Browse upcoming festivals, workshops, concerts, and community gatherings.`,
    alternates: { canonical: `/events/category/${slug}` },
    openGraph: {
      title: `${category.name} Events in Guyana | Waypoint`,
      description: `Find ${category.name} events in Guyana. Browse upcoming festivals, workshops, and gatherings.`,
    },
  }
}

interface EventCategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    time?: string
    sort?: string
    q?: string
    region?: string
    source?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 24

export default async function EventCategoryPage({ params, searchParams }: EventCategoryPageProps) {
  const { slug } = await params
  const { time = 'upcoming', sort = 'featured', q, region, source, page = '1' } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(page) || 1)

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

  // Parallelize independent data fetches
  const [categoriesWithCount, regionsResult, eventsResult] = await Promise.all([
    getEventCategoriesWithCounts(validTimeFilter),
    supabase.from('regions').select('*').order('name'),
    fetchFilteredEvents(
      supabase,
      { category: category.id, time, region, source, q, sort },
      currentPage,
      ITEMS_PER_PAGE,
    ),
  ])

  const regions = regionsResult.data
  const { events, pagination } = eventsResult

  return (
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Event Category Sidebar */}
      <EventCategorySidebar categories={categoriesWithCount} currentCategorySlug={slug} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Mobile Header - Sticky */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b-0 px-4 py-4 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {category.name}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold text-gray-900">{pagination.totalItems}</span> events
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

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block sticky top-0 z-30 mb-8 -mx-2 px-2 py-2 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent">
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

          {/* Events Grid */}
          <EventPageClient
            events={events}
            searchParams={{ category: category.id, time, sort, q, region }}
            pagination={pagination}
          />
        </main>
      </div>
    </div>
  )
}
