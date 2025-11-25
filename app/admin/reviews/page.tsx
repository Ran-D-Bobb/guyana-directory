import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  Star,
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { ReviewActions } from '@/components/admin/AdminActionButtons'

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
  const hasActiveFilters = searchQuery || ratingFilter || businessFilter

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
    )
  }

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

          {/* Review List */}
          <div className="divide-y divide-slate-100">
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        {/* User Avatar */}
                        {review.profiles?.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.profiles.photo}
                            alt={review.profiles.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-slate-200">
                            <User className="w-5 h-5 text-slate-500" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">
                              {review.profiles?.name || 'Anonymous'}
                            </span>
                            {renderStars(review.rating)}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              review.rating >= 4
                                ? 'bg-emerald-100 text-emerald-700'
                                : review.rating === 3
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {review.rating}/5
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <Link
                              href={`/businesses/${review.businesses?.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors"
                            >
                              <Building2 size={14} />
                              {review.businesses?.name || 'Unknown Business'}
                              <ExternalLink size={12} className="opacity-50" />
                            </Link>
                            <span className="text-slate-300">|</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Comment */}
                      {review.comment ? (
                        <div className="bg-slate-50 rounded-xl p-4 mb-3">
                          <MessageSquare size={14} className="text-slate-400 mb-2" />
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {review.comment}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic mb-3">
                          No comment provided
                        </p>
                      )}

                      {/* Helpful Votes */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <ThumbsUp size={14} className="text-emerald-500" />
                          <span className="font-medium text-slate-700">{review.helpful_count || 0}</span>
                          helpful
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <ThumbsDown size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{review.not_helpful_count || 0}</span>
                          not helpful
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2">
                      <ReviewActions
                        reviewId={review.id}
                        reviewerName={review.profiles?.name || 'Anonymous'}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No reviews found</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Reviews will appear here when customers leave feedback'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
