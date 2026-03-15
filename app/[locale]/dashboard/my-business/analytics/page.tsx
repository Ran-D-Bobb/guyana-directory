import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireBusinessAccount } from '@/lib/account-type'
import { isAdmin } from '@/lib/admin'
import { getAllBusinessAnalytics } from '@/lib/business-analytics'
import { BusinessAnalyticsClient } from './BusinessAnalyticsClient'
import type { TimePeriod } from '@/lib/analytics'
import Link from 'next/link'
import { ChevronLeft, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const VALID_PERIODS: TimePeriod[] = ['7d', '30d', '90d']

interface PageProps {
  searchParams: Promise<{ period?: string; businessId?: string }>
}

export default async function BusinessAnalyticsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const userIsAdmin = isAdmin(user)

  // Only require business account for non-admins
  if (!userIsAdmin) {
    await requireBusinessAccount(user.id)
  }

  // Read search params
  const params = await searchParams

  // Admins can view any business's analytics via ?businessId=<uuid>
  let business: { id: string; name: string } | null = null

  if (userIsAdmin && params.businessId) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', params.businessId)
      .single()
    business = data
  } else {
    const { data } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()
    business = data
  }

  if (!business) {
    redirect('/dashboard/my-business')
  }

  // Validate the period from search params
  const rawPeriod = params.period
  const period: TimePeriod =
    rawPeriod && (VALID_PERIODS as string[]).includes(rawPeriod)
      ? (rawPeriod as TimePeriod)
      : '30d'

  // Fetch all analytics data
  const analytics = await getAllBusinessAnalytics(business.id, period)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/my-business"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to My Business
          </Link>

          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
              <BarChart3 size={22} />
            </div>
            <h1 className="text-2xl font-bold">Business Analytics</h1>
          </div>

          <p className="text-white/80 text-sm ml-[52px]">
            Track performance for {business.name}
          </p>
        </div>
      </div>

      {/* Analytics content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BusinessAnalyticsClient
          businessName={business.name}
          initialPeriod={period}
          initialAnalytics={analytics}
          isAdmin={userIsAdmin}
        />
      </main>
    </div>
  )
}
