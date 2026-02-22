'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  Eye,
  MessageCircle,
  Star,
  MessageSquare,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimePeriod } from '@/lib/analytics'
import type {
  BusinessOverviewMetrics,
  BusinessClicksOverTime,
  BusinessReviewsByRating,
  BusinessRecentReview,
} from '@/lib/business-analytics'

interface BusinessAnalyticsChartsProps {
  businessName: string
  period: TimePeriod
  analytics: {
    overview: BusinessOverviewMetrics
    clicksOverTime: BusinessClicksOverTime
    reviewsByRating: BusinessReviewsByRating[]
    recentReviews: BusinessRecentReview[]
  }
  onPeriodChange: (period: TimePeriod) => void
}

// Custom tooltip for line chart
interface TooltipPayloadItem {
  value: number
  dataKey: string
  payload: { date: string; value: number }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2">
        <p className="text-sm text-gray-600">{format(parseISO(label), 'MMM d, yyyy')}</p>
        <p className="text-sm font-semibold text-gray-900">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

// Simple metric card without change comparison
function MetricCard({
  label,
  value,
  icon: Icon,
  iconBgClass,
  iconClass,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconBgClass: string
  iconClass: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', iconBgClass)}>
          <Icon className={iconClass} size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Rating bar colors: 1-star red through 5-star green
const ratingColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export function BusinessAnalyticsCharts({
  businessName,
  period,
  analytics,
  onPeriodChange,
}: BusinessAnalyticsChartsProps) {
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)

  const { overview, clicksOverTime, reviewsByRating, recentReviews } = analytics

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ]

  const currentPeriodLabel =
    periodOptions.find((p) => p.value === period)?.label ?? 'Last 30 days'

  const formatXAxis = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      if (period === '7d') return format(date, 'EEE')
      return format(date, 'MMM d')
    } catch {
      return dateStr
    }
  }

  const maxClicks = Math.max(...clicksOverTime.data.map((d) => d.value), 1)

  return (
    <div className="space-y-6">
      {/* Header: business name + period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          Showing analytics for{' '}
          <span className="font-semibold text-gray-800">{businessName}</span>
        </p>

        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} />
            {currentPeriodLabel}
            <ChevronDown
              size={16}
              className={cn('transition-transform', periodDropdownOpen && 'rotate-180')}
            />
          </button>

          {periodDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPeriodDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onPeriodChange(option.value)
                      setPeriodDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-sm transition-colors',
                      period === option.value
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Views"
          value={overview.totalViews.toLocaleString()}
          icon={Eye}
          iconBgClass="bg-blue-100"
          iconClass="text-blue-600"
        />
        <MetricCard
          label="WhatsApp Clicks"
          value={overview.whatsappClicks.toLocaleString()}
          icon={MessageCircle}
          iconBgClass="bg-green-100"
          iconClass="text-green-600"
        />
        <MetricCard
          label="Average Rating"
          value={overview.avgRating > 0 ? overview.avgRating.toFixed(1) : '—'}
          icon={Star}
          iconBgClass="bg-yellow-100"
          iconClass="text-yellow-600"
        />
        <MetricCard
          label="Total Reviews"
          value={overview.totalReviews.toLocaleString()}
          icon={MessageSquare}
          iconBgClass="bg-purple-100"
          iconClass="text-purple-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Clicks Over Time */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            WhatsApp Clicks Over Time
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={clicksOverTime.data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  domain={[0, Math.ceil(maxClicks * 1.1)]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Review Rating Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Review Rating Distribution
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reviewsByRating}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="rating"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(val: number) => `${val} star${val !== 1 ? 's' : ''}`}
                  width={55}
                />
                <Tooltip
                  formatter={(value) => [value ?? 0, 'Reviews']}
                  labelFormatter={(label) =>
                    `${label} star${label !== 1 ? 's' : ''}`
                  }
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {reviewsByRating.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ratingColors[entry.rating - 1]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>

        {recentReviews.length > 0 ? (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {review.reviewer_name ?? 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {review.created_at
                      ? format(parseISO(review.created_at), 'MMM d, yyyy')
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}
