import { createClient } from '@/lib/supabase/server'
import { PageViewTracker } from '@/components/PageViewTracker'
import { ReviewForm } from '@/components/ReviewForm'
import { RatingsBreakdown } from '@/components/RatingsBreakdown'
import { ReviewItem } from '@/components/ReviewItem'
import { BusinessResponseForm } from '@/components/BusinessResponseForm'
import { CollapsibleHours } from '@/components/CollapsibleHours'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  Sparkles,
  Calendar,
  Tag,
  Eye,
  MessageCircle,
  Share2,
  ChevronRight,
  Star
} from 'lucide-react'

// Default business image from Unsplash
const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80'

interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

interface BusinessHours {
  [day: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

function getCurrentDayStatus(hours: BusinessHours | null): { isOpen: boolean; statusText: string } {
  if (!hours) return { isOpen: false, statusText: 'Hours not available' }

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = now.getHours() * 100 + now.getMinutes()

  const todayHours = hours[dayName]
  if (!todayHours || todayHours.closed) {
    return { isOpen: false, statusText: 'Closed today' }
  }

  if (todayHours.open && todayHours.close) {
    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))

    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, statusText: `Open until ${todayHours.close}` }
    } else if (currentTime < openTime) {
      return { isOpen: false, statusText: `Opens at ${todayHours.open}` }
    }
  }

  return { isOpen: false, statusText: 'Closed now' }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Run user auth and business fetch in parallel (independent queries)
  const [userResult, businessResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('businesses')
      .select(`
        *,
        categories:category_id (name, slug, icon),
        regions:region_id (name),
        business_photos (id, image_url, is_primary, display_order),
        reviews (
          id, rating, comment, created_at, helpful_count, not_helpful_count, user_id,
          profiles:user_id (name, photo)
        )
      `)
      .eq('slug', slug)
      .single()
  ])

  const user = userResult.data.user
  const business = businessResult.data

  if (!business) {
    notFound()
  }

  // Extract photos and reviews from the combined query
  const photos = business.business_photos || []
  const reviews = business.reviews || []

  // Now fetch user-specific data and events in parallel (these depend on business.id)
  const now = new Date().toISOString()
  const reviewIds = reviews.map(r => r.id)

  const [userVotesResult, responsesResult, eventsResult] = await Promise.all([
    // User votes (only if user is logged in and there are reviews)
    user && reviewIds.length > 0
      ? supabase
          .from('review_helpful_votes')
          .select('review_id, is_helpful')
          .eq('user_id', user.id)
          .in('review_id', reviewIds)
      : Promise.resolve({ data: null }),
    // Review responses
    reviewIds.length > 0
      ? supabase
          .from('review_responses')
          .select(`*, profiles:user_id (name, photo)`)
          .in('review_id', reviewIds)
      : Promise.resolve({ data: null }),
    // Business events
    supabase
      .from('business_events')
      .select(`*, business_event_types:event_type_id (name, icon)`)
      .eq('business_id', business.id)
      .gte('end_date', now)
      .order('start_date', { ascending: true })
      .limit(5)
  ])

  const userVotes = userVotesResult.data
  const responses = responsesResult.data
  const businessEvents = eventsResult.data

  // Fetch user's own review if logged in
  const userReview = user && reviews.find(review => review.user_id === user.id)

  // Create a map of user votes for easy lookup
  const userVotesMap = new Map(userVotes?.map(v => [v.review_id, v]) || [])

  // Create a map of responses for easy lookup
  const responsesMap = new Map(responses?.map(r => [r.review_id, r]) || [])

  // Calculate rating breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating as 1 | 2 | 3 | 4 | 5]++
    }
  })

  // Check if current user is the business owner
  const isBusinessOwner = user && business.owner_id === user.id

  // Parse business hours if available
  const businessHours = business.hours as BusinessHours | null
  const { isOpen, statusText } = getCurrentDayStatus(businessHours)

  // Get primary photo or first photo or default
  // Sort photos by is_primary and display_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })
  const primaryPhoto = sortedPhotos[0]
  const heroImage = primaryPhoto?.image_url || DEFAULT_BUSINESS_IMAGE
  const galleryPhotos = sortedPhotos.slice(0, 4)

  return (
    <>
      {/* Track page view */}
      <PageViewTracker businessId={business.id} />

      <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
        {/* Floating Back Button */}
        <div className="fixed top-4 left-4 z-50 animate-fade-up">
          <Link
            href="/"
            className="glass flex items-center gap-2 px-4 py-2.5 rounded-full text-[hsl(var(--jungle-800))] hover:bg-white/90 transition-all duration-300 shadow-lg group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Hero Section with Photo Gallery */}
        <section className="relative h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[hsl(var(--jungle-50))] z-10" />

          {/* Main hero image with Ken Burns */}
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={business.name}
              fill
              className="object-cover animate-ken-burns-slow"
              sizes="100vw"
              priority
            />
          </div>

          {/* Gradient mesh overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--jungle-900))]/60 via-transparent to-[hsl(var(--gold-500))]/20 z-10" />

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4 animate-fade-up">
                {business.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[hsl(var(--gold-500))] text-[hsl(var(--jungle-900))] rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured
                  </span>
                )}
                {business.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/90 text-[hsl(var(--jungle-700))] rounded-full shadow-lg">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Open Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-800/80 text-white rounded-full shadow-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {statusText}
                  </span>
                )}
              </div>

              {/* Category */}
              {business.categories && (
                <Link
                  href={`/businesses/category/${business.categories.slug}`}
                  className="inline-block mb-3 animate-fade-up delay-100"
                >
                  <span className="text-sm font-medium text-white/90 hover:text-white transition-colors tracking-wide uppercase">
                    {business.categories.name}
                  </span>
                </Link>
              )}

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 animate-fade-up delay-200 drop-shadow-2xl">
                {business.name}
              </h1>

              {/* Rating & Location Row */}
              <div className="flex flex-wrap items-center gap-4 text-white/90 animate-fade-up delay-300">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(business.rating ?? 0)
                            ? 'fill-[hsl(var(--gold-400))] text-[hsl(var(--gold-400))]'
                            : 'text-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {(business.rating ?? 0) > 0 ? (business.rating ?? 0).toFixed(1) : 'New'}
                  </span>
                  {(business.review_count ?? 0) > 0 && (
                    <span className="text-white/70">
                      ({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>

                <span className="text-white/40">|</span>

                {/* Location */}
                {business.regions && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{business.regions.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery Thumbnails (if multiple photos) */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 hidden lg:flex gap-2 animate-fade-up delay-400">
              {galleryPhotos.slice(1, 4).map((photo, idx) => (
                <div
                  key={photo.id}
                  className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl hover:border-white/60 transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src={photo.image_url}
                    alt={`${business.name} photo ${idx + 2}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {galleryPhotos.length > 3 && (
                <button className="w-20 h-20 rounded-xl bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-semibold hover:bg-black/60 transition-all">
                  +{galleryPhotos.length - 3}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Main Content */}
        <main className="relative z-20 -mt-8 lg:-mt-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">

                {/* Quick Actions Bar (Mobile) */}
                <div className="lg:hidden glass rounded-2xl p-4 shadow-xl animate-fade-up">
                  <div className="flex items-center justify-center gap-6">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex flex-col items-center gap-1 text-[hsl(var(--jungle-700))]">
                        <Phone className="w-5 h-5" />
                        <span className="text-xs">Call</span>
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className="flex flex-col items-center gap-1 text-[hsl(var(--jungle-700))]">
                        <Mail className="w-5 h-5" />
                        <span className="text-xs">Email</span>
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[hsl(var(--jungle-700))]">
                        <Globe className="w-5 h-5" />
                        <span className="text-xs">Website</span>
                      </a>
                    )}
                    <button className="flex flex-col items-center gap-1 text-[hsl(var(--jungle-700))]">
                      <Share2 className="w-5 h-5" />
                      <span className="text-xs">Share</span>
                    </button>
                  </div>
                </div>

                {/* About Section */}
                <article className="card-elevated rounded-2xl p-6 lg:p-8 animate-fade-up delay-100">
                  <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))] mb-4">
                    About
                  </h2>
                  {business.description ? (
                    <p className="text-[hsl(var(--jungle-700))] leading-relaxed whitespace-pre-line text-lg">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-[hsl(var(--muted-foreground))] italic">
                      No description available yet.
                    </p>
                  )}

                  {/* Address */}
                  {business.address && (
                    <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-[hsl(var(--jungle-100))]">
                          <MapPin className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--jungle-800))]">Address</p>
                          <p className="text-[hsl(var(--jungle-600))] mt-0.5">{business.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>

                {/* Business Hours */}
                {businessHours && (
                  <CollapsibleHours
                    businessHours={businessHours}
                    isOpen={isOpen}
                    statusText={statusText}
                  />
                )}

                {/* Business Events & Offers */}
                {businessEvents && businessEvents.length > 0 && (
                  <article className="card-elevated rounded-2xl p-6 lg:p-8 animate-fade-up delay-300">
                    <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))] flex items-center gap-3 mb-6">
                      <Calendar className="w-6 h-6 text-[hsl(var(--gold-500))]" />
                      Events & Offers
                    </h2>
                    <div className="space-y-4">
                      {businessEvents.map((event) => {
                        const startDate = new Date(event.start_date)
                        const endDate = new Date(event.end_date)
                        const isOngoing = startDate <= new Date() && endDate >= new Date()

                        return (
                          <div
                            key={event.id}
                            className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--gold-400))] hover:shadow-lg transition-all duration-300"
                          >
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(var(--gold-100))] to-transparent opacity-50 rounded-bl-full" />

                            <div className="relative flex items-start gap-4">
                              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--gold-400))] to-[hsl(var(--gold-500))] flex items-center justify-center shadow-lg">
                                <Tag className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-[hsl(var(--jungle-800))] truncate">
                                    {event.title}
                                  </h3>
                                  {isOngoing && (
                                    <span className="flex-shrink-0 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                      LIVE
                                    </span>
                                  )}
                                </div>

                                {event.business_event_types && (
                                  <p className="text-sm text-[hsl(var(--jungle-500))] mb-2">
                                    {event.business_event_types.name}
                                  </p>
                                )}

                                <p className="text-[hsl(var(--jungle-600))] text-sm line-clamp-2 mb-3">
                                  {event.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span>to</span>
                                  <span>
                                    {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--jungle-500))] group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </article>
                )}

                {/* Reviews Section */}
                <article className="card-elevated rounded-2xl p-6 lg:p-8 animate-fade-up delay-400">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                      Reviews
                    </h2>
                    {(business.review_count ?? 0) > 0 && (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {business.review_count} {business.review_count === 1 ? 'review' : 'reviews'}
                      </span>
                    )}
                  </div>

                  {/* Ratings Breakdown */}
                  {reviews && reviews.length > 0 && (
                    <div className="mb-8">
                      <RatingsBreakdown
                        reviews={reviews.map(r => ({ overall_rating: r.rating }))}
                        ratingCounts={ratingCounts}
                        totalReviews={business.review_count || 0}
                        averageRating={business.rating || 0}
                      />
                    </div>
                  )}

                  {/* Review Form */}
                  <div className="mb-8 p-6 rounded-xl bg-[hsl(var(--jungle-50))] border border-[hsl(var(--border))]">
                    <ReviewForm
                      businessId={business.id}
                      businessName={business.name}
                      user={user}
                      existingReview={userReview ? {
                        id: userReview.id,
                        rating: userReview.rating,
                        comment: userReview.comment
                      } : null}
                    />
                  </div>

                  {/* Existing Reviews */}
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[hsl(var(--jungle-800))] border-b border-[hsl(var(--border))] pb-3">
                        Customer Reviews
                      </h3>
                      {reviews
                        .filter(review => review.user_id !== user?.id && review.created_at)
                        .map((review) => (
                          <div key={review.id} className="group">
                            <ReviewItem
                              review={{
                                id: review.id,
                                rating: review.rating,
                                comment: review.comment,
                                created_at: review.created_at!,
                                helpful_count: review.helpful_count ?? 0,
                                not_helpful_count: review.not_helpful_count ?? 0,
                                profiles: review.profiles ? {
                                  name: review.profiles.name ?? 'Anonymous',
                                  photo: review.profiles.photo
                                } : null
                              }}
                              user={user}
                              userVote={userVotesMap.get(review.id)}
                              businessResponse={(() => {
                                const resp = responsesMap.get(review.id)
                                if (!resp || !resp.created_at) return null
                                return {
                                  response: resp.response,
                                  created_at: resp.created_at,
                                  profiles: resp.profiles ? {
                                    name: resp.profiles.name ?? 'Business Owner',
                                    photo: resp.profiles.photo
                                  } : null
                                }
                              })()}
                            />
                            {/* Business Response Form (only for business owner) */}
                            {isBusinessOwner && (
                              <div className="mt-3 ml-12">
                                <BusinessResponseForm
                                  reviewId={review.id}
                                  businessId={business.id}
                                  user={user}
                                  isBusinessOwner={isBusinessOwner}
                                  existingResponse={responsesMap.get(review.id) ? {
                                    id: responsesMap.get(review.id)!.id,
                                    response: responsesMap.get(review.id)!.response
                                  } : null}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--jungle-100))] flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-[hsl(var(--jungle-400))]" />
                      </div>
                      <p className="text-[hsl(var(--muted-foreground))] text-lg">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    </div>
                  )}
                </article>
              </div>

              {/* Right Column - Sticky Sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-6 space-y-6">

                  {/* Primary Action Card */}
                  <div className="glass-dark rounded-2xl p-6 shadow-2xl text-white animate-fade-up delay-100 overflow-hidden relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[hsl(var(--gold-500))]/20 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl" />

                    <div className="relative">
                      <p className="text-white/70 text-sm mb-2">Get in touch</p>
                      <h3 className="font-display text-xl mb-4">
                        Ready to connect?
                      </h3>

                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="group relative w-full overflow-hidden bg-gradient-to-r from-[hsl(var(--jungle-600))] via-[hsl(var(--jungle-500))] to-[hsl(var(--jungle-600))] hover:from-[hsl(var(--jungle-500))] hover:via-[hsl(var(--jungle-400))] hover:to-[hsl(var(--jungle-500))] text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[hsl(var(--jungle-500))]/25 hover:shadow-xl hover:shadow-[hsl(var(--jungle-500))]/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Phone className="w-5 h-5" />
                          <span className="text-base">Call Now</span>
                        </a>
                      )}

                      <p className="text-xs text-white/50 text-center mt-3">
                        Typical response time: Within a few hours
                      </p>
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="card-elevated rounded-2xl p-6 animate-fade-up delay-200">
                    <h3 className="font-semibold text-[hsl(var(--jungle-800))] mb-4">
                      Contact Information
                    </h3>

                    <div className="space-y-4">
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-100))] group-hover:bg-[hsl(var(--jungle-200))] transition-colors">
                            <Phone className="w-4 h-4 text-[hsl(var(--jungle-600))]" />
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Phone</p>
                            <p className="text-[hsl(var(--jungle-700))] font-medium">{business.phone}</p>
                          </div>
                        </a>
                      )}

                      {business.email && (
                        <a
                          href={`mailto:${business.email}`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-100))] group-hover:bg-[hsl(var(--jungle-200))] transition-colors">
                            <Mail className="w-4 h-4 text-[hsl(var(--jungle-600))]" />
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Email</p>
                            <p className="text-[hsl(var(--jungle-700))] font-medium break-all">{business.email}</p>
                          </div>
                        </a>
                      )}

                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-100))] group-hover:bg-[hsl(var(--jungle-200))] transition-colors">
                            <Globe className="w-4 h-4 text-[hsl(var(--jungle-600))]" />
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Website</p>
                            <p className="text-[hsl(var(--jungle-700))] font-medium">Visit Website</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="card-elevated rounded-2xl p-6 animate-fade-up delay-300">
                    <h3 className="font-semibold text-[hsl(var(--jungle-800))] mb-4">
                      Activity
                    </h3>

                    <div className="text-center p-4 rounded-xl bg-[hsl(var(--jungle-50))]">
                      <div className="flex items-center justify-center gap-1.5 text-[hsl(var(--jungle-500))] mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-2xl font-bold text-[hsl(var(--jungle-800))]">
                        {(business.view_count ?? 0) + 1}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Page Views
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Spacing */}
        <div className="h-24 lg:h-16" />
      </div>
    </>
  )
}
