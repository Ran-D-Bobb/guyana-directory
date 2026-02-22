'use client'

import { useRouter } from 'next/navigation'
import { BusinessAnalyticsCharts } from '@/components/business/BusinessAnalyticsCharts'
import { PremiumLockScreen } from '@/components/business/PremiumLockScreen'
import type { TimePeriod } from '@/lib/analytics'
import type { getAllBusinessAnalytics } from '@/lib/business-analytics'

interface Props {
  businessName: string
  initialPeriod: TimePeriod
  initialAnalytics: Awaited<ReturnType<typeof getAllBusinessAnalytics>>
  isAdmin?: boolean
}

export function BusinessAnalyticsClient({
  businessName,
  initialPeriod,
  initialAnalytics,
  isAdmin,
}: Props) {
  const router = useRouter()

  const handlePeriodChange = (period: TimePeriod) => {
    router.push(`/dashboard/my-business/analytics?period=${period}`)
  }

  // Admins can see analytics without premium subscription
  if (isAdmin) {
    return (
      <BusinessAnalyticsCharts
        businessName={businessName}
        period={initialPeriod}
        analytics={initialAnalytics}
        onPeriodChange={handlePeriodChange}
      />
    )
  }

  return (
    <div className="relative">
      {/* Charts rendered behind the lock screen */}
      <div
        className="blur-sm pointer-events-none select-none"
        aria-hidden="true"
      >
        <BusinessAnalyticsCharts
          businessName={businessName}
          period={initialPeriod}
          analytics={initialAnalytics}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Premium lock overlay */}
      <PremiumLockScreen />
    </div>
  )
}
