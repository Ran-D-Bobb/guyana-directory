'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import type {
  TimePeriod,
  OverviewMetrics,
  TimeSeriesDataPoint,
  ReviewsByRating,
  CategoryPerformance,
  RegionPerformance,
  ContactActionStats
} from '@/lib/analytics'

interface AnalyticsClientProps {
  initialPeriod: TimePeriod
  initialOverview: OverviewMetrics
  initialViewsData: TimeSeriesDataPoint[]
  initialRegistrationsData: TimeSeriesDataPoint[]
  initialReviewsData: ReviewsByRating[]
  initialCategoriesData: CategoryPerformance[]
  initialRegionsData: RegionPerformance[]
  initialContactsData: ContactActionStats
}

export function AnalyticsClient({
  initialPeriod,
  initialOverview,
  initialViewsData,
  initialRegistrationsData,
  initialReviewsData,
  initialCategoriesData,
  initialRegionsData,
  initialContactsData
}: AnalyticsClientProps) {
  const router = useRouter()

  const handlePeriodChange = (period: TimePeriod) => {
    router.push(`/admin/analytics?period=${period}`)
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?period=${initialPeriod}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${initialPeriod}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Analytics exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analytics')
    }
  }

  return (
    <AnalyticsCharts
      period={initialPeriod}
      overview={initialOverview}
      viewsData={initialViewsData}
      registrationsData={initialRegistrationsData}
      reviewsData={initialReviewsData}
      categoriesData={initialCategoriesData}
      regionsData={initialRegionsData}
      contactsData={initialContactsData}
      onPeriodChange={handlePeriodChange}
      onExport={handleExport}
    />
  )
}
