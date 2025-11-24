import { createClient } from '@/lib/supabase/server'

/**
 * Get category counts for businesses
 * @param supabase - Supabase client instance
 * @returns Categories with accurate business counts
 */
export async function getBusinessCategoriesWithCounts() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch business counts per category
  const { data: businessCounts } = await supabase
    .from('businesses')
    .select('category_id')

  // Count businesses per category
  const countMap = new Map<string, number>()
  businessCounts?.forEach(business => {
    if (business.category_id) {
      const count = countMap.get(business.category_id) || 0
      countMap.set(business.category_id, count + 1)
    }
  })

  // Transform categories to include business count
  return categories?.map((cat) => ({
    ...cat,
    business_count: countMap.get(cat.id) || 0,
  })) || []
}

/**
 * Get category counts for events with optional time filter
 * @param supabase - Supabase client instance
 * @param timeFilter - Filter events by time (upcoming, ongoing, past, all)
 * @returns Categories with accurate event counts
 */
export async function getEventCategoriesWithCounts(timeFilter: 'upcoming' | 'ongoing' | 'past' | 'all' = 'upcoming') {
  const supabase = await createClient()

  // Fetch all event categories
  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  // Build query to count events per category with time filter
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
      // No filter
      break
  }

  const { data: eventCounts } = await countQuery

  // Count events per category
  const countMap = new Map<string, number>()
  eventCounts?.forEach(event => {
    if (event.category_id) {
      const count = countMap.get(event.category_id) || 0
      countMap.set(event.category_id, count + 1)
    }
  })

  // Transform categories to include event count
  return categories?.map((cat) => ({
    ...cat,
    event_count: countMap.get(cat.id) || 0,
  })) || []
}

/**
 * Get category counts for tourism experiences (only approved)
 * @param supabase - Supabase client instance
 * @returns Categories with accurate experience counts
 */
export async function getTourismCategoriesWithCounts() {
  const supabase = await createClient()

  // Fetch all tourism categories
  const { data: categories } = await supabase
    .from('tourism_categories')
    .select('*')
    .order('display_order')

  // Fetch approved experience counts per category
  const { data: experienceCounts } = await supabase
    .from('tourism_experiences')
    .select('tourism_category_id')
    .eq('is_approved', true)

  // Count experiences per category
  const countMap = new Map<string, number>()
  experienceCounts?.forEach(exp => {
    if (exp.tourism_category_id) {
      const count = countMap.get(exp.tourism_category_id) || 0
      countMap.set(exp.tourism_category_id, count + 1)
    }
  })

  // Transform categories to include experience count
  return categories?.map((cat) => ({
    ...cat,
    experience_count: countMap.get(cat.id) || 0,
  })) || []
}

/**
 * Get category counts for rentals (only approved)
 * @param supabase - Supabase client instance
 * @returns Categories with accurate rental counts
 */
export async function getRentalCategoriesWithCounts() {
  const supabase = await createClient()

  // Fetch all rental categories
  const { data: categories } = await supabase
    .from('rental_categories')
    .select('*')
    .order('name')

  // Fetch approved rental counts per category
  const { data: rentalCounts } = await supabase
    .from('rentals')
    .select('category_id')
    .eq('is_approved', true)

  // Count rentals per category
  const countMap = new Map<string, number>()
  rentalCounts?.forEach(rental => {
    const count = countMap.get(rental.category_id) || 0
    countMap.set(rental.category_id, count + 1)
  })

  // Transform categories to include rental count
  return categories?.map((cat) => ({
    ...cat,
    count: countMap.get(cat.id) || 0,
  })) || []
}
