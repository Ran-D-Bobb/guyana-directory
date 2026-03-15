import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { AdminHeader } from '@/components/admin/AdminHeader'
import {
  getAllAnalytics,
  type TimePeriod
} from '@/lib/analytics'
import { AnalyticsClient } from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/admin')
  }

  const params = await searchParams
  const period = (params.period || '30d') as TimePeriod

  // Validate period
  const validPeriods: TimePeriod[] = ['7d', '30d', '90d']
  const safePeriod = validPeriods.includes(period) ? period : '30d'

  // Fetch all analytics data
  const analytics = await getAllAnalytics(safePeriod)

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Analytics"
        subtitle="View platform metrics and insights"
      />

      <div className="px-4 lg:px-8 py-6">
        <AnalyticsClient
          initialPeriod={safePeriod}
          initialOverview={analytics.overview}
          initialViewsData={analytics.views.data}
          initialRegistrationsData={analytics.registrations.data}
          initialReviewsData={analytics.reviews}
          initialCategoriesData={analytics.categories}
          initialRegionsData={analytics.regions}
          initialContactsData={analytics.contacts}
        />
      </div>
    </div>
  )
}
