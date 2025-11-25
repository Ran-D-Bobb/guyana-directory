import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  Home,
  Eye,
  MessageCircle,
  Star,
  Heart,
  Flag,
  AlertTriangle,
  Building2,
  Filter,
  Search,
  ExternalLink,
  Sparkles,
  EyeOff,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { RentalActions } from '@/components/admin/AdminActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; featured?: string; flagged?: string; q?: string }>
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

  // Build query
  let query = supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.category) {
    query = query.eq('category_id', params.category)
  }
  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (params.featured === 'false') {
    query = query.eq('is_featured', false)
  }
  if (params.flagged === 'true') {
    query = query.eq('is_flagged', true)
  }

  const { data: rentals, error } = await query

  if (error) {
    console.error('Error fetching rentals:', error)
  }

  // Get categories for filter
  const { data: categories } = await supabase
    .from('rental_categories')
    .select('*')
    .order('name')

  // Get flagged rentals count
  const { count: flaggedCount } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)

  // Apply search filter client-side
  const filteredRentals = searchQuery
    ? rentals?.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rentals

  // Calculate stats
  const totalRentals = rentals?.length || 0
  const totalViews = rentals?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
  const totalInquiries = rentals?.reduce((sum, r) => sum + (r.inquiry_count || 0), 0) || 0
  const totalSaves = rentals?.reduce((sum, r) => sum + (r.save_count || 0), 0) || 0

  // Separate flagged listings
  const flaggedListings = filteredRentals?.filter(r => r.is_flagged) || []
  const regularListings = filteredRentals?.filter(r => !r.is_flagged) || []

  // Check if any filter is active
  const hasActiveFilters = params.category || params.featured || params.flagged || searchQuery

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Rentals"
        subtitle={`Manage ${totalRentals} rental listings`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Flagged Alert */}
        {flaggedCount && flaggedCount > 0 && (
          <Link
            href="/admin/rentals?flagged=true"
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl hover:shadow-lg hover:border-red-300 transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Flagged Listings</h3>
              <p className="text-sm text-red-700">
                {flaggedCount} rental{flaggedCount !== 1 ? 's' : ''} flagged by users requiring review
              </p>
            </div>
            <ArrowUpRight className="text-red-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={20} />
          </Link>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Rentals"
            value={totalRentals}
            icon="Home"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Total Views"
            value={totalViews}
            icon="Eye"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Inquiries"
            value={totalInquiries}
            icon="MessageCircle"
            color="cyan"
            size="sm"
          />
          <AdminStatCard
            label="Saves"
            value={totalSaves}
            icon="Heart"
            color="pink"
            size="sm"
          />
          <AdminStatCard
            label="Flagged"
            value={flaggedCount || 0}
            icon="Flag"
            color="red"
            size="sm"
          />
        </div>

        {/* Flagged Listings Section */}
        {flaggedListings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              <h2 className="text-lg font-semibold text-red-900">
                Flagged Listings ({flaggedListings.length})
              </h2>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border-2 border-red-200 overflow-hidden">
              <div className="p-4 border-b border-red-200 bg-red-100/50">
                <p className="text-sm text-red-700">
                  These listings have been flagged by users. Properties with 5+ flags are auto-hidden.
                </p>
              </div>
              <div className="divide-y divide-red-100">
                {flaggedListings.map((rental) => (
                  <div
                    key={rental.id}
                    className="p-4 bg-white/50 hover:bg-white/80 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <Link
                            href={`/rentals/${rental.slug}`}
                            target="_blank"
                            className="group text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                          >
                            {rental.name}
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>

                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              <Flag size={12} />
                              {rental.flag_count} flags
                            </span>
                            {!rental.is_approved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
                                <EyeOff size={12} />
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={14} className="text-slate-400" />
                            {rental.rental_categories?.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Eye size={14} className="text-slate-400" />
                            {rental.view_count} views
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle size={14} className="text-slate-400" />
                            {rental.inquiry_count} inquiries
                          </span>
                        </div>

                        {/* Flag Reasons */}
                        {rental.flag_reasons && Array.isArray(rental.flag_reasons) && rental.flag_reasons.length > 0 && (
                          <div className="bg-red-100/50 border border-red-200 rounded-lg p-3 mb-3">
                            <p className="text-xs font-semibold text-red-800 mb-2">Flag Reasons:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(rental.flag_reasons as string[]).map((reason, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <RentalActions
                        rentalId={rental.id}
                        rentalName={rental.name}
                        isFeatured={rental.is_featured ?? false}
                        isApproved={rental.is_approved ?? false}
                        isFlagged={rental.is_flagged ?? false}
                        flagCount={rental.flag_count ?? 0}
                        flagReasons={rental.flag_reasons as string[] | null}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Listings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search rentals..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <select
                name="category"
                defaultValue={params.category || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all min-w-[180px]"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Featured Filter */}
              <select
                name="featured"
                defaultValue={params.featured || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Listings</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>

              {/* Flagged Filter */}
              <select
                name="flagged"
                defaultValue={params.flagged || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="true">Flagged Only</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/rentals"
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
              Showing {regularListings.length} rentals
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Rental List */}
          <div className="divide-y divide-slate-100">
            {regularListings.length > 0 ? (
              regularListings.map((rental) => (
                <div
                  key={rental.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Link
                          href={`/rentals/${rental.slug}`}
                          target="_blank"
                          className="group text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {rental.name}
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <div className="flex flex-wrap gap-1.5">
                          {rental.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Sparkles size={12} />
                              Featured
                            </span>
                          )}
                          {rental.is_approved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              <CheckCircle size={12} />
                              Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
                              <EyeOff size={12} />
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-400" />
                          {rental.rental_categories?.name}
                        </span>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Eye size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{rental.view_count || 0}</span>
                          views
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <MessageCircle size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{rental.inquiry_count || 0}</span>
                          inquiries
                        </span>
                        {rental.rating && (
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="font-medium text-slate-700">{rental.rating.toFixed(1)}</span>
                            ({rental.review_count || 0})
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Heart size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{rental.save_count || 0}</span>
                          saves
                        </span>
                      </div>
                    </div>

                    <RentalActions
                      rentalId={rental.id}
                      rentalName={rental.name}
                      isFeatured={rental.is_featured ?? false}
                      isApproved={rental.is_approved ?? false}
                      isFlagged={rental.is_flagged ?? false}
                      flagCount={rental.flag_count ?? 0}
                      flagReasons={rental.flag_reasons as string[] | null}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No rentals found</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Rental listings will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
