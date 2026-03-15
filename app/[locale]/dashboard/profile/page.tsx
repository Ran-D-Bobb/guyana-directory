import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Bell,
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  Award,
  Crown,
  Trophy,
  Sparkles,
  ExternalLink,
  TrendingUp
} from 'lucide-react'
import { FollowedCategories } from '@/components/FollowedCategories'

// Badge tier data
const badgeTiers = [
  { tier: 'newcomer', label: 'Newcomer', min: 1, icon: Star, color: 'from-amber-400 to-orange-500' },
  { tier: 'contributor', label: 'Contributor', min: 3, icon: Award, color: 'from-slate-400 to-slate-600' },
  { tier: 'local_expert', label: 'Local Expert', min: 6, icon: Trophy, color: 'from-yellow-400 to-amber-500' },
  { tier: 'top_reviewer', label: 'Top Reviewer', min: 10, icon: Crown, color: 'from-purple-500 to-indigo-600' },
]

function getBadgeInfo(reviewCount: number) {
  if (reviewCount >= 10) return badgeTiers[3]
  if (reviewCount >= 6) return badgeTiers[2]
  if (reviewCount >= 3) return badgeTiers[1]
  if (reviewCount >= 1) return badgeTiers[0]
  return null
}

function getNextBadge(reviewCount: number) {
  if (reviewCount >= 10) return null
  if (reviewCount >= 6) return { ...badgeTiers[3], needed: 10 - reviewCount }
  if (reviewCount >= 3) return { ...badgeTiers[2], needed: 6 - reviewCount }
  if (reviewCount >= 1) return { ...badgeTiers[1], needed: 3 - reviewCount }
  return { ...badgeTiers[0], needed: 1 - reviewCount }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's reviews with business info
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      businesses (
        name,
        slug,
        category:categories(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's followed categories
  const { data: followedCategories } = await supabase
    .rpc('get_followed_categories_with_counts', { p_user_id: user.id })

  const reviewCount = reviews?.length || 0
  const currentBadge = getBadgeInfo(reviewCount)
  const nextBadge = getNextBadge(reviewCount)
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Recently'

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
      {/* Hero Header with Gradient Mesh */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-mesh-dark opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--jungle-800))]/90 via-[hsl(var(--jungle-700))]/80 to-[hsl(var(--jungle-900))]/95" />

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-[hsl(var(--gold-400))]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[hsl(var(--jungle-400))]/10 rounded-full blur-3xl" />

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-32">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Profile info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar with animated ring */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--gold-400))] via-[hsl(var(--jungle-400))] to-[hsl(var(--gold-400))] rounded-full opacity-75 blur group-hover:opacity-100 transition-opacity animate-gradient-shift" />
              <div className="relative">
                {user.user_metadata.avatar_url ? (
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/20">
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt={profile?.name || 'User'}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[hsl(var(--jungle-400))] to-[hsl(var(--jungle-600))] flex items-center justify-center ring-4 ring-white/20">
                    <span className="text-4xl font-bold text-white font-display">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-[hsl(var(--jungle-800))] animate-pulse" />
            </div>

            {/* Name and meta */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white font-display mb-2">
                {profile?.name || 'Explorer'}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Guyana
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </span>
              </div>
            </div>

            {/* Current badge floating */}
            {currentBadge && (
              <div className="glass-dark rounded-2xl px-5 py-3 flex items-center gap-3 animate-fade-in-scale">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentBadge.color} flex items-center justify-center shadow-lg`}>
                  <currentBadge.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Current Rank</p>
                  <p className="text-white font-semibold">{currentBadge.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Floating above fold */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-3 gap-4">
          {/* Reviews */}
          <div className="card-elevated rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[hsl(var(--jungle-100))] to-[hsl(var(--jungle-200))] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-[hsl(var(--jungle-600))]" />
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--jungle-900))] font-display">{reviewCount}</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>

          {/* Avg Rating */}
          <div className="card-elevated rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--jungle-900))] font-display">{avgRating}</p>
            <p className="text-sm text-gray-500">Avg Rating</p>
          </div>

          {/* Following */}
          <div className="card-elevated rounded-2xl p-5 text-center group hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--jungle-900))] font-display">{followedCategories?.length || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Badge Journey Section */}
        <section className="card-elevated rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(var(--jungle-800))] to-[hsl(var(--jungle-700))] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--gold-400))]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Reviewer Journey</h2>
                  <p className="text-sm text-white/60">Your path to becoming a Top Reviewer</p>
                </div>
              </div>
              {nextBadge && (
                <div className="hidden sm:flex items-center gap-2 glass-dark rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--gold-400))]" />
                  <span className="text-sm text-white">
                    <span className="font-semibold text-[hsl(var(--gold-400))]">{nextBadge.needed}</span> more to {nextBadge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Progress track */}
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full" />
              <div
                className="absolute top-6 left-6 h-1 bg-gradient-to-r from-[hsl(var(--jungle-500))] to-[hsl(var(--gold-400))] rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (reviewCount / 10) * 100)}%`,
                  maxWidth: 'calc(100% - 3rem)'
                }}
              />

              {/* Badge milestones */}
              <div className="relative flex justify-between">
                {badgeTiers.map((badge) => {
                  const isUnlocked = reviewCount >= badge.min
                  const isCurrent = currentBadge?.tier === badge.tier
                  const BadgeIcon = badge.icon

                  return (
                    <div
                      key={badge.tier}
                      className={`flex flex-col items-center transition-all duration-300 ${
                        isCurrent ? 'scale-110' : ''
                      }`}
                    >
                      <div className={`
                        relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${isUnlocked
                          ? `bg-gradient-to-br ${badge.color} shadow-lg ${isCurrent ? 'animate-glow-pulse ring-4 ring-[hsl(var(--gold-400))]/30' : ''}`
                          : 'bg-gray-100'
                        }
                      `}>
                        <BadgeIcon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--gold-400))] rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white">✓</span>
                          </div>
                        )}
                      </div>
                      <p className={`mt-3 text-xs font-medium text-center ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                        {badge.label}
                      </p>
                      <p className={`text-[10px] ${isUnlocked ? 'text-[hsl(var(--jungle-600))]' : 'text-gray-400'}`}>
                        {badge.min}+ reviews
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left Column - Following & Reviews */}
          <div className="lg:col-span-3 space-y-8">

            {/* Followed Categories */}
            <section className="card-elevated rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-display">Following</h2>
                    <p className="text-sm text-gray-500">{followedCategories?.length || 0} categories</p>
                  </div>
                </div>
                <Link
                  href="/businesses"
                  className="text-sm text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-700))] font-medium flex items-center gap-1 group"
                >
                  Browse all
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <FollowedCategories
                categories={followedCategories || []}
                userId={user.id}
                variant="grid"
              />
            </section>

            {/* Reviews Timeline */}
            <section className="card-elevated rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">My Reviews</h2>
                  <p className="text-sm text-gray-500">{reviewCount} reviews written</p>
                </div>
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--jungle-200))] via-[hsl(var(--jungle-100))] to-transparent" />

                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="relative pl-12 group animate-fade-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-3 top-2 w-4 h-4 rounded-full bg-white border-2 border-[hsl(var(--jungle-300))] group-hover:border-[hsl(var(--jungle-500))] group-hover:scale-125 transition-all" />

                        <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-[hsl(var(--jungle-50))] border border-transparent group-hover:border-[hsl(var(--jungle-100))] transition-all">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <Link
                              href={`/businesses/${review.businesses?.slug}`}
                              className="font-semibold text-gray-900 hover:text-[hsl(var(--jungle-600))] transition-colors line-clamp-1"
                            >
                              {review.businesses?.name}
                            </Link>
                            <div className="flex items-center gap-1 shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                              {review.comment}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'Recently'}
                            </span>
                            {review.businesses?.category?.name && (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                  {review.businesses.category.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-4">You haven&apos;t written any reviews yet</p>
                  <Link
                    href="/businesses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--jungle-500))] hover:bg-[hsl(var(--jungle-600))] text-white rounded-xl font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start exploring
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Quick Actions & Tips */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Stats Mini */}
            <div className="card-elevated rounded-2xl p-5 bg-gradient-to-br from-[hsl(var(--jungle-50))] to-white">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This month</span>
                  <span className="text-sm font-semibold text-[hsl(var(--jungle-600))]">
                    {reviews?.filter(r => {
                      if (!r.created_at) return false
                      const reviewDate = new Date(r.created_at)
                      const now = new Date()
                      return reviewDate.getMonth() === now.getMonth() &&
                             reviewDate.getFullYear() === now.getFullYear()
                    }).length || 0} reviews
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">5-star reviews</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {reviews?.filter(r => r.rating === 5).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categories reviewed</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {new Set(reviews?.map(r => r.businesses?.category?.name).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Tip Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--jungle-700))] to-[hsl(var(--jungle-800))] p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--gold-400))]/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--gold-400))]" />
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-2">Pro Tip</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Detailed reviews with specific experiences help fellow explorers make better decisions.
                  Share what made your visit special!
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card-elevated rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/businesses"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--jungle-100))] flex items-center justify-center group-hover:bg-[hsl(var(--jungle-200))] transition-colors">
                    <MapPin className="w-4.5 h-4.5 text-[hsl(var(--jungle-600))]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[hsl(var(--jungle-700))]">
                    Explore Businesses
                  </span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Calendar className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">
                    Upcoming Events
                  </span>
                </Link>
                <Link
                  href="/tourism"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Sparkles className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    Tourism Experiences
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-24 lg:h-8" />
    </div>
  )
}
