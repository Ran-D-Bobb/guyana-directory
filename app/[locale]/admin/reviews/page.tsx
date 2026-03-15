import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { ReviewList } from '@/components/admin/ReviewList'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rating?: string; business?: string }>
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
  const ratingFilter = params.rating
  const businessFilter = params.business

  // Build query
  let query = supabase
    .from('reviews')
    .select(`
      *,
      businesses(id, name, slug),
      profiles(id, name, email, photo)
    `)
    .order('created_at', { ascending: false })

  // Apply rating filter
  if (ratingFilter) {
    const rating = parseInt(ratingFilter)
    if (rating >= 1 && rating <= 5) {
      query = query.eq('rating', rating)
    }
  }

  // Apply business filter
  if (businessFilter) {
    query = query.eq('business_id', businessFilter)
  }

  const { data: reviews, error } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
  }

  // Get businesses for filter dropdown
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .order('name')

  // Apply search filter client-side
  const filteredReviews = searchQuery
    ? reviews?.filter(r =>
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.businesses?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reviews

  // Calculate stats
  const totalReviews = reviews?.length || 0
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'
  const fiveStarCount = reviews?.filter(r => r.rating === 5).length || 0
  const lowRatingCount = reviews?.filter(r => r.rating <= 2).length || 0
  const totalHelpfulVotes = reviews?.reduce((sum, r) => sum + (r.helpful_count || 0), 0) || 0

  // Check if any filter is active
  const hasActiveFilters = !!(searchQuery || ratingFilter || businessFilter)

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Reviews"
        subtitle={`Manage ${totalReviews} customer reviews`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Low Rating Alert */}
        {lowRatingCount > 0 && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Low Rating Reviews</h3>
              <p className="text-sm text-orange-700">
                {lowRatingCount} review{lowRatingCount !== 1 ? 's' : ''} with 2 stars or less may need attention
              </p>
            </div>
            <Link
              href="/admin/reviews?rating=1"
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
            >
              View Low Ratings
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Reviews"
            value={totalReviews}
            icon="Star"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Average Rating"
            value={avgRating}
            icon="TrendingUp"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="5-Star Reviews"
            value={fiveStarCount}
            icon="Sparkles"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Low Ratings (1-2)"
            value={lowRatingCount}
            icon="AlertTriangle"
            color="orange"
            size="sm"
          />
          <AdminStatCard
            label="Helpful Votes"
            value={totalHelpfulVotes}
            icon="ThumbsUp"
            color="cyan"
            size="sm"
          />
        </div>

        {/* Filters & Review List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search reviews..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-yellow-300 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Rating Filter */}
              <select
                name="rating"
                defaultValue={ratingFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-yellow-300 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all min-w-[150px]"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              {/* Business Filter */}
              <select
                name="business"
                defaultValue={businessFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-yellow-300 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all min-w-[200px]"
              >
                <option value="">All Businesses</option>
                {businesses?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/reviews"
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
              Showing {filteredReviews?.length || 0} reviews
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Review List with Bulk Selection */}
          <ReviewList
            reviews={filteredReviews || []}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>
    </div>
  )
}
