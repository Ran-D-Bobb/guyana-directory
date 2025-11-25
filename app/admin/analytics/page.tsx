import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import {
  BarChart3,
  Eye,
  MessageCircle,
  Users,
  Building2,
  Calendar,
  Compass,
  Home,
  Activity,
  Target,
  Zap,
  Clock
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/admin')
  }

  // Fetch all analytics data in parallel
  const [
    { count: totalBusinesses },
    { count: totalEvents },
    { count: totalTourism },
    { count: totalRentals },
    { count: totalUsers },
    { count: totalReviews },
    { data: businessesData },
    { data: eventsData },
    { data: tourismData },
    { data: rentalsData },
    { data: topBusinesses },
    { data: topTourism },
    { data: topRentals },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('tourism_experiences').select('*', { count: 'exact', head: true }),
    supabase.from('rentals').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('view_count, whatsapp_clicks, rating, is_verified, is_featured'),
    supabase.from('events').select('view_count, whatsapp_clicks, interest_count'),
    supabase.from('tourism_experiences').select('view_count, booking_inquiry_count, is_approved'),
    supabase.from('rentals').select('view_count, inquiry_count, save_count, is_flagged'),
    supabase.from('businesses')
      .select('name, slug, view_count, whatsapp_clicks')
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('tourism_experiences')
      .select('name, slug, view_count, booking_inquiry_count')
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('rentals')
      .select('name, slug, view_count, inquiry_count')
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate totals
  const businessViews = businessesData?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0
  const businessClicks = businessesData?.reduce((sum, b) => sum + (b.whatsapp_clicks || 0), 0) || 0
  const eventViews = eventsData?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
  const eventClicks = eventsData?.reduce((sum, e) => sum + (e.whatsapp_clicks || 0), 0) || 0
  const eventInterests = eventsData?.reduce((sum, e) => sum + (e.interest_count || 0), 0) || 0
  const tourismViews = tourismData?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0
  const tourismInquiries = tourismData?.reduce((sum, t) => sum + (t.booking_inquiry_count || 0), 0) || 0
  const rentalViews = rentalsData?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
  const rentalInquiries = rentalsData?.reduce((sum, r) => sum + (r.inquiry_count || 0), 0) || 0
  const rentalSaves = rentalsData?.reduce((sum, r) => sum + (r.save_count || 0), 0) || 0

  const totalViews = businessViews + eventViews + tourismViews + rentalViews
  const totalEngagement = businessClicks + eventClicks + tourismInquiries + rentalInquiries

  // Calculate percentages
  const verifiedBusinesses = businessesData?.filter(b => b.is_verified).length || 0
  const featuredBusinesses = businessesData?.filter(b => b.is_featured).length || 0
  const approvedTourism = tourismData?.filter(t => t.is_approved).length || 0
  const flaggedRentals = rentalsData?.filter(r => r.is_flagged).length || 0

  // Average rating
  const avgRating = businessesData && businessesData.length > 0
    ? (businessesData.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / businessesData.filter(b => b.rating).length).toFixed(1)
    : '0.0'

  // Engagement rate (clicks/views)
  const engagementRate = totalViews > 0
    ? ((totalEngagement / totalViews) * 100).toFixed(1)
    : '0.0'

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Analytics"
        subtitle="Platform performance and engagement metrics"
      />

      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Overview Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminStatCard
              label="Total Listings"
              value={(totalBusinesses || 0) + (totalEvents || 0) + (totalTourism || 0) + (totalRentals || 0)}
              icon="Building2"
              color="emerald"
            />
            <AdminStatCard
              label="Total Views"
              value={totalViews}
              icon="Eye"
              color="blue"
            />
            <AdminStatCard
              label="Total Engagement"
              value={totalEngagement}
              icon="MessageCircle"
              color="purple"
            />
            <AdminStatCard
              label="Engagement Rate"
              value={`${engagementRate}%`}
              icon="TrendingUp"
              color="cyan"
            />
          </div>
        </section>

        {/* Content Breakdown */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Content Breakdown</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Building2 className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalBusinesses || 0}</p>
                  <p className="text-sm text-slate-500">Businesses</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Views</span>
                  <span className="font-medium text-slate-700">{businessViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp Clicks</span>
                  <span className="font-medium text-slate-700">{businessClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified</span>
                  <span className="font-medium text-emerald-600">{verifiedBusinesses}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalEvents || 0}</p>
                  <p className="text-sm text-slate-500">Events</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Views</span>
                  <span className="font-medium text-slate-700">{eventViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp Clicks</span>
                  <span className="font-medium text-slate-700">{eventClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interests</span>
                  <span className="font-medium text-purple-600">{eventInterests}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-xl">
                  <Compass className="text-cyan-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalTourism || 0}</p>
                  <p className="text-sm text-slate-500">Tourism</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Views</span>
                  <span className="font-medium text-slate-700">{tourismViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inquiries</span>
                  <span className="font-medium text-slate-700">{tourismInquiries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium text-cyan-600">{approvedTourism}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Home className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalRentals || 0}</p>
                  <p className="text-sm text-slate-500">Rentals</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Views</span>
                  <span className="font-medium text-slate-700">{rentalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inquiries</span>
                  <span className="font-medium text-slate-700">{rentalInquiries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saves</span>
                  <span className="font-medium text-blue-600">{rentalSaves}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Key Metrics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              label="Avg. Rating"
              value={avgRating}
              icon="TrendingUp"
              color="emerald"
              size="sm"
            />
            <AdminStatCard
              label="Featured"
              value={featuredBusinesses}
              icon="Sparkles"
              color="pink"
              size="sm"
            />
            <AdminStatCard
              label="Verified"
              value={verifiedBusinesses}
              icon="CheckCircle"
              color="blue"
              size="sm"
            />
            <AdminStatCard
              label="Flagged"
              value={flaggedRentals}
              icon="Flag"
              color="red"
              size="sm"
            />
          </div>
        </section>

        {/* Top Performers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Top Performers</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Businesses */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
                <div className="flex items-center gap-2">
                  <Building2 className="text-emerald-600" size={18} />
                  <h3 className="font-semibold text-emerald-900">Top Businesses</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {topBusinesses && topBusinesses.length > 0 ? (
                  topBusinesses.map((business, index) => (
                    <div key={business.slug} className="px-5 py-3 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{business.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {business.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} /> {business.whatsapp_clicks || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm text-slate-500">
                    No businesses yet
                  </div>
                )}
              </div>
            </div>

            {/* Top Tourism */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-cyan-100/50">
                <div className="flex items-center gap-2">
                  <Compass className="text-cyan-600" size={18} />
                  <h3 className="font-semibold text-cyan-900">Top Tourism</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {topTourism && topTourism.length > 0 ? (
                  topTourism.map((exp, index) => (
                    <div key={exp.slug} className="px-5 py-3 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{exp.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {exp.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} /> {exp.booking_inquiry_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm text-slate-500">
                    No tourism experiences yet
                  </div>
                )}
              </div>
            </div>

            {/* Top Rentals */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <div className="flex items-center gap-2">
                  <Home className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-blue-900">Top Rentals</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {topRentals && topRentals.length > 0 ? (
                  topRentals.map((rental, index) => (
                    <div key={rental.slug} className="px-5 py-3 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{rental.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {rental.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} /> {rental.inquiry_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm text-slate-500">
                    No rentals yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Users */}
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((u) => (
                  <div key={u.id} className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-medium text-slate-900 truncate">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    <p className="text-xs text-slate-400 mt-1">Joined {formatDate(u.created_at)}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-5 p-8 text-center text-sm text-slate-500">
                  No users yet
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
