import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users,
  Building2,
  Star,
  MessageCircle,
  Eye,
  TrendingUp,
  Plus,
  Settings,
  Calendar,
  Compass,
  Home,
  Flag
} from 'lucide-react'

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
      .select('whatsapp_clicks, view_count')
      .order('created_at', { ascending: false }),
    supabase
      .from('events')
      .select('view_count, whatsapp_clicks, interest_count')
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

  // Calculate total clicks and views
  const totalWhatsAppClicks = businesses?.reduce((sum, b) => sum + (b.whatsapp_clicks || 0), 0) || 0
  const totalViews = businesses?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0

  // Calculate event analytics
  const totalEventViews = events?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
  const totalEventClicks = events?.reduce((sum, e) => sum + (e.whatsapp_clicks || 0), 0) || 0
  const totalEventInterests = events?.reduce((sum, e) => sum + (e.interest_count || 0), 0) || 0

  // Calculate tourism analytics
  const totalTourismViews = tourismData?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0
  const totalTourismInquiries = tourismData?.reduce((sum, t) => sum + (t.booking_inquiry_count || 0), 0) || 0

  // Calculate rentals analytics
  const totalRentalViews = rentalsData?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
  const totalRentalInquiries = rentalsData?.reduce((sum, r) => sum + (r.inquiry_count || 0), 0) || 0

  const stats = [
    {
      label: 'Total Businesses',
      value: totalBusinesses || 0,
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Events',
      value: totalEvents || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tourism Experiences',
      value: totalTourism || 0,
      icon: Compass,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Total Rentals',
      value: totalRentals || 0,
      icon: Home,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total Reviews',
      value: totalReviews || 0,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Pending Approvals',
      value: pendingTourism || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Flagged Rentals',
      value: flaggedRentals || 0,
      icon: Flag,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Business Views',
      value: totalViews,
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Event Views',
      value: totalEventViews,
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tourism Views',
      value: totalTourismViews,
      icon: Eye,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Rental Views',
      value: totalRentalViews,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Business Clicks',
      value: totalWhatsAppClicks,
      icon: MessageCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Event Clicks',
      value: totalEventClicks,
      icon: MessageCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tourism Inquiries',
      value: totalTourismInquiries,
      icon: MessageCircle,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Rental Inquiries',
      value: totalRentalInquiries,
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Event Interests',
      value: totalEventInterests,
      icon: TrendingUp,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <Settings size={16} />
              Admin Dashboard
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Platform Management
          </h1>
          <p className="text-xl text-emerald-50 max-w-2xl">
            Monitor performance, manage content, and grow your business directory
          </p>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 45C480 50 600 40 720 35C840 30 960 30 1080 35C1200 40 1320 50 1380 55L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Link
            href="/admin/businesses/create"
            className="group relative bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Plus size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Add New Business</h3>
                <p className="text-emerald-50 text-sm">Create a business listing</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/businesses"
            className="group relative bg-white text-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-gray-100 group-hover:bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-all duration-300">
                <Settings size={28} className="text-gray-700 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Manage Businesses</h3>
                <p className="text-gray-600 text-sm">Edit, verify, and feature</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/events"
            className="group relative bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Calendar size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Manage Events</h3>
                <p className="text-purple-50 text-sm">Feature and moderate events</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/tourism"
            className="group relative bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Compass size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Manage Tourism</h3>
                <p className="text-cyan-50 text-sm">
                  Approve and feature
                  {pendingTourism && pendingTourism > 0 && (
                    <span className="block font-semibold mt-1">
                      {pendingTourism} pending
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/rentals"
            className={`group relative rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
              flaggedRentals && flaggedRentals > 0
                ? 'bg-gradient-to-br from-red-600 to-pink-600 text-white'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Home size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Manage Rentals</h3>
                <p className="text-blue-50 text-sm">
                  Review flags and moderate
                  {flaggedRentals && flaggedRentals > 0 && (
                    <span className="block font-semibold mt-1">
                      {flaggedRentals} flagged
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Platform Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`${stat.bg} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <Icon className={stat.color} size={28} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Recent Activity</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Recent Businesses */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Businesses</h3>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Building2 size={18} className="text-emerald-600" />
              </div>
            </div>
            <div className="space-y-4">
              {recentBusinesses && recentBusinesses.length > 0 ? (
                recentBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="group pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        href={`/businesses/${business.slug}`}
                        className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1 flex-1"
                      >
                        {business.name}
                      </Link>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {business.is_verified && (
                          <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Verified
                          </span>
                        )}
                        {business.is_featured && (
                          <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {business.categories?.name} • {business.regions?.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye size={14} />
                        <span className="font-medium">{business.view_count || 0}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        <span className="font-medium">{business.whatsapp_clicks || 0}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No businesses yet</p>
                </div>
              )}
            </div>
            <Link
              href="/admin/businesses"
              className="group flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
            >
              View All Businesses
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar size={18} className="text-purple-600" />
              </div>
            </div>
            <div className="space-y-4">
              {recentEvents && recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1 flex-1"
                      >
                        {event.title}
                      </Link>
                      {event.is_featured && (
                        <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.event_categories?.name || 'Uncategorized'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye size={14} />
                        <span className="font-medium">{event.view_count || 0}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp size={14} />
                        <span className="font-medium">{event.interest_count || 0}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No events yet</p>
                </div>
              )}
            </div>
            <Link
              href="/admin/events"
              className="group flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              View All Events
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Reviews</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Star size={18} className="text-yellow-600" />
              </div>
            </div>
            <div className="space-y-4">
              {recentReviews && recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {review.profiles?.name || 'Anonymous'}
                        </p>
                        <Link
                          href={`/businesses/${review.businesses?.slug}`}
                          className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors line-clamp-1"
                        >
                          {review.businesses?.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Star size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tourism Experiences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Tourism Experiences</h3>
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Compass size={18} className="text-cyan-600" />
              </div>
            </div>
            <div className="space-y-4">
              {recentTourism && recentTourism.length > 0 ? (
                recentTourism.map((experience) => (
                  <div
                    key={experience.id}
                    className="group pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        href={`/tourism/${experience.slug}`}
                        className="font-semibold text-gray-900 hover:text-cyan-600 transition-colors line-clamp-1 flex-1"
                      >
                        {experience.name}
                      </Link>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {!experience.is_approved && (
                          <span className="inline-flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            Pending
                          </span>
                        )}
                        {experience.is_featured && (
                          <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {experience.tourism_categories?.name}
                      {experience.regions?.name && (
                        <> • {experience.regions.name}</>
                      )}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye size={14} />
                        <span className="font-medium">{experience.view_count || 0}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        <span className="font-medium">{experience.booking_inquiry_count || 0}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Compass size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No tourism experiences yet</p>
                </div>
              )}
            </div>
            <Link
              href="/admin/tourism"
              className="group flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100 text-cyan-600 hover:text-cyan-700 font-medium text-sm transition-colors"
            >
              View All Tourism
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
