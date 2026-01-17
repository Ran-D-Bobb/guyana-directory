import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Flag,
  Building2,
  MessageSquare,
  MapPin,
  Image,
  Clock,
  CalendarDays,
  Home,
  Users
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'

// Type definitions for audit logs
type AdminAction =
  | 'create' | 'update' | 'delete'
  | 'verify' | 'unverify'
  | 'feature' | 'unfeature'
  | 'approve' | 'unapprove'
  | 'suspend' | 'ban' | 'reactivate'
  | 'dismiss_flag'

type EntityType =
  | 'business' | 'review' | 'event' | 'tourism'
  | 'rental' | 'user' | 'photo' | 'category'
  | 'region' | 'timeline'

interface AuditLog {
  id: string
  admin_id: string
  action: AdminAction
  entity_type: EntityType
  entity_id: string
  entity_name: string
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  created_at: string
  admin?: {
    name: string | null
    email: string | null
    photo: string | null
  }
}

// Helper to get action display info
function getActionInfo(action: AdminAction) {
  const actionMap: Record<AdminAction, { label: string; variant: string; icon: typeof CheckCircle }> = {
    create: { label: 'Created', variant: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    update: { label: 'Updated', variant: 'bg-blue-100 text-blue-700', icon: Clock },
    delete: { label: 'Deleted', variant: 'bg-red-100 text-red-700', icon: Trash2 },
    verify: { label: 'Verified', variant: 'bg-blue-100 text-blue-700', icon: Shield },
    unverify: { label: 'Unverified', variant: 'bg-slate-100 text-slate-700', icon: Shield },
    feature: { label: 'Featured', variant: 'bg-amber-100 text-amber-700', icon: Star },
    unfeature: { label: 'Unfeatured', variant: 'bg-slate-100 text-slate-700', icon: Star },
    approve: { label: 'Approved', variant: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    unapprove: { label: 'Unapproved', variant: 'bg-orange-100 text-orange-700', icon: XCircle },
    suspend: { label: 'Suspended', variant: 'bg-orange-100 text-orange-700', icon: Users },
    ban: { label: 'Banned', variant: 'bg-red-100 text-red-700', icon: Users },
    reactivate: { label: 'Reactivated', variant: 'bg-emerald-100 text-emerald-700', icon: Users },
    dismiss_flag: { label: 'Dismissed Flag', variant: 'bg-slate-100 text-slate-700', icon: Flag },
  }
  return actionMap[action] || { label: action, variant: 'bg-slate-100 text-slate-700', icon: Clock }
}

// Helper to get entity type display info
function getEntityInfo(entityType: EntityType) {
  const entityMap: Record<EntityType, { label: string; icon: typeof Building2 }> = {
    business: { label: 'Business', icon: Building2 },
    review: { label: 'Review', icon: MessageSquare },
    event: { label: 'Event', icon: CalendarDays },
    tourism: { label: 'Tourism', icon: MapPin },
    rental: { label: 'Rental', icon: Home },
    user: { label: 'User', icon: Users },
    photo: { label: 'Photo', icon: Image },
    category: { label: 'Category', icon: Building2 },
    region: { label: 'Region', icon: MapPin },
    timeline: { label: 'Timeline', icon: Clock },
  }
  return entityMap[entityType] || { label: entityType, icon: Clock }
}

// Format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Error component for when things go wrong
function AuditLogError({ message }: { message?: string }) {
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Audit Log"
        subtitle="Track all admin actions for accountability"
      />
      <div className="px-4 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Unable to Load Audit Logs
          </h2>
          <p className="text-slate-600 mb-4">
            {message || 'There was an error loading the audit logs. Please ensure database migrations are up to date.'}
          </p>
          <code className="block bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm">
            supabase db push
          </code>
        </div>
      </div>
    </div>
  )
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    admin?: string
    action?: string
    entity?: string
    q?: string
    from?: string
    to?: string
    page?: string
  }>
}) {
  try {
    const supabase = await createClient()
    const params = await searchParams

    // Parse parameters
    const adminFilter = params.admin
    const actionFilter = params.action as AdminAction | undefined
    const entityFilter = params.entity as EntityType | undefined
    const searchQuery = params.q
    const fromDate = params.from
    const toDate = params.to
    const currentPage = parseInt(params.page || '1')
    const pageSize = 25

    // Build query - using type assertion since admin_audit_logs table types aren't generated yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('admin_audit_logs')
      .select(`
        *,
        admin:profiles!admin_id (name, email, photo)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (adminFilter) {
      query = query.eq('admin_id', adminFilter)
    }
    if (actionFilter) {
      query = query.eq('action', actionFilter)
    }
    if (entityFilter) {
      query = query.eq('entity_type', entityFilter)
    }
    if (fromDate) {
      query = query.gte('created_at', `${fromDate}T00:00:00`)
    }
    if (toDate) {
      query = query.lte('created_at', `${toDate}T23:59:59`)
    }
    if (searchQuery) {
      query = query.ilike('entity_name', `%${searchQuery}%`)
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data: logs, error, count } = await query

    // Handle case where table doesn't exist or other errors
    if (error) {
      console.error('Error fetching audit logs:', error)
      const message = error.code === '42P01' || error.message?.includes('does not exist')
        ? 'The audit log table needs to be created in the database. Run the migration to enable this feature.'
        : 'There was an error loading the audit logs. Please ensure database migrations are up to date.'
      return <AuditLogError message={message} />
    }

    // Get admins for filter dropdown - wrap in try-catch for resilience
    let adminProfiles: { id: string; name: string | null; email: string | null }[] = []

    try {
      const { data: admins } = await supabase
        .from('admin_emails')
        .select('email')

      const adminEmails = admins?.map(a => a.email) || []

      if (adminEmails.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('email', adminEmails)
        adminProfiles = profiles || []
      }
    } catch (e) {
      console.error('Error fetching admin profiles:', e)
      // Continue with empty adminProfiles
    }

    // Calculate stats for current filters - with error handling
    let totalActions = 0
    let todayActions = 0
    let deleteActions = 0

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: total } = await (supabase as any)
        .from('admin_audit_logs')
        .select('*', { count: 'exact', head: true })
      totalActions = total || 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: today } = await (supabase as any)
        .from('admin_audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
      todayActions = today || 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: deletes } = await (supabase as any)
        .from('admin_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'delete')
      deleteActions = deletes || 0
    } catch (e) {
      console.error('Error fetching audit stats:', e)
      // Continue with zero stats
    }

  // Check if any filter is active
  const hasActiveFilters = adminFilter || actionFilter || entityFilter || searchQuery || fromDate || toDate

  // Build filter URL helper
  const buildFilterUrl = (newParams: Record<string, string | undefined>) => {
    const url = new URLSearchParams()
    const allParams = {
      admin: adminFilter,
      action: actionFilter,
      entity: entityFilter,
      q: searchQuery,
      from: fromDate,
      to: toDate,
      ...newParams
    }
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) url.set(key, value)
    })
    return `/admin/audit-log?${url.toString()}`
  }

  // Total pages
  const totalPages = Math.ceil((count || 0) / pageSize)

  // All possible actions and entity types for filters
  const allActions: AdminAction[] = [
    'create', 'update', 'delete', 'verify', 'unverify',
    'feature', 'unfeature', 'approve', 'unapprove',
    'suspend', 'ban', 'reactivate', 'dismiss_flag'
  ]
  const allEntityTypes: EntityType[] = [
    'business', 'review', 'event', 'tourism', 'rental',
    'user', 'photo', 'category', 'region', 'timeline'
  ]

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Audit Log"
        subtitle="Track all admin actions for accountability"
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Actions"
            value={totalActions || 0}
            icon="Activity"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Today"
            value={todayActions || 0}
            icon="Calendar"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Deletions"
            value={deleteActions || 0}
            icon="AlertTriangle"
            color="red"
            size="sm"
          />
          <AdminStatCard
            label="Admins Active"
            value={adminProfiles?.length || 0}
            icon="Users"
            color="blue"
            size="sm"
          />
        </div>

        {/* Filters & Log List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by entity name..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Admin Filter */}
              <select
                name="admin"
                defaultValue={adminFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all min-w-[160px]"
              >
                <option value="">All Admins</option>
                {adminProfiles?.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email}
                  </option>
                ))}
              </select>

              {/* Action Filter */}
              <select
                name="action"
                defaultValue={actionFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Actions</option>
                {allActions.map((action) => (
                  <option key={action} value={action}>
                    {getActionInfo(action).label}
                  </option>
                ))}
              </select>

              {/* Entity Type Filter */}
              <select
                name="entity"
                defaultValue={entityFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Types</option>
                {allEntityTypes.map((entityType) => (
                  <option key={entityType} value={entityType}>
                    {getEntityInfo(entityType).label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/audit-log"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>

            {/* Date Range Filter */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Calendar size={14} />
                Date Range:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="from"
                  form="filter-form"
                  defaultValue={fromDate || ''}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:outline-none"
                  onChange={(e) => {
                    const url = buildFilterUrl({ from: e.target.value, page: undefined })
                    window.location.href = url
                  }}
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  name="to"
                  form="filter-form"
                  defaultValue={toDate || ''}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:outline-none"
                  onChange={(e) => {
                    const url = buildFilterUrl({ to: e.target.value, page: undefined })
                    window.location.href = url
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {logs?.length || 0} of {count || 0} entries
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Audit Log List */}
          <div className="divide-y divide-slate-100">
            {logs && logs.length > 0 ? (
              logs.map((log: AuditLog) => {
                const actionInfo = getActionInfo(log.action)
                const entityInfo = getEntityInfo(log.entity_type)
                const ActionIcon = actionInfo.icon
                const EntityIcon = entityInfo.icon

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionInfo.variant}`}>
                          <ActionIcon size={20} />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          {/* Action Badge */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionInfo.variant}`}>
                            {actionInfo.label}
                          </span>

                          {/* Entity Type Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            <EntityIcon size={12} />
                            {entityInfo.label}
                          </span>
                        </div>

                        {/* Entity Name */}
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          {log.entity_name}
                        </p>

                        {/* Admin and Timestamp */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            {log.admin?.name || log.admin?.email || 'Unknown Admin'}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            {formatRelativeTime(log.created_at)}
                          </span>
                        </div>

                        {/* Before/After Data (if present) */}
                        {(log.before_data || log.after_data) && (
                          <div className="mt-3 flex flex-wrap gap-4 text-xs">
                            {log.before_data && Object.keys(log.before_data).length > 0 && (
                              <div className="bg-red-50 rounded-lg px-3 py-2">
                                <span className="font-medium text-red-700">Before: </span>
                                <span className="text-red-600">
                                  {Object.entries(log.before_data).map(([key, value]) =>
                                    `${key}: ${String(value)}`
                                  ).join(', ')}
                                </span>
                              </div>
                            )}
                            {log.after_data && Object.keys(log.after_data).length > 0 && (
                              <div className="bg-emerald-50 rounded-lg px-3 py-2">
                                <span className="font-medium text-emerald-700">After: </span>
                                <span className="text-emerald-600">
                                  {Object.entries(log.after_data).map(([key, value]) =>
                                    `${key}: ${String(value)}`
                                  ).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Full Timestamp */}
                      <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No audit logs found</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Admin actions will be logged here'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={buildFilterUrl({ page: String(currentPage - 1) })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={buildFilterUrl({ page: String(currentPage + 1) })}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    )
  } catch (e) {
    console.error('Unexpected error in audit log page:', e)
    return <AuditLogError />
  }
}
