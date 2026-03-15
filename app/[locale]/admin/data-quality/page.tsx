import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import {
  getDataQualityStats,
  getIncompleteListings,
  getStaleListings,
  getPotentialDuplicates,
  getLowEngagementListings,
  type IncompleteBusiness,
  type StaleBusiness,
  type DuplicateGroup,
  type LowEngagementBusiness,
} from '@/lib/data-quality'
import { DataQualityTabs } from './DataQualityTabs'

export const dynamic = 'force-dynamic'

export default async function AdminDataQualityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
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
  const activeTab = params.tab || 'incomplete'

  // Get stats and data based on active tab
  const stats = await getDataQualityStats()

  let incompleteListings: IncompleteBusiness[] = []
  let staleListings: StaleBusiness[] = []
  let duplicateGroups: DuplicateGroup[] = []
  let lowEngagementListings: LowEngagementBusiness[] = []

  // Load data for active tab only (for performance)
  switch (activeTab) {
    case 'incomplete':
      incompleteListings = await getIncompleteListings()
      break
    case 'stale':
      staleListings = await getStaleListings()
      break
    case 'duplicates':
      duplicateGroups = await getPotentialDuplicates()
      break
    case 'low-engagement':
      lowEngagementListings = await getLowEngagementListings()
      break
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Data Quality"
        subtitle="Identify and fix data issues across business listings"
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Incomplete Listings"
            value={stats.incompleteCount}
            icon="FileWarning"
            color="orange"
            size="sm"
          />
          <AdminStatCard
            label="Stale (6+ months)"
            value={stats.staleWarningCount + stats.staleCriticalCount}
            icon="Clock"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Potential Duplicates"
            value={stats.potentialDuplicatesCount}
            icon="Copy"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Low Engagement"
            value={stats.lowEngagementCount}
            icon="EyeOff"
            color="red"
            size="sm"
          />
        </div>

        {/* Critical Alert */}
        {stats.staleCriticalCount > 0 && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Critical: Very Stale Listings</h3>
              <p className="text-sm text-red-700">
                {stats.staleCriticalCount} listing{stats.staleCriticalCount !== 1 ? 's' : ''} not updated in over 12 months
              </p>
            </div>
            <Link
              href="/admin/data-quality?tab=stale"
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Review Now
            </Link>
          </div>
        )}

        {/* Tabs and Content */}
        <DataQualityTabs
          activeTab={activeTab}
          stats={stats}
          incompleteListings={incompleteListings}
          staleListings={staleListings}
          duplicateGroups={duplicateGroups}
          lowEngagementListings={lowEngagementListings}
        />
      </div>
    </div>
  )
}
