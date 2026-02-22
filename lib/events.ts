import type { SupabaseClient } from '@supabase/supabase-js'
import type { UnifiedEvent } from '@/types/unified-events'

export interface EventFilters {
  time?: string
  category?: string
  region?: string
  source?: string
  q?: string
  sort?: string
}

export interface MappedEvent {
  id: string
  title: string
  slug: string
  description: string | null
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  is_featured: boolean
  view_count: number
  interest_count: number
  user_id: string | null
  created_at: string
  source_type: 'community' | 'business'
  business_slug: string | null
  event_categories: { name: string; icon: string } | null
  businesses: { name: string; slug: string } | null
  profiles: { name: string | null } | null
  category_id: string | null
  region_id: string | null
  business_id: string | null
  business_name: string | null
  event_type_name: string | null
  event_type_icon: string | null
  category_name: string | null
  category_icon: string | null
}

/**
 * Apply standard event filters to a Supabase query on the all_events view.
 * Works for both data queries and count queries.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyEventFilters(query: any, filters: EventFilters, now: string) {
  // Time filter
  switch (filters.time) {
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
    default:
      // Default to upcoming
      query = query.gt('start_date', now)
      break
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category_id', filters.category)
  }

  // Region filter
  if (filters.region && filters.region !== 'all') {
    query = query.eq('region_id', filters.region)
  }

  // Source filter (promotions = business events only)
  if (filters.source === 'promotions') {
    query = query.eq('source_type', 'business')
  }

  // Search filter
  if (filters.q && filters.q.trim()) {
    const safeQ = filters.q.replace(/[%_(),.*]/g, ' ').trim()
    if (safeQ) {
      query = query.or(`title.plfts.${safeQ},description.ilike.%${safeQ}%,location.ilike.%${safeQ}%`)
    }
  }

  return query
}

/**
 * Apply standard event sorting to a Supabase query.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyEventSort(query: any, sort?: string) {
  switch (sort) {
    case 'date':
      query = query.order('start_date', { ascending: true })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'featured':
    default:
      query = query.order('is_featured', { ascending: false })
      query = query.order('start_date', { ascending: true })
      break
  }
  return query
}

/**
 * Map UnifiedEvent rows from all_events view to the shape expected by EventCard/EventPageClient.
 */
export function mapUnifiedEvents(rawEvents: UnifiedEvent[]): MappedEvent[] {
  return rawEvents.map(event => ({
    ...event,
    event_categories: event.category_name ? {
      name: event.category_name,
      icon: event.category_icon || ''
    } : (event.event_type_name ? {
      name: event.event_type_name,
      icon: event.event_type_icon || ''
    } : null),
    businesses: event.business_name ? {
      name: event.business_name,
      slug: event.business_slug || ''
    } : null,
    profiles: null as { name: string | null } | null,
    source_type: event.source_type,
    business_slug: event.business_slug,
  }))
}

/**
 * Fetch paginated events with filters from the all_events unified view.
 */
export async function fetchFilteredEvents(
  supabase: SupabaseClient,
  filters: EventFilters,
  page: number = 1,
  itemsPerPage: number = 24
) {
  const now = new Date().toISOString()

  // Build data query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('all_events').select('*')
  query = applyEventFilters(query, filters, now)
  query = applyEventSort(query, filters.sort)

  // Build count query with same filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let countQuery = (supabase as any).from('all_events').select('*', { count: 'exact', head: true })
  countQuery = applyEventFilters(countQuery, filters, now)

  // Execute count query
  const { count: totalCount } = await countQuery

  // Apply pagination
  const offset = (page - 1) * itemsPerPage
  query = query.range(offset, offset + itemsPerPage - 1)

  const { data: rawEvents, error } = await query

  if (error) {
    console.error('Events query error:', error)
  }

  const events = mapUnifiedEvents((rawEvents || []) as UnifiedEvent[])
  const totalEvents = totalCount || 0
  const totalPages = Math.ceil(totalEvents / itemsPerPage)

  return {
    events,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalEvents,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}
