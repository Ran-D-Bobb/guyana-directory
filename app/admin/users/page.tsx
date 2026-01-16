import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Building2,
  Star,
  User,
  Shield,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { UserActions, UserStatusBadge } from '@/components/admin/AdminActionButtons'
import type { UserStatus } from '@/lib/user-status'

// Extended profile type with status fields (pending migration)
interface ProfileWithStatus {
  id: string
  created_at: string | null
  email: string | null
  name: string | null
  phone: string | null
  photo: string | null
  review_count: number | null
  updated_at: string | null
  status?: UserStatus
  status_reason?: string | null
  status_expires_at?: string | null
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>
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
  const searchQuery = params.q
  const roleFilter = params.role
  const statusFilter = params.status

  // Get all users with their activity counts and status
  // Note: After applying migration 20260116110000_user_status.sql, run: supabase gen types typescript --local > types/supabase.ts
  const { data: profilesData, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Cast to extended type that includes status fields
  const profiles = profilesData as ProfileWithStatus[] | null

  if (error) {
    console.error('Error fetching profiles:', error)
  }

  // Get admin emails to identify admins
  const { data: adminEmails } = await supabase
    .from('admin_emails')
    .select('email')

  const adminEmailSet = new Set(adminEmails?.map(a => a.email) || [])

  // Get user activity counts
  const { data: reviewCounts } = await supabase
    .from('reviews')
    .select('user_id')

  const { data: businessOwners } = await supabase
    .from('businesses')
    .select('owner_id')
    .not('owner_id', 'is', null)

  // Calculate review counts per user
  const userReviewCounts = reviewCounts?.reduce((acc, r) => {
    acc[r.user_id] = (acc[r.user_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get business owners set
  const businessOwnerIds = new Set(businessOwners?.map(b => b.owner_id) || [])

  // Apply search filter
  let filteredProfiles = profiles || []

  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Apply role filter
  if (roleFilter === 'admin') {
    filteredProfiles = filteredProfiles.filter(p => adminEmailSet.has(p.email || ''))
  } else if (roleFilter === 'business_owner') {
    filteredProfiles = filteredProfiles.filter(p => businessOwnerIds.has(p.id))
  } else if (roleFilter === 'user') {
    filteredProfiles = filteredProfiles.filter(p =>
      !adminEmailSet.has(p.email || '') && !businessOwnerIds.has(p.id)
    )
  }

  // Apply status filter
  if (statusFilter === 'active') {
    filteredProfiles = filteredProfiles.filter(p => !p.status || p.status === 'active')
  } else if (statusFilter === 'suspended') {
    filteredProfiles = filteredProfiles.filter(p => p.status === 'suspended')
  } else if (statusFilter === 'banned') {
    filteredProfiles = filteredProfiles.filter(p => p.status === 'banned')
  }

  // Calculate stats
  const totalUsers = profiles?.length || 0
  const adminCount = profiles?.filter(p => adminEmailSet.has(p.email || '')).length || 0
  const businessOwnerCount = businessOwnerIds.size
  const totalReviews = reviewCounts?.length || 0
  const usersWithReviews = new Set(reviewCounts?.map(r => r.user_id) || []).size
  const suspendedCount = profiles?.filter(p => p.status === 'suspended').length || 0
  const bannedCount = profiles?.filter(p => p.status === 'banned').length || 0

  // Check if any filter is active
  const hasActiveFilters = searchQuery || roleFilter || statusFilter

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Users"
        subtitle={`Manage ${totalUsers} registered users`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <AdminStatCard
            label="Total Users"
            value={totalUsers}
            icon="Users"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Admins"
            value={adminCount}
            icon="Shield"
            color="red"
            size="sm"
          />
          <AdminStatCard
            label="Business Owners"
            value={businessOwnerCount}
            icon="Building2"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Total Reviews"
            value={totalReviews}
            icon="Star"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Active Reviewers"
            value={usersWithReviews}
            icon="MessageCircle"
            color="cyan"
            size="sm"
          />
          <AdminStatCard
            label="Suspended"
            value={suspendedCount}
            icon="Clock"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Banned"
            value={bannedCount}
            icon="AlertTriangle"
            color="red"
            size="sm"
          />
        </div>

        {/* Filters & User List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by name or email..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Role Filter */}
              <select
                name="role"
                defaultValue={roleFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all min-w-[150px]"
              >
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="business_owner">Business Owners</option>
                <option value="user">Regular Users</option>
              </select>

              {/* Status Filter */}
              <select
                name="status"
                defaultValue={statusFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all min-w-[150px]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/users"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {filteredProfiles.length} users
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* User List */}
          <div className="divide-y divide-slate-100">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => {
                const isUserAdmin = adminEmailSet.has(profile.email || '')
                const isBusinessOwner = businessOwnerIds.has(profile.id)
                const reviewCount = userReviewCounts[profile.id] || 0

                return (
                  <div
                    key={profile.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Avatar & Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {profile.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.photo}
                            alt={profile.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-purple-200">
                            <User className="w-6 h-6 text-purple-600" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">
                              {profile.name || 'Unnamed User'}
                            </span>

                            {/* Role Badges */}
                            {isUserAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                <Shield size={12} />
                                Admin
                              </span>
                            )}
                            {isBusinessOwner && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                <Building2 size={12} />
                                Business Owner
                              </span>
                            )}

                            {/* Status Badge */}
                            <UserStatusBadge
                              status={(profile.status as UserStatus) || 'active'}
                              expiresAt={profile.status_expires_at}
                            />
                          </div>

                          {/* Contact Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            {profile.email && (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={14} className="text-slate-400" />
                                {profile.email}
                              </span>
                            )}
                            {profile.phone && (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={14} className="text-slate-400" />
                                {profile.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats & Date */}
                      <div className="flex flex-wrap items-center gap-4 text-sm lg:flex-col lg:items-end lg:gap-2">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="font-medium text-slate-700">{reviewCount}</span>
                            reviews
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar size={12} />
                          Joined {formatDate(profile.created_at)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        <UserActions
                          userId={profile.id}
                          userName={profile.name || 'Unknown User'}
                          userEmail={profile.email || undefined}
                          status={(profile.status as UserStatus) || 'active'}
                          statusReason={profile.status_reason}
                          statusExpiresAt={profile.status_expires_at}
                          isAdmin={isUserAdmin}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Users will appear here when they sign up'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
