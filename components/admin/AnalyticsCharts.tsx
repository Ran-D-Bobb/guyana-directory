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
  Cell
} from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  Eye,
  Building2,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  TimePeriod,
  OverviewMetrics,
  TimeSeriesDataPoint,
  ReviewsByRating,
  CategoryPerformance,
  RegionPerformance,
  ContactActionStats
} from '@/lib/analytics'

interface AnalyticsChartsProps {
  period: TimePeriod
  overview: OverviewMetrics
  viewsData: TimeSeriesDataPoint[]
  registrationsData: TimeSeriesDataPoint[]
  reviewsData: ReviewsByRating[]
  categoriesData: CategoryPerformance[]
  regionsData: RegionPerformance[]
  contactsData: ContactActionStats
  onPeriodChange: (period: TimePeriod) => void
  onExport: () => void
}

// Custom tooltip for charts
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

// Metric card component
function MetricCard({
  label,
  value,
  change,
  changeType,
  icon: Icon
}: {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
            <Icon className="text-slate-700" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium',
          changeType === 'increase' && 'bg-emerald-100 text-emerald-700',
          changeType === 'decrease' && 'bg-red-100 text-red-700',
          changeType === 'neutral' && 'bg-gray-100 text-gray-600'
        )}>
          {changeType === 'increase' && <TrendingUp size={14} />}
          {changeType === 'decrease' && <TrendingDown size={14} />}
          {changeType === 'neutral' && <Minus size={14} />}
          {Math.abs(change)}%
        </div>
      </div>
    </div>
  )
}

// Rating bar colors
const ratingColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export function AnalyticsCharts({
  period,
  overview,
  viewsData,
  registrationsData,
  reviewsData,
  categoriesData,
  regionsData,
  contactsData,
  onPeriodChange,
  onExport
}: AnalyticsChartsProps) {
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ]

  const currentPeriodLabel = periodOptions.find(p => p.value === period)?.label || 'Last 30 days'

  // Format x-axis tick based on period
  const formatXAxis = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      if (period === '7d') {
        return format(date, 'EEE')
      } else if (period === '30d') {
        return format(date, 'MMM d')
      } else {
        return format(date, 'MMM d')
      }
    } catch {
      return dateStr
    }
  }

  // Calculate max views for y-axis domain
  const maxViews = Math.max(...viewsData.map(d => d.value), 1)
  const maxRegs = Math.max(...registrationsData.map(d => d.value), 1)

  return (
    <div className="space-y-6">
      {/* Period selector and export */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} />
            {currentPeriodLabel}
            <ChevronDown size={16} className={cn('transition-transform', periodDropdownOpen && 'rotate-180')} />
          </button>

          {periodDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPeriodDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                {periodOptions.map(option => (
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

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Views"
          value={overview.totalViews.value}
          change={overview.totalViews.change}
          changeType={overview.totalViews.changeType}
          icon={Eye}
        />
        <MetricCard
          label="New Businesses"
          value={overview.newBusinesses.value}
          change={overview.newBusinesses.change}
          changeType={overview.newBusinesses.changeType}
          icon={Building2}
        />
        <MetricCard
          label="New Users"
          value={overview.newUsers.value}
          change={overview.newUsers.change}
          changeType={overview.newUsers.changeType}
          icon={Users}
        />
        <MetricCard
          label="New Reviews"
          value={overview.newReviews.value}
          change={overview.newReviews.change}
          changeType={overview.newReviews.changeType}
          icon={Star}
        />
        <MetricCard
          label="Contact Actions"
          value={overview.contactActions.value}
          change={overview.contactActions.change}
          changeType={overview.contactActions.changeType}
          icon={MessageSquare}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views over time */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  domain={[0, Math.ceil(maxViews * 1.1)]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registrations over time */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  domain={[0, Math.ceil(maxRegs * 1.1)]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews by rating */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews by Rating</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewsData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="rating"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(val) => `${val} star${val !== 1 ? 's' : ''}`}
                  width={60}
                />
                <Tooltip
                  formatter={(value) => [value ?? 0, 'Reviews']}
                  labelFormatter={(label) => `${label} star${label !== 1 ? 's' : ''}`}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {reviewsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ratingColors[entry.rating - 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {categoriesData.slice(0, 8).map((category, index) => {
              const maxCatViews = Math.max(...categoriesData.map(c => c.totalViews), 1)
              const percentage = (category.totalViews / maxCatViews) * 100

              return (
                <div key={category.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-5">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {categoriesData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No category data available</p>
            )}
          </div>
        </div>

        {/* Top Regions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Regions</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {regionsData.slice(0, 8).map((region, index) => {
              const maxRegViews = Math.max(...regionsData.map(r => r.totalViews), 1)
              const percentage = (region.totalViews / maxRegViews) * 100

              return (
                <div key={region.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-5">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">{region.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">{region.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">{region.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {regionsData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No region data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact actions summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Actions Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-700">{contactsData.whatsappClicks.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">WhatsApp Clicks</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-700">{contactsData.totalInquiries.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">Tourism & Rental Inquiries</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-700">
              {(contactsData.whatsappClicks + contactsData.totalInquiries).toLocaleString()}
            </p>
            <p className="text-sm text-purple-600 mt-1">Total Contact Actions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
