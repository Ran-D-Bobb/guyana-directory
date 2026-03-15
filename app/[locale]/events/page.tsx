import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { createStaticClient } from '@/lib/supabase/static'
import { mapUnifiedEvents } from '@/lib/events'
import type { UnifiedEvent } from '@/types/unified-events'
import type { MappedEvent } from '@/lib/events'
import { EventsNetflixPage, type EventRowData, type EventCategory } from '@/components/events'
import { resolveRegionFilter } from '@/lib/regions'
import { RegionRedirect } from '@/components/RegionRedirect'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('events')
  return {
    title: t('pageTitle'),
    description: 'Discover upcoming events, festivals, workshops, and community gatherings across Guyana. From Mashramani to local concerts.',
    alternates: { canonical: '/events' },
    openGraph: {
      title: 'Events & Festivals in Guyana | Waypoint',
      description: 'Discover upcoming events, festivals, workshops, and community gatherings across Guyana.',
    },
  }
}

// Revalidate every 5 minutes
export const revalidate = 300

interface EventsPageProps {
  searchParams: Promise<{
    time?: string
    q?: string
    region?: string
  }>
}

// ─── Row Building Helpers ───────────────────────────────────────────

/** Get the start and end of the current weekend (Fri 00:00 to Sun 23:59) */
function getWeekendRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

  const friday = new Date(now)
  const daysUntilFriday = day <= 5 ? 5 - day : -1 // If it's Sat(6), Friday was yesterday
  friday.setDate(now.getDate() + daysUntilFriday)
  friday.setHours(0, 0, 0, 0)

  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)
  sunday.setHours(23, 59, 59, 999)

  return { start: friday, end: sunday }
}

/** Get end of current week (Sunday 23:59) */
function getEndOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + (7 - day))
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

/** Get end of current month */
function getEndOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

/** Category icon mapping — maps event_categories icon names to our icon keys */
const CATEGORY_ICON_MAP: Record<string, { icon: string; color: string }> = {
  Concert: { icon: 'music', color: 'text-purple-400' },
  Music: { icon: 'music', color: 'text-purple-400' },
  Workshop: { icon: 'book_open', color: 'text-blue-400' },
  Community: { icon: 'users', color: 'text-emerald-400' },
  Festival: { icon: 'sparkles', color: 'text-amber-400' },
  Sports: { icon: 'dumbbell', color: 'text-green-400' },
  'Business Networking': { icon: 'briefcase', color: 'text-sky-400' },
  'Food & Drink': { icon: 'utensils', color: 'text-orange-400' },
  'Art & Culture': { icon: 'palette', color: 'text-rose-400' },
  Charity: { icon: 'heart', color: 'text-pink-400' },
  Other: { icon: 'calendar', color: 'text-gray-400' },
}

interface EventRowLabels {
  thisWeek: string
  thisMonth: string
  thisWeekend: string
  trending: string
  promotions: string
}

function buildEventRows(
  allEvents: MappedEvent[],
  categories: Array<{ id: string; name: string; icon: string | null }>,
  labels: EventRowLabels,
  timeFilter?: string,
): EventRowData[] {
  const rows: EventRowData[] = []

  // If a time filter is active, just show all events in a single "Results" row
  if (timeFilter === 'this_week' || timeFilter === 'this_month') {
    const cutoff = timeFilter === 'this_week' ? getEndOfWeek() : getEndOfMonth()
    const filtered = allEvents.filter(e => {
      const start = new Date(e.start_date)
      return start <= cutoff
    })
    if (filtered.length > 0) {
      rows.push({
        title: timeFilter === 'this_week' ? labels.thisWeek : labels.thisMonth,
        icon: 'calendar',
        iconColor: 'text-emerald-400',
        events: filtered,
      })
    }
    return rows
  }

  // ── Row 1: Happening This Weekend ──
  const weekend = getWeekendRange()
  const weekendEvents = allEvents.filter(e => {
    const start = new Date(e.start_date)
    const end = new Date(e.end_date)
    // Event overlaps with the weekend
    return start <= weekend.end && end >= weekend.start
  })
  if (weekendEvents.length > 0) {
    rows.push({
      title: labels.thisWeekend,
      icon: 'flame',
      iconColor: 'text-orange-400',
      events: weekendEvents.slice(0, 15),
    })
  }

  // ── Row 2: Trending (by views + interest) ──
  const trending = [...allEvents]
    .sort((a, b) => (b.view_count + b.interest_count) - (a.view_count + a.interest_count))
    .slice(0, 12)
  if (trending.length > 0) {
    rows.push({
      title: labels.trending,
      icon: 'trending_up',
      iconColor: 'text-emerald-400',
      events: trending,
    })
  }

  // ── Category Rows ──
  const usedEventIds = new Set<string>()
  // Don't deduplicate from weekend/trending — let events appear in multiple rows

  for (const cat of categories) {
    const catEvents = allEvents.filter(e => e.category_id === cat.id)
    if (catEvents.length === 0) continue

    const iconInfo = CATEGORY_ICON_MAP[cat.name] || { icon: 'sparkles', color: 'text-gray-400' }

    rows.push({
      title: cat.name,
      icon: iconInfo.icon,
      iconColor: iconInfo.color,
      events: catEvents.slice(0, 15),
    })

    catEvents.forEach(e => usedEventIds.add(e.id))
  }

  // ── Promotions Row ──
  const promotions = allEvents.filter(e => e.source_type === 'business')
  if (promotions.length > 0) {
    rows.push({
      title: labels.promotions,
      icon: 'tag',
      iconColor: 'text-fuchsia-400',
      events: promotions.slice(0, 15),
    })
  }

  return rows
}

// ─── Page Component ─────────────────────────────────────────────────

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { time, q, region } = await searchParams
  const t = await getTranslations('events')
  const supabase = createStaticClient()
  const now = new Date().toISOString()

  // Resolve region from URL param (RegionRedirect adds it client-side from cookie)
  const effectiveRegion = region || 'all'
  const regionFilterIds = await resolveRegionFilter(supabase, effectiveRegion)

  // Build the main query — fetch upcoming + ongoing events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('all_events')
    .select('*')

  // Apply search filter if present
  if (q && q.trim()) {
    const safeQ = q.replace(/[^a-zA-Z0-9\s\-']/g, ' ').trim()
    if (safeQ) {
      query = query.or(`title.plfts.${safeQ},description.ilike.%${safeQ}%,location.ilike.%${safeQ}%`)
    }
  }

  // Apply region filter
  if (regionFilterIds) {
    query = query.in('region_id', regionFilterIds)
  }

  // Only show upcoming + ongoing events (not past)
  query = query.or(`start_date.gt.${now},and(start_date.lte.${now},end_date.gte.${now})`)

  // Parallelize: events + categories + regions
  const [eventsResult, categoriesResult, regionsResult] = await Promise.all([
    query.order('start_date', { ascending: true }).limit(120),
    supabase.from('event_categories').select('id, name, slug, icon').order('name'),
    supabase.from('regions').select('id, name, slug').order('name'),
  ])

  const allEvents = mapUnifiedEvents((eventsResult.data || []) as UnifiedEvent[])
  const categories = categoriesResult.data || []
  const regions = regionsResult.data || []

  // Separate featured events for the hero
  const heroEvents = allEvents.filter(e => e.is_featured).slice(0, 5)

  // If no featured, use top 3 by interest/views as hero
  const finalHeroEvents = heroEvents.length > 0
    ? heroEvents
    : [...allEvents]
        .sort((a, b) => (b.interest_count + b.view_count) - (a.interest_count + a.view_count))
        .slice(0, 3)

  // Build category rows
  const eventRowLabels = {
    thisWeek: t('thisWeek'),
    thisMonth: t('thisMonth'),
    thisWeekend: t('thisWeekend'),
    trending: t('trending'),
    promotions: t('promotions'),
  }
  const eventRows = buildEventRows(allEvents, categories, eventRowLabels, time)

  return (
    <>
      <Suspense fallback={null}><RegionRedirect /></Suspense>
      <EventsNetflixPage
        heroEvents={finalHeroEvents}
        eventRows={eventRows}
        categories={categories as EventCategory[]}
        regions={regions}
        searchQuery={q}
        activeRegion={region}
      />
    </>
  )
}
