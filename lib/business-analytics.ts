import { createClient } from '@/lib/supabase/server'
import { getDateRangeFromPeriod, type TimePeriod, type TimeSeriesDataPoint } from '@/lib/analytics'

export interface BusinessOverviewMetrics {
  totalViews: number
  whatsappClicks: number
  avgRating: number
  totalReviews: number
}

export interface BusinessClicksOverTime {
  data: TimeSeriesDataPoint[]
  total: number
}

export interface BusinessReviewsByRating {
  rating: number
  count: number
}

export interface BusinessRecentReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name: string | null
}

export async function getBusinessOverview(businessId: string): Promise<BusinessOverviewMetrics> {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('view_count, whatsapp_clicks, rating, review_count')
    .eq('id', businessId)
    .single()

  return {
    totalViews: business?.view_count ?? 0,
    whatsappClicks: business?.whatsapp_clicks ?? 0,
    avgRating: business?.rating ?? 0,
    totalReviews: business?.review_count ?? 0,
  }
}

export async function getBusinessClicksOverTime(
  businessId: string,
  period: TimePeriod
): Promise<BusinessClicksOverTime> {
  const supabase = await createClient()
  const range = getDateRangeFromPeriod(period)

  const { data: clicks } = await supabase
    .from('whatsapp_clicks')
    .select('clicked_at')
    .eq('business_id', businessId)
    .gte('clicked_at', range.start.toISOString())
    .lte('clicked_at', range.end.toISOString())
    .order('clicked_at', { ascending: true })

  // Build date map with zeros for all days in range
  const clicksByDate = new Map<string, number>()
  const current = new Date(range.start)
  while (current <= range.end) {
    clicksByDate.set(current.toISOString().split('T')[0], 0)
    current.setDate(current.getDate() + 1)
  }

  clicks?.forEach((c) => {
    if (c.clicked_at) {
      const dateKey = new Date(c.clicked_at).toISOString().split('T')[0]
      clicksByDate.set(dateKey, (clicksByDate.get(dateKey) || 0) + 1)
    }
  })

  const data: TimeSeriesDataPoint[] = Array.from(clicksByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))

  return { data, total: data.reduce((sum, d) => sum + d.value, 0) }
}

export async function getBusinessReviewsByRating(businessId: string): Promise<BusinessReviewsByRating[]> {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('business_id', businessId)

  const ratingCounts = new Map<number, number>()
  for (let i = 1; i <= 5; i++) ratingCounts.set(i, 0)
  reviews?.forEach((r) => {
    ratingCounts.set(r.rating, (ratingCounts.get(r.rating) || 0) + 1)
  })

  return Array.from(ratingCounts.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating)
}

export async function getBusinessRecentReviews(
  businessId: string,
  limit: number = 5
): Promise<BusinessRecentReview[]> {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles(name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (reviews || []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at || '',
    reviewer_name: (r.profiles as unknown as { name: string } | null)?.name ?? null,
  }))
}

export async function getAllBusinessAnalytics(businessId: string, period: TimePeriod) {
  const [overview, clicksOverTime, reviewsByRating, recentReviews] = await Promise.all([
    getBusinessOverview(businessId),
    getBusinessClicksOverTime(businessId, period),
    getBusinessReviewsByRating(businessId),
    getBusinessRecentReviews(businessId),
  ])

  return { overview, clicksOverTime, reviewsByRating, recentReviews }
}
