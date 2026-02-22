import { createClient } from '@/lib/supabase/server'

// Types for analytics data
export type TimePeriod = '7d' | '30d' | '90d' | 'custom'

export interface DateRange {
  start: Date
  end: Date
}

export interface MetricWithChange {
  value: number
  previousValue: number
  change: number // percentage change
  changeType: 'increase' | 'decrease' | 'neutral'
}

export interface OverviewMetrics {
  totalViews: MetricWithChange
  newBusinesses: MetricWithChange
  newUsers: MetricWithChange
  newReviews: MetricWithChange
  contactActions: MetricWithChange
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export interface ViewsOverTime {
  data: TimeSeriesDataPoint[]
  total: number
}

export interface RegistrationsOverTime {
  data: TimeSeriesDataPoint[]
  total: number
}

export interface ReviewsByRating {
  rating: number
  count: number
}

export interface CategoryPerformance {
  id: string
  name: string
  slug: string
  businessCount: number
  totalViews: number
  totalReviews: number
  avgRating: number | null
}

export interface RegionPerformance {
  id: string
  name: string
  slug: string
  type: string
  businessCount: number
  totalViews: number
  totalReviews: number
}

export interface ContactActionStats {
  whatsappClicks: number
  totalInquiries: number
}

// Helper to get date range from period
export function getDateRangeFromPeriod(period: TimePeriod, customRange?: DateRange): DateRange {
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  let start: Date

  switch (period) {
    case '7d':
      start = new Date()
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start = new Date()
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start = new Date()
      start.setDate(start.getDate() - 90)
      break
    case 'custom':
      if (customRange) {
        return customRange
      }
      start = new Date()
      start.setDate(start.getDate() - 30)
      break
    default:
      start = new Date()
      start.setDate(start.getDate() - 30)
  }

  start.setHours(0, 0, 0, 0)
  return { start, end }
}

// Helper to get previous period for comparison
function getPreviousPeriod(range: DateRange): DateRange {
  const duration = range.end.getTime() - range.start.getTime()
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.start.getTime() - 1)
  }
}

// Helper to calculate percentage change
function calculateChange(current: number, previous: number): MetricWithChange {
  const change = previous === 0
    ? (current > 0 ? 100 : 0)
    : ((current - previous) / previous) * 100

  return {
    value: current,
    previousValue: previous,
    change: Math.round(change * 10) / 10,
    changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'
  }
}

/**
 * Get overview metrics with comparison to previous period
 */
export async function getOverviewMetrics(period: TimePeriod, customRange?: DateRange): Promise<OverviewMetrics> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period, customRange)
  const prevRange = getPreviousPeriod(range)

  // Current period views (sum of view_count from businesses, events, rentals, tourism)
  const { data: businessViews } = await supabase
    .from('businesses')
    .select('view_count')
    .gte('updated_at', range.start.toISOString())
    .lte('updated_at', range.end.toISOString())

  const currentViews = businessViews?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0

  // Previous period views
  const { data: prevBusinessViews } = await supabase
    .from('businesses')
    .select('view_count')
    .gte('updated_at', prevRange.start.toISOString())
    .lte('updated_at', prevRange.end.toISOString())

  const previousViews = prevBusinessViews?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0

  // New businesses in current period
  const { count: currentBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())

  // New businesses in previous period
  const { count: previousBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevRange.start.toISOString())
    .lte('created_at', prevRange.end.toISOString())

  // New users in current period
  const { count: currentUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())

  // New users in previous period
  const { count: previousUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevRange.start.toISOString())
    .lte('created_at', prevRange.end.toISOString())

  // New reviews in current period
  const { count: currentReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())

  // New reviews in previous period
  const { count: previousReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevRange.start.toISOString())
    .lte('created_at', prevRange.end.toISOString())

  // WhatsApp clicks in current period
  const { count: currentWhatsapp } = await supabase
    .from('whatsapp_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', range.start.toISOString())
    .lte('clicked_at', range.end.toISOString())

  // WhatsApp clicks in previous period
  const { count: previousWhatsapp } = await supabase
    .from('whatsapp_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', prevRange.start.toISOString())
    .lte('clicked_at', prevRange.end.toISOString())

  return {
    totalViews: calculateChange(currentViews, previousViews),
    newBusinesses: calculateChange(currentBusinesses || 0, previousBusinesses || 0),
    newUsers: calculateChange(currentUsers || 0, previousUsers || 0),
    newReviews: calculateChange(currentReviews || 0, previousReviews || 0),
    contactActions: calculateChange(currentWhatsapp || 0, previousWhatsapp || 0)
  }
}

/**
 * Get views aggregated by day for chart
 */
export async function getViewsOverTime(period: TimePeriod, customRange?: DateRange): Promise<ViewsOverTime> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period, customRange)

  // Get all businesses with their view counts and updated dates
  const { data: businesses } = await supabase
    .from('businesses')
    .select('view_count, created_at, updated_at')
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const viewsByDate = new Map<string, number>()

  // Initialize all dates in range
  const current = new Date(range.start)
  while (current <= range.end) {
    const dateKey = current.toISOString().split('T')[0]
    viewsByDate.set(dateKey, 0)
    current.setDate(current.getDate() + 1)
  }

  // Aggregate views by creation date
  businesses?.forEach(b => {
    if (b.created_at) {
      const dateKey = b.created_at.split('T')[0]
      const currentCount = viewsByDate.get(dateKey) || 0
      viewsByDate.set(dateKey, currentCount + (b.view_count || 0))
    }
  })

  const data: TimeSeriesDataPoint[] = Array.from(viewsByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return { data, total }
}

/**
 * Get user registrations over time
 */
export async function getRegistrationsOverTime(period: TimePeriod, customRange?: DateRange): Promise<RegistrationsOverTime> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period, customRange)

  const { data: users } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const regsByDate = new Map<string, number>()

  // Initialize all dates in range
  const current = new Date(range.start)
  while (current <= range.end) {
    const dateKey = current.toISOString().split('T')[0]
    regsByDate.set(dateKey, 0)
    current.setDate(current.getDate() + 1)
  }

  users?.forEach(u => {
    if (u.created_at) {
      const dateKey = u.created_at.split('T')[0]
      const currentCount = regsByDate.get(dateKey) || 0
      regsByDate.set(dateKey, currentCount + 1)
    }
  })

  const data: TimeSeriesDataPoint[] = Array.from(regsByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return { data, total }
}

/**
 * Get review distribution by rating
 */
export async function getReviewsByRating(period: TimePeriod, customRange?: DateRange): Promise<ReviewsByRating[]> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period, customRange)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString())

  // Count by rating
  const ratingCounts = new Map<number, number>()
  for (let i = 1; i <= 5; i++) {
    ratingCounts.set(i, 0)
  }

  reviews?.forEach(r => {
    const count = ratingCounts.get(r.rating) || 0
    ratingCounts.set(r.rating, count + 1)
  })

  return Array.from(ratingCounts.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating)
}

/**
 * Get top performing categories (single SQL query via DB function)
 */
export async function getCategoryPerformance(limit: number = 10): Promise<CategoryPerformance[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_category_performance', { p_limit: limit })

  if (error || !data) {
    console.error('Error fetching category performance:', error)
    return []
  }

  return (data as { category_id: string; category_name: string; category_slug: string; business_count: number; total_views: number; total_reviews: number; avg_rating: number | null }[]).map(row => ({
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
    businessCount: Number(row.business_count),
    totalViews: Number(row.total_views),
    totalReviews: Number(row.total_reviews),
    avgRating: row.avg_rating ? Math.round(Number(row.avg_rating) * 10) / 10 : null,
  }))
}

/**
 * Get top performing regions (single SQL query via DB function)
 */
export async function getRegionPerformance(limit: number = 10): Promise<RegionPerformance[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_region_performance', { p_limit: limit })

  if (error || !data) {
    console.error('Error fetching region performance:', error)
    return []
  }

  return (data as { region_id: string; region_name: string; region_slug: string; region_type: string; business_count: number; total_views: number; total_reviews: number }[]).map(row => ({
    id: row.region_id,
    name: row.region_name,
    slug: row.region_slug,
    type: row.region_type,
    businessCount: Number(row.business_count),
    totalViews: Number(row.total_views),
    totalReviews: Number(row.total_reviews),
  }))
}

/**
 * Get contact action statistics
 */
export async function getContactActionStats(period: TimePeriod, customRange?: DateRange): Promise<ContactActionStats> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period, customRange)

  // WhatsApp clicks for businesses
  const { count: businessWhatsapp } = await supabase
    .from('whatsapp_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', range.start.toISOString())
    .lte('clicked_at', range.end.toISOString())

  // Tourism inquiry clicks
  const { count: tourismInquiries } = await supabase
    .from('tourism_inquiry_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', range.start.toISOString())
    .lte('clicked_at', range.end.toISOString())

  // Rental inquiry clicks
  const { count: rentalInquiries } = await supabase
    .from('rental_inquiry_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('clicked_at', range.start.toISOString())
    .lte('clicked_at', range.end.toISOString())

  return {
    whatsappClicks: businessWhatsapp || 0,
    totalInquiries: (tourismInquiries || 0) + (rentalInquiries || 0)
  }
}

/**
 * Export analytics data as CSV
 */
export async function exportAnalyticsCSV(period: TimePeriod, customRange?: DateRange): Promise<string> {
  const [overview, views, registrations, reviews, categories, regions, contacts] = await Promise.all([
    getOverviewMetrics(period, customRange),
    getViewsOverTime(period, customRange),
    getRegistrationsOverTime(period, customRange),
    getReviewsByRating(period, customRange),
    getCategoryPerformance(),
    getRegionPerformance(),
    getContactActionStats(period, customRange)
  ])

  const range = getDateRangeFromPeriod(period, customRange)

  let csv = `Analytics Report\n`
  csv += `Period: ${range.start.toISOString().split('T')[0]} to ${range.end.toISOString().split('T')[0]}\n\n`

  // Overview metrics
  csv += `Overview Metrics\n`
  csv += `Metric,Current Value,Previous Value,Change %\n`
  csv += `Total Views,${overview.totalViews.value},${overview.totalViews.previousValue},${overview.totalViews.change}%\n`
  csv += `New Businesses,${overview.newBusinesses.value},${overview.newBusinesses.previousValue},${overview.newBusinesses.change}%\n`
  csv += `New Users,${overview.newUsers.value},${overview.newUsers.previousValue},${overview.newUsers.change}%\n`
  csv += `New Reviews,${overview.newReviews.value},${overview.newReviews.previousValue},${overview.newReviews.change}%\n`
  csv += `Contact Actions,${overview.contactActions.value},${overview.contactActions.previousValue},${overview.contactActions.change}%\n\n`

  // Views over time
  csv += `Daily Views\n`
  csv += `Date,Views\n`
  views.data.forEach(d => {
    csv += `${d.date},${d.value}\n`
  })
  csv += `\n`

  // Registrations over time
  csv += `Daily Registrations\n`
  csv += `Date,Registrations\n`
  registrations.data.forEach(d => {
    csv += `${d.date},${d.value}\n`
  })
  csv += `\n`

  // Reviews by rating
  csv += `Reviews by Rating\n`
  csv += `Rating,Count\n`
  reviews.forEach(r => {
    csv += `${r.rating} Stars,${r.count}\n`
  })
  csv += `\n`

  // Category performance
  csv += `Top Categories\n`
  csv += `Category,Businesses,Total Views,Total Reviews,Avg Rating\n`
  categories.forEach(c => {
    csv += `${c.name},${c.businessCount},${c.totalViews},${c.totalReviews},${c.avgRating || 'N/A'}\n`
  })
  csv += `\n`

  // Region performance
  csv += `Top Regions\n`
  csv += `Region,Type,Businesses,Total Views,Total Reviews\n`
  regions.forEach(r => {
    csv += `${r.name},${r.type},${r.businessCount},${r.totalViews},${r.totalReviews}\n`
  })
  csv += `\n`

  // Contact stats
  csv += `Contact Actions\n`
  csv += `Type,Count\n`
  csv += `WhatsApp Clicks,${contacts.whatsappClicks}\n`
  csv += `Inquiries (Tourism + Rentals),${contacts.totalInquiries}\n`

  return csv
}

/**
 * Get all analytics data at once
 */
export async function getAllAnalytics(period: TimePeriod, customRange?: DateRange) {
  const [overview, views, registrations, reviews, categories, regions, contacts] = await Promise.all([
    getOverviewMetrics(period, customRange),
    getViewsOverTime(period, customRange),
    getRegistrationsOverTime(period, customRange),
    getReviewsByRating(period, customRange),
    getCategoryPerformance(),
    getRegionPerformance(),
    getContactActionStats(period, customRange)
  ])

  return {
    overview,
    views,
    registrations,
    reviews,
    categories,
    regions,
    contacts
  }
}
