import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import { mapUnifiedEvents } from '@/lib/events'
import type { UnifiedEvent } from '@/types/unified-events'
import { EventsNetflixPage, type EventCategory } from '@/components/events'

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

// Revalidate every 5 minutes
export const revalidate = 300

interface EventCategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    time?: string
    q?: string
  }>
}

// ─── Page Component ─────────────────────────────────────────────────

export default async function EventCategoryPage({ params, searchParams }: EventCategoryPageProps) {
  const { slug } = await params
  const { time, q } = await searchParams
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Fetch the category
  const { data: category } = await supabase
    .from('event_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  // Build query for events in this category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('all_events')
    .select('*')
    .eq('category_id', category.id)

  // Apply search filter
  if (q && q.trim()) {
    const safeQ = q.replace(/[%_(),.*]/g, ' ').trim()
    if (safeQ) {
      query = query.or(`title.plfts.${safeQ},description.ilike.%${safeQ}%,location.ilike.%${safeQ}%`)
    }
  }

  // Only show upcoming + ongoing events
  query = query.or(`start_date.gt.${now},and(start_date.lte.${now},end_date.gte.${now})`)

  // Parallelize: events + all categories for nav
  const [eventsResult, allCategoriesResult] = await Promise.all([
    query.order('start_date', { ascending: true }).limit(100),
    supabase.from('event_categories').select('name, slug, icon').order('name'),
  ])

  const eventsData = eventsResult.data
  const allEvents = mapUnifiedEvents((eventsData || []) as UnifiedEvent[])
  const allCategories = (allCategoriesResult.data || []) as EventCategory[]

  return (
    <EventsNetflixPage
      heroEvents={[]}
      eventRows={[]}
      listEvents={allEvents}
      categories={allCategories}
      searchQuery={q}
      basePath={`/events/category/${slug}`}
      pageTitle={category.name}
      activeCategory={slug}
    />
  )
}
