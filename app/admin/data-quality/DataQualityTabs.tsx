'use client'

import Link from 'next/link'
import {
  FileWarning,
  Clock,
  Copy,
  EyeOff,
  ExternalLink,
  Image,
  FileText,
  Phone,
  Tag,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Edit,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DataQualityStats,
  IncompleteBusiness,
  StaleBusiness,
  DuplicateGroup,
  LowEngagementBusiness,
} from '@/lib/data-quality'

interface DataQualityTabsProps {
  activeTab: string
  stats: DataQualityStats
  incompleteListings: IncompleteBusiness[]
  staleListings: StaleBusiness[]
  duplicateGroups: DuplicateGroup[]
  lowEngagementListings: LowEngagementBusiness[]
}

const tabs = [
  { id: 'incomplete', label: 'Incomplete', icon: FileWarning, color: 'orange' },
  { id: 'stale', label: 'Stale', icon: Clock, color: 'yellow' },
  { id: 'duplicates', label: 'Duplicates', icon: Copy, color: 'purple' },
  { id: 'low-engagement', label: 'Low Engagement', icon: EyeOff, color: 'red' },
]

export function DataQualityTabs({
  activeTab,
  stats,
  incompleteListings,
  staleListings,
  duplicateGroups,
  lowEngagementListings,
}: DataQualityTabsProps) {
  const getTabCount = (tabId: string): number => {
    switch (tabId) {
      case 'incomplete':
        return stats.incompleteCount
      case 'stale':
        return stats.staleWarningCount + stats.staleCriticalCount
      case 'duplicates':
        return stats.potentialDuplicatesCount
      case 'low-engagement':
        return stats.lowEngagementCount
      default:
        return 0
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = getTabCount(tab.id)
            const isActive = activeTab === tab.id

            return (
              <Link
                key={tab.id}
                href={`/admin/data-quality?tab=${tab.id}`}
                className={cn(
                  'flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                  isActive
                    ? 'border-emerald-500 text-emerald-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50'
                )}
              >
                <Icon size={18} />
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'incomplete' && (
          <IncompleteListingsSection listings={incompleteListings} />
        )}
        {activeTab === 'stale' && (
          <StaleListingsSection listings={staleListings} />
        )}
        {activeTab === 'duplicates' && (
          <DuplicatesSection groups={duplicateGroups} />
        )}
        {activeTab === 'low-engagement' && (
          <LowEngagementSection listings={lowEngagementListings} />
        )}
      </div>
    </div>
  )
}

// Incomplete Listings Section
function IncompleteListingsSection({ listings }: { listings: IncompleteBusiness[] }) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="All Listings Complete"
        description="All business listings have the required information."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <p className="text-sm text-slate-600">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} with missing information
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Critical (4+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Warning (2-3)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Minor (1)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {listings.map((business) => (
          <div
            key={business.id}
            className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {/* Severity Indicator */}
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm',
                business.severity >= 4 && 'bg-red-500',
                business.severity >= 2 && business.severity < 4 && 'bg-orange-500',
                business.severity === 1 && 'bg-yellow-500'
              )}
            >
              {business.severity}
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/businesses/${business.slug}`}
                  target="_blank"
                  className="font-medium text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  {business.name}
                  <ExternalLink size={14} className="opacity-50" />
                </Link>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                {business.category && (
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {business.category.name}
                  </span>
                )}
                {business.region && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {business.region.name}
                  </span>
                )}
              </div>

              {/* Issues */}
              <div className="flex flex-wrap gap-2 mt-3">
                {business.issues.missingPhotos && (
                  <IssueBadge icon={Image} label="No photos" color="red" />
                )}
                {business.issues.shortDescription && (
                  <IssueBadge icon={FileText} label="Short description" color="orange" />
                )}
                {business.issues.missingHours && (
                  <IssueBadge icon={Clock} label="No hours" color="yellow" />
                )}
                {business.issues.missingPhone && (
                  <IssueBadge icon={Phone} label="No phone" color="yellow" />
                )}
                {business.issues.missingCategory && (
                  <IssueBadge icon={Tag} label="No category" color="purple" />
                )}
                {business.issues.missingRegion && (
                  <IssueBadge icon={MapPin} label="No region" color="blue" />
                )}
              </div>
            </div>

            {/* Actions */}
            <Link
              href={`/admin/businesses/${business.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit size={14} />
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stale Listings Section
function StaleListingsSection({ listings }: { listings: StaleBusiness[] }) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="All Listings Up to Date"
        description="All business listings have been updated within the last 6 months."
      />
    )
  }

  const critical = listings.filter((b) => b.severity === 'critical')
  const warning = listings.filter((b) => b.severity === 'warning')

  return (
    <div className="space-y-6">
      {/* Critical Section */}
      {critical.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-red-200">
            <AlertTriangle className="text-red-500" size={18} />
            <h3 className="font-semibold text-red-700">
              Critical: 12+ Months ({critical.length})
            </h3>
          </div>
          {critical.map((business) => (
            <StaleBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {/* Warning Section */}
      {warning.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-yellow-200">
            <Clock className="text-yellow-600" size={18} />
            <h3 className="font-semibold text-yellow-700">
              Warning: 6-12 Months ({warning.length})
            </h3>
          </div>
          {warning.map((business) => (
            <StaleBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  )
}

function StaleBusinessCard({ business }: { business: StaleBusiness }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-colors',
        business.severity === 'critical' ? 'bg-red-50 hover:bg-red-100' : 'bg-yellow-50 hover:bg-yellow-100'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          business.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
        )}
      >
        <Calendar size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/businesses/${business.slug}`}
          target="_blank"
          className="font-medium text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
        >
          {business.name}
          <ExternalLink size={14} className="opacity-50" />
        </Link>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span>Last updated: {formatDate(business.updated_at)}</span>
          <span className={cn(
            'font-medium',
            business.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
          )}>
            ({business.days_since_update} days ago)
          </span>
        </div>
      </div>

      <Link
        href={`/admin/businesses/${business.id}/edit`}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Edit size={14} />
        Update
      </Link>
    </div>
  )
}

// Duplicates Section
function DuplicatesSection({ groups }: { groups: DuplicateGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="No Duplicates Found"
        description="No potential duplicate listings were detected."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <p className="text-sm text-slate-600">
          {groups.length} group{groups.length !== 1 ? 's' : ''} of potential duplicates found
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div
            key={idx}
            className="bg-purple-50 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
              <MapPin size={16} />
              {group.region_name || 'No Region'}
              <span className="text-purple-500">
                ({group.businesses.length} similar listings)
              </span>
            </div>

            <div className="space-y-2">
              {group.businesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/businesses/${business.slug}`}
                        target="_blank"
                        className="font-medium text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
                      >
                        {business.name}
                        <ExternalLink size={14} className="opacity-50" />
                      </Link>
                      {business.is_verified && (
                        <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{business.view_count || 0} views</span>
                      <span>Created: {business.created_at ? new Date(business.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/businesses/${business.id}/edit`}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Low Engagement Section
function LowEngagementSection({ listings }: { listings: LowEngagementBusiness[] }) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="All Listings Engaged"
        description="All businesses have adequate engagement levels."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <p className="text-sm text-slate-600">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} with low or no engagement
        </p>
        <p className="text-xs text-slate-500">
          Businesses with 5 or fewer views after 30+ days
        </p>
      </div>

      <div className="space-y-3">
        {listings.map((business) => (
          <div
            key={business.id}
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg text-red-600">
              <EyeOff size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/businesses/${business.slug}`}
                target="_blank"
                className="font-medium text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                {business.name}
                <ExternalLink size={14} className="opacity-50" />
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                {business.category && (
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {business.category.name}
                  </span>
                )}
                {business.region && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {business.region.name}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-red-600">
                {business.view_count || 0}
              </div>
              <div className="text-xs text-slate-500">views</div>
            </div>

            <div className="text-right mr-2">
              <div className="text-sm font-medium text-slate-700">
                {business.days_since_creation}
              </div>
              <div className="text-xs text-slate-500">days old</div>
            </div>

            <Link
              href={`/admin/businesses/${business.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit size={14} />
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper Components
function IssueBadge({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType
  label: string
  color: 'red' | 'orange' | 'yellow' | 'purple' | 'blue'
}) {
  const colorClasses = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
  }

  return (
    <span
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        colorClasses[color]
      )}
    >
      <Icon size={12} />
      {label}
    </span>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="py-12 text-center">
      <Icon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  )
}
