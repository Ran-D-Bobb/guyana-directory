import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { PageViewTracker } from '@/components/PageViewTracker'
import { ReviewForm } from '@/components/ReviewForm'
import { RatingsBreakdown } from '@/components/RatingsBreakdown'
import { ReviewList } from '@/components/ReviewList'
import { LoadMoreReviews } from '@/components/LoadMoreReviews'
import { BusinessResponseForm } from '@/components/BusinessResponseForm'
import { CollapsibleHours } from '@/components/CollapsibleHours'
import { StaticMapCard } from '@/components/StaticMapCard'
import { SaveBusinessButton } from '@/components/SaveBusinessButton'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { PhotoGallery, MobilePhotoGallery, HeroPhotoFlagButton } from '@/components/PhotoGallery'
import { BusinessStatusBadge } from '@/components/BusinessStatusBadge'
import { ShareButton } from '@/components/ShareButton'
import { BusinessCard } from '@/components/BusinessCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  Sparkles,
  Calendar,
  Tag,
  MessageCircle,
  Star,
  ExternalLink
} from 'lucide-react'

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

function buildJsonLd(business: Record<string, unknown>, heroImage: string, businessHours: BusinessHours | null) {
  return {
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
        addressRegion: (business.regions as { name?: string } | null)?.name,
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
    ...((business.rating as number ?? 0) > 0 && (business.review_count as number ?? 0) > 0 ? {
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
    keywords: (business.business_tags as Array<{ category_tags?: { name?: string } }>)?.map((bt) => bt.category_tags?.name).filter(Boolean).join(', ') || undefined,
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Stage 1: Fetch user auth and business data in parallel
  const [userResult, businessResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('businesses')
      .select(`
        *,
        categories:category_id (name, slug, icon),
        regions:region_id (name),
        business_photos (id, image_url, is_primary, display_order),
        business_tags (
          tag_id,
          category_tags:tag_id (name, slug)
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

  // Stage 2: Fetch ALL dependent data in a single parallel batch
  const now = new Date().toISOString()
  const photoIds = (business.business_photos || []).map((p: { id: string }) => p.id)

  const [reviewsResult, eventsResult, savedResult, flaggedResult, ratingCountsResult, similarResult] = await Promise.all([
    // Reviews
    supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at, helpful_count, not_helpful_count, user_id,
        profiles:user_id (name, photo, review_count)
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(20),
    // Business events
    supabase
      .from('business_events')
      .select(`*, business_event_types:event_type_id (name, icon)`)
      .eq('business_id', business.id)
      .gte('end_date', now)
      .order('start_date', { ascending: true })
      .limit(5),
    // Saved status
    user
      ? supabase
          .from('saved_businesses')
          .select('id')
          .eq('business_id', business.id)
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
    // Flagged photos
    user && photoIds.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase as any)
          .from('photo_flags')
          .select('photo_id')
          .eq('user_id', user.id)
          .in('photo_id', photoIds)
      : Promise.resolve({ data: null }),
    // Rating distribution - fetch counts from DB for accuracy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_rating_counts', { p_business_id: business.id }).then((res: { data: unknown }) => res).catch(() => ({ data: null })),
    // Similar businesses from same category
    business.category_id
      ? supabase
          .from('businesses')
          .select(`
            *,
            categories:category_id (name, slug),
            regions:region_id (name),
            business_photos (image_url, is_primary)
          `)
          .eq('category_id', business.category_id)
          .neq('id', business.id)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(4)
      : Promise.resolve({ data: null }),
  ])

  const reviews = reviewsResult.data || []
  const businessEvents = eventsResult.data
  const isSaved = !!savedResult.data
  const userFlaggedPhotoIds = (flaggedResult.data || []).map((f: { photo_id: string }) => f.photo_id)
  const similarBusinesses = similarResult.data || []

  // Stage 3: Fetch review-dependent data (votes & responses) in parallel
  const reviewIds = reviews.map((r: { id: string }) => r.id)
  const [userVotesResult, responsesResult] = await Promise.all([
    user && reviewIds.length > 0
      ? supabase
          .from('review_helpful_votes')
          .select('review_id, is_helpful')
          .eq('user_id', user.id)
          .in('review_id', reviewIds)
      : Promise.resolve({ data: null }),
    reviewIds.length > 0
      ? supabase
          .from('review_responses')
          .select(`*, profiles:user_id (name, photo)`)
          .in('review_id', reviewIds)
      : Promise.resolve({ data: null }),
  ])

  const userVotes = userVotesResult.data
  const responses = responsesResult.data

  // Compute derived state
  const userReview = user && reviews.find((review: { user_id: string }) => review.user_id === user.id)
  const isBusinessOwner = user && business.owner_id === user.id

  // Rating breakdown: use DB counts if available, otherwise compute from fetched reviews
  const dbRatingCounts = ratingCountsResult?.data
  const ratingCounts = dbRatingCounts
    ? { 5: dbRatingCounts[0]?.count_5 ?? 0, 4: dbRatingCounts[0]?.count_4 ?? 0, 3: dbRatingCounts[0]?.count_3 ?? 0, 2: dbRatingCounts[0]?.count_2 ?? 0, 1: dbRatingCounts[0]?.count_1 ?? 0 }
    : reviews.reduce((acc: Record<1 | 2 | 3 | 4 | 5, number>, review: { rating: number }) => {
        if (review.rating >= 1 && review.rating <= 5) {
          acc[review.rating as 1 | 2 | 3 | 4 | 5]++
        }
        return acc
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>)

  // If we fell back to computing from subset, use subset count for consistency
  const displayTotalReviews = dbRatingCounts
    ? (business.review_count || 0)
    : reviews.length

  const businessHours = business.hours as BusinessHours | null

  // Photos
  const photos = business.business_photos || []
  const sortedPhotos = [...photos].sort((a: { is_primary: boolean | null; display_order: number | null }, b: { is_primary: boolean | null; display_order: number | null }) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })
  const primaryPhoto = sortedPhotos[0]
  const heroImage = primaryPhoto?.image_url || '/waypoint-logo.png'
  const galleryPhotos = sortedPhotos.slice(0, 4)

  const jsonLd = buildJsonLd(business, heroImage, businessHours)

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PageViewTracker businessId={business.id} />

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
        {/* Floating Back Button */}
        <div className="fixed top-[60px] md:top-[82px] left-3 md:left-4 z-40 animate-fade-up">
          <Link
            href="/businesses"
            className="glass flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[hsl(var(--jungle-800))] hover:bg-white/90 transition-all duration-300 shadow-lg group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs md:text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* ======= HERO SECTION ======= */}
        <section className="relative h-[55vh] md:h-[60vh] min-h-[400px] md:min-h-[450px] max-h-[600px] overflow-hidden">
          {/* Combined gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--jungle-900))]/70 via-[hsl(var(--jungle-900))]/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[hsl(var(--jungle-50))] z-10" />

          {/* Main hero image */}
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={business.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-4 md:p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4 animate-fade-up">
                {business.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[hsl(var(--gold-500))]/90 backdrop-blur-sm text-[hsl(var(--jungle-900))] rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured
                  </span>
                )}
                {business.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/80 backdrop-blur-sm text-[hsl(var(--jungle-700))] rounded-full shadow-lg">
                    <BadgeCheck className="w-3.5 h-3.5 text-[hsl(var(--jungle-500))]" />
                    Verified
                  </span>
                )}
                {/* Client-side real-time open/closed status */}
                <BusinessStatusBadge hours={businessHours} variant="hero" />
              </div>

              {/* Category breadcrumb */}
              {business.categories && (
                <Link
                  href={`/businesses/category/${business.categories.slug}`}
                  className="inline-block mb-2 md:mb-3 animate-fade-up delay-100"
                >
                  <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold-400))] hover:text-[hsl(var(--gold-300))] transition-colors tracking-widest uppercase">
                    {business.categories.name}
                  </span>
                </Link>
              )}

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 md:mb-4 animate-fade-up delay-200 drop-shadow-2xl tracking-tight">
                {business.name}
              </h1>

              {/* Rating & Location Row */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-white/90 animate-fade-up delay-300">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(business.rating ?? 0)
                            ? 'fill-[hsl(var(--gold-400))] text-[hsl(var(--gold-400))]'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {(business.rating ?? 0) > 0 ? (business.rating ?? 0).toFixed(1) : 'New'}
                  </span>
                  {(business.review_count ?? 0) > 0 && (
                    <span className="text-white/60">
                      ({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>

                {business.regions && (
                  <>
                    <span className="text-white/30">|</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-white/70" />
                      <span>{business.regions.name}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Business Tags */}
              {business.business_tags && business.business_tags.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1.5 mt-3 animate-fade-up delay-400">
                  {business.business_tags.map((bt: { category_tags: { name: string; slug: string } | null }, i: number) => (
                    bt.category_tags && (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm text-white/90 border border-white/10"
                      >
                        {bt.category_tags.name}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hero Photo Flag Button - visible on all screen sizes */}
          {primaryPhoto && (
            <HeroPhotoFlagButton
              photoId={primaryPhoto.id}
              isAuthenticated={!!user}
              hasFlagged={userFlaggedPhotoIds.includes(primaryPhoto.id)}
            />
          )}

          {/* Desktop Photo Gallery Thumbnails */}
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

        {/* ======= MAIN CONTENT ======= */}
        <main className="relative z-20 -mt-6 lg:-mt-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-5">

                {/* Mobile Quick Actions */}
                <div className="lg:hidden bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-black/[0.04] border border-white/60 animate-fade-up">
                  <div className="flex items-center justify-center gap-5">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex flex-col items-center gap-1.5 min-w-[52px] group">
                        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-500))] flex items-center justify-center shadow-md shadow-[hsl(var(--jungle-500))]/20 group-active:scale-95 transition-transform">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[11px] font-medium text-[hsl(var(--jungle-700))]">Call</span>
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className="flex flex-col items-center gap-1.5 min-w-[52px] group">
                        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-100))] flex items-center justify-center group-active:scale-95 transition-transform">
                          <Mail className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
                        </div>
                        <span className="text-[11px] font-medium text-[hsl(var(--jungle-700))]">Email</span>
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 min-w-[52px] group">
                        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-100))] flex items-center justify-center group-active:scale-95 transition-transform">
                          <Globe className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
                        </div>
                        <span className="text-[11px] font-medium text-[hsl(var(--jungle-700))]">Web</span>
                      </a>
                    )}
                    <div className="flex flex-col items-center gap-1.5 min-w-[52px]">
                      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-100))] flex items-center justify-center">
                        <SaveBusinessButton
                          businessId={business.id}
                          initialIsSaved={isSaved}
                          userId={user?.id ?? null}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[hsl(var(--jungle-700))]">Save</span>
                    </div>
                    <ShareButton
                      title={business.name}
                      text={`Check out ${business.name} on Waypoint`}
                      url={`/businesses/${business.slug}`}
                      variant="mobile-action"
                    />
                  </div>
                </div>

                {/* Mobile Business Tags */}
                {business.business_tags && business.business_tags.length > 0 && (
                  <div className="md:hidden flex flex-wrap gap-1.5 animate-fade-up">
                    {business.business_tags.map((bt: { category_tags: { name: string; slug: string } | null }, i: number) => (
                      bt.category_tags && (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--jungle-50))] text-[hsl(var(--jungle-700))] border border-[hsl(var(--jungle-200))]/50"
                        >
                          {bt.category_tags.name}
                        </span>
                      )
                    ))}
                  </div>
                )}

                {/* Mobile Photo Gallery */}
                {photos.length > 1 && (
                  <MobilePhotoGallery
                    photos={photos}
                    businessName={business.name}
                    isAuthenticated={!!user}
                    userFlaggedPhotos={userFlaggedPhotoIds}
                  />
                )}

                {/* About Section */}
                <article className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-6 lg:p-8 animate-fade-up delay-100">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                      About
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                  </div>

                  {business.description ? (
                    <p className="text-[hsl(var(--jungle-700))] leading-relaxed whitespace-pre-line text-base lg:text-lg">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-[hsl(var(--muted-foreground))] italic">
                      No description available yet.
                    </p>
                  )}

                  {business.address && (
                    <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]/60">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]/50">
                          <MapPin className="w-5 h-5 text-[hsl(var(--jungle-500))]" />
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--jungle-800))] text-sm">Address</p>
                          <p className="text-[hsl(var(--jungle-600))] mt-0.5">{business.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>

                {/* Location Map */}
                {business.latitude && business.longitude && (
                  <article className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-6 lg:p-8 animate-fade-up delay-150">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                        Location
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                    </div>
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
                  <CollapsibleHours businessHours={businessHours} />
                )}

                {/* Promotions & Offers */}
                {businessEvents && businessEvents.length > 0 && (
                  <article className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-6 lg:p-8 animate-fade-up delay-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-5 h-5 text-[hsl(var(--gold-500))]" />
                        <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                          Promotions & Offers
                        </h2>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                    </div>

                    <div className="space-y-3">
                      {businessEvents.map((event: { id: string; title: string; description: string | null; start_date: string; end_date: string; business_event_types: { name: string; icon: string | null } | null }) => {
                        const startDate = new Date(event.start_date)
                        const endDate = new Date(event.end_date)
                        const isOngoing = startDate <= new Date() && endDate >= new Date()

                        return (
                          <div
                            key={event.id}
                            className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))]/60 p-5 bg-white"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(var(--gold-100))]/50 to-transparent rounded-bl-full" />

                            <div className="relative flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--gold-400))] to-[hsl(var(--gold-500))] flex items-center justify-center shadow-md shadow-[hsl(var(--gold-500))]/20">
                                <Tag className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-base text-[hsl(var(--jungle-800))] truncate">
                                    {event.title}
                                  </h3>
                                  {isOngoing && (
                                    <span className="flex-shrink-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                      Live
                                    </span>
                                  )}
                                </div>

                                {event.business_event_types && (
                                  <p className="text-sm text-[hsl(var(--jungle-500))] mb-1.5">
                                    {event.business_event_types.name}
                                  </p>
                                )}

                                <p className="text-[hsl(var(--jungle-600))] text-sm line-clamp-2 mb-2.5">
                                  {event.description}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-[hsl(var(--border))]">&mdash;</span>
                                  <span>
                                    {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <Link
                      href={`/events?business=${business.slug}`}
                      className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-[hsl(var(--jungle-600))] hover:text-[hsl(var(--jungle-700))] transition-colors"
                    >
                      View all events from {business.name}
                    </Link>
                  </article>
                )}

                {/* ======= REVIEWS SECTION ======= */}
                <article className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-6 lg:p-8 animate-fade-up delay-400">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                        Reviews
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                    </div>
                    {(business.review_count ?? 0) > 0 && (
                      <span className="text-sm text-[hsl(var(--muted-foreground))] tabular-nums">
                        {business.review_count} {business.review_count === 1 ? 'review' : 'reviews'}
                      </span>
                    )}
                  </div>

                  {/* Ratings Breakdown - uses consistent counts */}
                  {reviews && reviews.length > 0 && (
                    <div className="mb-8">
                      <RatingsBreakdown
                        reviews={reviews.map((r: { rating: number }) => ({ overall_rating: r.rating }))}
                        ratingCounts={ratingCounts}
                        totalReviews={displayTotalReviews}
                        averageRating={business.rating || 0}
                      />
                    </div>
                  )}

                  {/* Review Form */}
                  <div className="mb-8 p-5 rounded-xl bg-[hsl(var(--jungle-50))]/70 border border-[hsl(var(--border))]/50">
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
                    <>
                      <ReviewList
                        reviews={reviews.map((r: { id: string; rating: number; comment: string | null; created_at: string | null; helpful_count: number | null; not_helpful_count: number | null; user_id: string; profiles: { name: string | null; photo: string | null; review_count?: number | null } | null }) => ({
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
                        responses={responses?.map((r: { review_id: string; response: string; created_at: string | null; profiles: { name: string | null; photo: string | null } | null }) => ({
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

                      {/* Load more reviews if there are more than the initial batch */}
                      {(business.review_count ?? 0) > reviews.length && (
                        <LoadMoreReviews
                          businessId={business.id}
                          initialCount={reviews.length}
                          totalCount={business.review_count ?? 0}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]/50 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-[hsl(var(--jungle-400))]" />
                      </div>
                      <p className="text-[hsl(var(--jungle-700))] font-medium mb-1">
                        No reviews yet
                      </p>
                      <p className="text-[hsl(var(--muted-foreground))] text-sm">
                        Be the first to share your experience!
                      </p>
                    </div>
                  )}
                </article>

                {/* ======= SIMILAR BUSINESSES ======= */}
                {similarBusinesses.length > 0 && (
                  <section className="animate-fade-up delay-500">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-800))]">
                        Similar Businesses
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {similarBusinesses.map((sb: typeof similarBusinesses[number]) => {
                        const sbPhotos = sb.business_photos || []
                        const sbPrimary = sbPhotos.find((p: { is_primary: boolean | null }) => p.is_primary)?.image_url || sbPhotos[0]?.image_url || null
                        return (
                          <BusinessCard
                            key={sb.id}
                            business={sb}
                            primaryPhoto={sbPrimary}
                            userId={user?.id ?? null}
                          />
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* ======= RIGHT COLUMN - STICKY SIDEBAR ======= */}
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-5">

                  {/* Primary Action Card */}
                  <div className="relative rounded-2xl overflow-hidden animate-fade-up delay-100">
                    <div className="absolute inset-0 gradient-mesh-dark" />
                    <div className="absolute inset-0 bg-[hsl(var(--jungle-900))]/40" />

                    <div className="relative p-6 text-white">
                      <p className="text-[hsl(var(--gold-400))] text-xs font-medium tracking-widest uppercase mb-1.5">
                        Get in touch
                      </p>
                      <h3 className="font-display text-xl text-white mb-5">
                        Ready to connect?
                      </h3>

                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="group relative w-full overflow-hidden bg-gradient-to-r from-[hsl(var(--jungle-500))] to-[hsl(var(--jungle-400))] hover:from-[hsl(var(--jungle-400))] hover:to-[hsl(var(--jungle-300))] text-white font-semibold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-[hsl(var(--jungle-500))]/25 hover:shadow-xl hover:shadow-[hsl(var(--jungle-500))]/35 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Phone className="w-4.5 h-4.5" />
                          <span>Call Now</span>
                        </a>
                      )}

                      {business.email && (
                        <a
                          href={`mailto:${business.email}`}
                          className="w-full mt-2.5 py-3 px-5 rounded-xl flex items-center justify-center gap-2.5 border border-white/20 text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-sm font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Send Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-5 animate-fade-up delay-200">
                    <h3 className="font-semibold text-[hsl(var(--jungle-800))] text-sm mb-3.5">
                      Contact Information
                    </h3>

                    <div className="space-y-1">
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]/40 group-hover:border-[hsl(var(--jungle-300))]/50 transition-colors">
                            <Phone className="w-3.5 h-3.5 text-[hsl(var(--jungle-500))]" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">Phone</p>
                            <p className="text-sm text-[hsl(var(--jungle-700))] font-medium">{business.phone}</p>
                          </div>
                        </a>
                      )}

                      {business.email && (
                        <a
                          href={`mailto:${business.email}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]/40 group-hover:border-[hsl(var(--jungle-300))]/50 transition-colors">
                            <Mail className="w-3.5 h-3.5 text-[hsl(var(--jungle-500))]" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">Email</p>
                            <p className="text-sm text-[hsl(var(--jungle-700))] font-medium break-all">{business.email}</p>
                          </div>
                        </a>
                      )}

                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-[hsl(var(--jungle-50))] border border-[hsl(var(--jungle-200))]/40 group-hover:border-[hsl(var(--jungle-300))]/50 transition-colors">
                            <Globe className="w-3.5 h-3.5 text-[hsl(var(--jungle-500))]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">Website</p>
                            <p className="text-sm text-[hsl(var(--jungle-700))] font-medium flex items-center gap-1">
                              Visit Website
                              <ExternalLink className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Save & Share Card */}
                  <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-[hsl(var(--border))]/60 p-5 animate-fade-up delay-250">
                    <div className="flex items-center gap-3 mb-3">
                      <SaveBusinessButton
                        businessId={business.id}
                        initialIsSaved={isSaved}
                        userId={user?.id ?? null}
                        variant="icon-label"
                        size="md"
                        className="flex-1 justify-center"
                      />
                      <ShareButton
                        title={business.name}
                        text={`Check out ${business.name} on Waypoint`}
                        url={`/businesses/${business.slug}`}
                      />
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                      {user ? 'Save this business to find it easily later' : 'Sign in to save businesses'}
                    </p>
                  </div>

                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Bottom Spacing */}
        <div className="h-28 lg:h-16" />
      </div>
    </>
  )
}
