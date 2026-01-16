import { createStaticClient } from '@/lib/supabase/static'
import { unstable_cache } from 'next/cache'

/**
 * Get category counts for businesses using efficient SQL aggregation
 * Cached for 5 minutes with tag-based invalidation
 * @returns Categories with accurate business counts
 */
export const getBusinessCategoriesWithCounts = unstable_cache(
  async () => {
    const supabase = createStaticClient()

    // Single query with count aggregation via foreign key relationship
    const { data: categories } = await supabase
      .from('categories')
      .select(`
        *,
        businesses(count)
      `)
      .order('name')

    // Transform to expected format
    return categories?.map((cat) => ({
      ...cat,
      business_count: cat.businesses?.[0]?.count || 0,
    })) || []
  },
  ['business-categories-counts'],
  {
    revalidate: 300, // 5 minutes
    tags: ['business-categories', 'categories'],
  }
)

/**
 * Get category counts for events with optional time filter
 * Uses efficient SQL aggregation
 * Cached for 5 minutes with tag-based invalidation
 * @param timeFilter - Filter events by time (upcoming, ongoing, past, all)
 * @returns Categories with accurate event counts
 */
async function _getEventCategoriesWithCounts(timeFilter: 'upcoming' | 'ongoing' | 'past' | 'all' = 'upcoming') {
  const supabase = createStaticClient()

  // For time-filtered counts, we need a different approach since we can't filter the count subquery directly
  // Fetch categories first
  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  if (!categories) return []

  // Build query with time filter and get grouped counts
  const now = new Date().toISOString()
  let countQuery = supabase
    .from('events')
    .select('category_id')

  // Apply time filter
  switch (timeFilter) {
    case 'upcoming':
      countQuery = countQuery.gt('start_date', now)
      break
    case 'ongoing':
      countQuery = countQuery.lte('start_date', now).gte('end_date', now)
      break
    case 'past':
      countQuery = countQuery.lt('end_date', now)
      break
    case 'all':
      // No filter - use efficient relationship count
      const { data: allCategories } = await supabase
        .from('event_categories')
        .select(`
          *,
          events(count)
        `)
        .order('name')

      return allCategories?.map((cat) => ({
        ...cat,
        event_count: cat.events?.[0]?.count || 0,
      })) || []
  }

  // For filtered counts, we still need to fetch but with limits
  // Get just the category_ids from filtered events (more efficient than full records)
  const { data: eventCounts } = await countQuery

  // Count events per category in JS (only for filtered queries)
  const countMap = new Map<string, number>()
  eventCounts?.forEach(event => {
    if (event.category_id) {
      countMap.set(event.category_id, (countMap.get(event.category_id) || 0) + 1)
    }
  })

  return categories.map((cat) => ({
    ...cat,
    event_count: countMap.get(cat.id) || 0,
  }))
}

// Create cached versions for each time filter
export const getEventCategoriesWithCounts = (timeFilter: 'upcoming' | 'ongoing' | 'past' | 'all' = 'upcoming') => {
  return unstable_cache(
    () => _getEventCategoriesWithCounts(timeFilter),
    [`event-categories-counts-${timeFilter}`],
    {
      revalidate: 300, // 5 minutes
      tags: ['event-categories', 'categories', `events-${timeFilter}`],
    }
  )()
}

/**
 * Get category counts for tourism experiences (only approved)
 * Uses efficient SQL aggregation
 * Cached for 5 minutes with tag-based invalidation
 * @returns Categories with accurate experience counts
 */
export const getTourismCategoriesWithCounts = unstable_cache(
  async () => {
    const supabase = createStaticClient()

    // Single query with count aggregation
    // Note: The count will include all experiences - we filter for approved below
    const { data: categories } = await supabase
      .from('tourism_categories')
      .select('*')
      .order('display_order')

    if (!categories) return []

    // For approved-only counts, get aggregated counts with filter
    const { data: experienceCounts } = await supabase
      .from('tourism_experiences')
      .select('tourism_category_id')
      .eq('is_approved', true)

    const countMap = new Map<string, number>()
    experienceCounts?.forEach(exp => {
      if (exp.tourism_category_id) {
        countMap.set(exp.tourism_category_id, (countMap.get(exp.tourism_category_id) || 0) + 1)
      }
    })

    return categories.map((cat) => ({
      ...cat,
      experience_count: countMap.get(cat.id) || 0,
    }))
  },
  ['tourism-categories-counts'],
  {
    revalidate: 300, // 5 minutes
    tags: ['tourism-categories', 'categories'],
  }
)

/**
 * Get category counts for rentals (only approved)
 * Uses efficient SQL aggregation
 * Cached for 5 minutes with tag-based invalidation
 * @returns Categories with accurate rental counts
 */
export const getRentalCategoriesWithCounts = unstable_cache(
  async () => {
    const supabase = createStaticClient()

    const { data: categories } = await supabase
      .from('rental_categories')
      .select('*')
      .order('name')

    if (!categories) return []

    // For approved-only counts
    const { data: rentalCounts } = await supabase
      .from('rentals')
      .select('category_id')
      .eq('is_approved', true)

    const countMap = new Map<string, number>()
    rentalCounts?.forEach(rental => {
      if (rental.category_id) {
        countMap.set(rental.category_id, (countMap.get(rental.category_id) || 0) + 1)
      }
    })

    return categories.map((cat) => ({
      ...cat,
      count: countMap.get(cat.id) || 0,
    }))
  },
  ['rental-categories-counts'],
  {
    revalidate: 300, // 5 minutes
    tags: ['rental-categories', 'categories'],
  }
)
