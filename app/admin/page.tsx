import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ArrowUpRight,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminQuickActions } from '@/components/admin/AdminQuickActions'
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get analytics data
  const [
    { count: totalBusinesses },
    { count: totalUsers },
    { count: totalReviews },
    { count: totalEvents },
    { count: totalTourism },
    { count: pendingTourism },
    { count: totalRentals },
    { count: flaggedRentals },
    { data: businesses },
    { data: events },
    { data: tourismData },
    { data: rentalsData },
    { data: recentReviews },
    { data: recentBusinesses },
    { data: recentEvents },
    { data: recentTourism },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('tourism_experiences').select('*', { count: 'exact', head: true }),
    supabase.from('tourism_experiences').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('rentals').select('*', { count: 'exact', head: true }),
    supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
    supabase
      .from('businesses')
      .select('view_count')
      .order('created_at', { ascending: false }),
    supabase
      .from('events')
      .select('view_count, interest_count')
      .order('created_at', { ascending: false }),
    supabase
      .from('tourism_experiences')
      .select('view_count, booking_inquiry_count')
      .order('created_at', { ascending: false }),
    supabase
      .from('rentals')
      .select('view_count, inquiry_count, save_count')
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select(`
        *,
        businesses(name, slug),
        profiles(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('businesses')
      .select(`
        *,
        categories(name),
        regions(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('events')
      .select(`
        *,
        event_categories:category_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tourism_experiences')
      .select(`
        *,
        tourism_categories(name),
        regions(name),
        profiles(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate totals
  const totalViews = businesses?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0
  const totalEventViews = events?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
  const totalTourismViews = tourismData?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0
  const totalRentalViews = rentalsData?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
  const totalTourismInquiries = tourismData?.reduce((sum, t) => sum + (t.booking_inquiry_count || 0), 0) || 0
  const totalRentalInquiries = rentalsData?.reduce((sum, r) => sum + (r.inquiry_count || 0), 0) || 0

  // Quick actions configuration
  const quickActions = [
    {
      label: 'Add Business',
      description: 'Create new business listing',
      href: '/admin/businesses/create',
      icon: 'Plus',
      color: 'emerald' as const,
    },
    {
      label: 'Manage Events',
      description: 'Review and moderate',
      href: '/admin/events',
      icon: 'Calendar',
      color: 'purple' as const,
    },
    {
      label: 'Tourism',
      description: pendingTourism && pendingTourism > 0 ? `${pendingTourism} pending` : 'Manage experiences',
      href: '/admin/tourism',
      icon: 'Compass',
      color: 'cyan' as const,
      badge: pendingTourism && pendingTourism > 0 ? pendingTourism : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      label: 'Rentals',
      description: flaggedRentals && flaggedRentals > 0 ? `${flaggedRentals} flagged` : 'Property listings',
      href: '/admin/rentals',
      icon: 'Home',
      color: flaggedRentals && flaggedRentals > 0 ? 'orange' as const : 'blue' as const,
      badge: flaggedRentals && flaggedRentals > 0 ? flaggedRentals : undefined,
      badgeVariant: 'danger' as const,
    },
    {
      label: 'All Businesses',
      description: 'Edit, verify, feature',
      href: '/admin/businesses',
      icon: 'Building2',
      color: 'pink' as const,
    },
  ]

  // Format recent activity items
  const recentBusinessItems = recentBusinesses?.map((b) => ({
    id: b.id,
    title: b.name,
    subtitle: `${b.categories?.name || 'Uncategorized'} • ${b.regions?.name || 'Unknown'}`,
    href: `/businesses/${b.slug}`,
    badges: [
      ...(b.is_verified ? [{ label: 'Verified', variant: 'verified' as const }] : []),
      ...(b.is_featured ? [{ label: 'Featured', variant: 'featured' as const }] : []),
    ],
    stats: [
      { icon: 'Eye', value: b.view_count || 0 },
    ],
  })) || []

  const recentEventItems = recentEvents?.map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: e.event_categories?.name || 'Uncategorized',
    href: `/events/${e.slug}`,
    badges: [
      ...(e.is_featured ? [{ label: 'Featured', variant: 'featured' as const }] : []),
    ],
    stats: [
      { icon: 'Eye', value: e.view_count || 0 },
      { icon: 'TrendingUp', value: e.interest_count || 0 },
    ],
  })) || []

  const recentTourismItems = recentTourism?.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: `${t.tourism_categories?.name || ''} ${t.regions?.name ? `• ${t.regions.name}` : ''}`,
    href: `/tourism/${t.slug}`,
    badges: [
      ...(!t.is_approved ? [{ label: 'Pending', variant: 'pending' as const }] : []),
      ...(t.is_featured ? [{ label: 'Featured', variant: 'featured' as const }] : []),
    ],
    stats: [
      { icon: 'Eye', value: t.view_count || 0 },
      { icon: 'MessageCircle', value: t.booking_inquiry_count || 0 },
    ],
  })) || []

  const recentReviewItems = recentReviews?.map((r) => ({
    id: r.id,
    title: r.profiles?.name || 'Anonymous',
    subtitle: r.businesses?.name || 'Unknown Business',
    href: `/businesses/${r.businesses?.slug}`,
    badges: [
      { label: `${r.rating} ★`, variant: r.rating >= 4 ? 'success' as const : r.rating >= 3 ? 'warning' as const : 'danger' as const },
    ],
    stats: [],
  })) || []

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your platform."
      />

      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Alerts Section */}
        {((pendingTourism && pendingTourism > 0) || (flaggedRentals && flaggedRentals > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTourism && pendingTourism > 0 && (
              <Link
                href="/admin/tourism?approved=false"
                className="group flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl hover:shadow-lg hover:border-orange-300 transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Pending Approvals</h3>
                  <p className="text-sm text-orange-700">{pendingTourism} tourism experience{pendingTourism !== 1 ? 's' : ''} waiting for review</p>
                </div>
                <ArrowUpRight className="text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={20} />
              </Link>
            )}

            {flaggedRentals && flaggedRentals > 0 && (
              <Link
                href="/admin/rentals?flagged=true"
                className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl hover:shadow-lg hover:border-red-300 transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Flagged Content</h3>
                  <p className="text-sm text-red-700">{flaggedRentals} rental{flaggedRentals !== 1 ? 's' : ''} flagged by users</p>
                </div>
                <ArrowUpRight className="text-red-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={20} />
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <AdminQuickActions actions={quickActions} />
        </section>

        {/* Stats Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <AdminStatCard
              label="Total Businesses"
              value={totalBusinesses || 0}
              icon="Building2"
              color="emerald"
            />
            <AdminStatCard
              label="Total Events"
              value={totalEvents || 0}
              icon="Calendar"
              color="purple"
            />
            <AdminStatCard
              label="Tourism Experiences"
              value={totalTourism || 0}
              icon="Compass"
              color="cyan"
            />
            <AdminStatCard
              label="Total Rentals"
              value={totalRentals || 0}
              icon="Home"
              color="blue"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AdminStatCard
              label="Total Users"
              value={totalUsers || 0}
              icon="Users"
              color="purple"
              size="sm"
            />
            <AdminStatCard
              label="Total Reviews"
              value={totalReviews || 0}
              icon="Star"
              color="yellow"
              size="sm"
            />
            <AdminStatCard
              label="Total Views"
              value={totalViews + totalEventViews + totalTourismViews + totalRentalViews}
              icon="Eye"
              color="blue"
              size="sm"
            />
            <AdminStatCard
              label="Tourism Inquiries"
              value={totalTourismInquiries}
              icon="TrendingUp"
              color="cyan"
              size="sm"
            />
            <AdminStatCard
              label="Rental Inquiries"
              value={totalRentalInquiries}
              icon="Activity"
              color="pink"
              size="sm"
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <AdminRecentActivity
              title="Recent Businesses"
              icon="Building2"
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
              items={recentBusinessItems}
              viewAllHref="/admin/businesses"
              emptyMessage="No businesses yet"
              emptyIcon="Building2"
            />

            <AdminRecentActivity
              title="Recent Events"
              icon="Calendar"
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              items={recentEventItems}
              viewAllHref="/admin/events"
              emptyMessage="No events yet"
              emptyIcon="Calendar"
            />

            <AdminRecentActivity
              title="Recent Reviews"
              icon="Star"
              iconColor="text-yellow-600"
              iconBg="bg-yellow-100"
              items={recentReviewItems}
              viewAllHref="/admin/reviews"
              emptyMessage="No reviews yet"
              emptyIcon="Star"
            />

            <AdminRecentActivity
              title="Tourism Experiences"
              icon="Compass"
              iconColor="text-cyan-600"
              iconBg="bg-cyan-100"
              items={recentTourismItems}
              viewAllHref="/admin/tourism"
              emptyMessage="No experiences yet"
              emptyIcon="Compass"
            />
          </div>
        </section>

        {/* Performance Insights */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Performance Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-amber-500" size={18} />
                <h3 className="font-semibold text-slate-900">Top Performers</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Most Viewed Category</span>
                  <span className="text-sm font-medium text-slate-900">Businesses</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Total Engagement</span>
                  <span className="text-sm font-medium text-slate-900">
                    {(totalTourismInquiries + totalRentalInquiries).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Avg. Rating</span>
                  <span className="text-sm font-medium text-slate-900">4.5 ★</span>
                </div>
              </div>
            </div>

            {/* Content Health */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-emerald-500" size={18} />
                <h3 className="font-semibold text-slate-900">Content Health</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Verified Businesses</span>
                  <span className="text-sm font-medium text-emerald-600">—</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Pending Reviews</span>
                  <span className="text-sm font-medium text-orange-600">{pendingTourism || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Flagged Items</span>
                  <span className={`text-sm font-medium ${flaggedRentals && flaggedRentals > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {flaggedRentals || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-emerald-400" size={18} />
                <h3 className="font-semibold">Platform Activity</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold">
                    {((totalBusinesses || 0) + (totalEvents || 0) + (totalTourism || 0) + (totalRentals || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Views Today</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Engagement Rate</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
