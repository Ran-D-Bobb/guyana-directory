import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { PageViewTracker } from '@/components/PageViewTracker'
import { ReviewForm } from '@/components/ReviewForm'
import { RatingsBreakdown } from '@/components/RatingsBreakdown'
import { ReviewList } from '@/components/ReviewList'
import { BusinessResponseForm } from '@/components/BusinessResponseForm'
import { CollapsibleHours } from '@/components/CollapsibleHours'
import { StaticMapCard } from '@/components/StaticMapCard'
import { SaveBusinessButton } from '@/components/SaveBusinessButton'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { PhotoGallery, HeroPhotoFlagButton } from '@/components/PhotoGallery'
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

// Revalidate every 2 minutes
export const revalidate = 120

// Pre-render top 50 most-viewed businesses at build time
export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug')
    .order('view_count', { ascending: false })
    .limit(50)

  return (businesses || []).map((business) => ({
    slug: business.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, categories:category_id (name), regions:region_id (name), business_photos (image_url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!business) return { title: 'Business Not Found' }

  const photo = Array.isArray(business.business_photos)
    ? business.business_photos.find(p => p.is_primary)?.image_url || business.business_photos[0]?.image_url
    : null
  const categoryName = (business.categories as { name: string } | null)?.name || ''
  const regionName = (business.regions as { name: string } | null)?.name || ''
  const description = business.description
    ? business.description.slice(0, 155)
    : `${business.name} - ${categoryName} in ${regionName}, Guyana. Contact details, reviews, and hours.`

  return {
    title: `${business.name} - ${categoryName} in ${regionName}`,
    description,
    alternates: { canonical: `/businesses/${slug}` },
    openGraph: {
      title: `${business.name} | Waypoint`,
      description,
      ...(photo ? { images: [{ url: photo, width: 1200, height: 630, alt: business.name }] } : {}),
    },
  }
}

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
          profiles:user_id (name, photo, review_count)
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

  // Check if user has saved this business and get user's flagged photos
  let isSaved = false
  let userFlaggedPhotoIds: string[] = []
  if (user) {
    const [savedResult, flaggedResult] = await Promise.all([
      supabase
        .from('saved_businesses')
        .select('id')
        .eq('business_id', business.id)
        .eq('user_id', user.id)
        .single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('photo_flags')
        .select('photo_id')
        .eq('user_id', user.id)
        .in('photo_id', (business.business_photos || []).map((p: { id: string }) => p.id))
    ])
    isSaved = !!savedResult.data
    userFlaggedPhotoIds = (flaggedResult.data || []).map((f: { photo_id: string }) => f.photo_id)
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

  // JSON-LD structured data for LocalBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description || undefined,
    url: `https://waypointgy.com/businesses/${business.slug}`,
    image: heroImage,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    ...(business.website ? { sameAs: [business.website] } : {}),
    ...(business.address ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
        addressRegion: business.regions?.name,
        addressCountry: 'GY',
      },
    } : {}),
    ...(business.latitude && business.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude,
        longitude: business.longitude,
      },
    } : {}),
    ...((business.rating ?? 0) > 0 && (business.review_count ?? 0) > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.rating,
        reviewCount: business.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    ...(businessHours ? {
      openingHoursSpecification: Object.entries(businessHours)
        .filter(([, hours]) => hours && !hours.closed && hours.open && hours.close)
        .map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
          opens: hours.open,
          closes: hours.close,
        })),
    } : {}),
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Track page view */}
      <PageViewTracker businessId={business.id} />

      {/* Track recently viewed */}
      <RecentlyViewedTracker
        type="business"
        id={business.id}
        slug={business.slug}
        name={business.name}
        image={heroImage}
        category={business.categories?.name}
        location={business.regions?.name}
      />

      <div className="min-h-screen bg-[hsl(var(--jungle-50))]">
        {/* Floating Back Button - positioned below fixed header */}
        {/* Mobile: top-[60px] (below 56px header), Desktop: top-[82px] (below 74px header + spacing) */}
        <div className="fixed top-[60px] md:top-[82px] left-3 md:left-4 z-40 animate-fade-up">
          <Link
            href="/businesses"
            className="glass flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[hsl(var(--jungle-800))] hover:bg-white/90 transition-all duration-300 shadow-lg group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs md:text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Hero Section with Photo Gallery - shorter on mobile */}
        <section className="relative h-[50vh] md:h-[60vh] min-h-[350px] md:min-h-[450px] max-h-[600px] overflow-hidden">
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
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-4 animate-fade-up">
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
                  className="inline-block mb-1.5 md:mb-3 animate-fade-up delay-100"
                >
                  <span className="text-xs md:text-sm font-medium text-white/90 hover:text-white transition-colors tracking-wide uppercase">
                    {business.categories.name}
                  </span>
                </Link>
              )}

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-4 animate-fade-up delay-200 drop-shadow-2xl">
                {business.name}
              </h1>

              {/* Rating & Location Row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-white/90 animate-fade-up delay-300">
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

          {/* Hero Photo Flag Button */}
          {primaryPhoto && (
            <HeroPhotoFlagButton
              photoId={primaryPhoto.id}
              isAuthenticated={!!user}
              hasFlagged={userFlaggedPhotoIds.includes(primaryPhoto.id)}
            />
          )}

          {/* Photo Gallery Thumbnails (if multiple photos) */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 hidden lg:block animate-fade-up delay-400">
              <PhotoGallery
                photos={galleryPhotos.slice(1)}
                businessName={business.name}
                isAuthenticated={!!user}
                userFlaggedPhotos={userFlaggedPhotoIds}
              />
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
                    <div className="flex flex-col items-center gap-1">
                      <SaveBusinessButton
                        businessId={business.id}
                        initialIsSaved={isSaved}
                        userId={user?.id ?? null}
                        variant="icon"
                        size="sm"
                      />
                      <span className="text-xs text-[hsl(var(--jungle-700))]">Save</span>
                    </div>
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

                {/* Location Map */}
                {business.latitude && business.longitude && (
                  <article className="card-elevated rounded-2xl p-6 lg:p-8 animate-fade-up delay-150">
                    <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))] mb-4">
                      Location
                    </h2>
                    <StaticMapCard
                      latitude={business.latitude}
                      longitude={business.longitude}
                      address={business.address}
                      name={business.name}
                    />
                  </article>
                )}

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
                    <ReviewList
                      reviews={reviews.map(r => ({
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        created_at: r.created_at || '',
                        helpful_count: r.helpful_count ?? 0,
                        not_helpful_count: r.not_helpful_count ?? 0,
                        user_id: r.user_id,
                        profiles: r.profiles ? {
                          name: r.profiles.name ?? 'Anonymous',
                          photo: r.profiles.photo,
                          review_count: r.profiles.review_count
                        } : null
                      }))}
                      user={user}
                      userVotes={userVotes}
                      responses={responses?.map(r => ({
                        review_id: r.review_id,
                        response: r.response,
                        created_at: r.created_at || '',
                        profiles: r.profiles ? {
                          name: r.profiles.name ?? 'Business Owner',
                          photo: r.profiles.photo
                        } : null
                      })) || null}
                      isBusinessOwner={isBusinessOwner || false}
                      businessId={business.id}
                      BusinessResponseForm={BusinessResponseForm}
                    />
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

                  {/* Save Button Card */}
                  <div className="card-elevated rounded-2xl p-6 animate-fade-up delay-250">
                    <h3 className="font-semibold text-[hsl(var(--jungle-800))] mb-4">
                      Save for later
                    </h3>
                    <SaveBusinessButton
                      businessId={business.id}
                      initialIsSaved={isSaved}
                      userId={user?.id ?? null}
                      variant="icon-label"
                      size="md"
                      className="w-full justify-center"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-2">
                      {user ? 'Save this business to find it easily later' : 'Sign in to save businesses'}
                    </p>
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

        {/* Bottom Spacing - account for bottom nav on mobile */}
        <div className="h-28 lg:h-16" />
      </div>
    </>
  )
}
