import { createClient } from '@/lib/supabase/server'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { PageViewTracker } from '@/components/PageViewTracker'
import { ReviewForm } from '@/components/ReviewForm'
import { StarRating } from '@/components/StarRating'
import { RatingsBreakdown } from '@/components/RatingsBreakdown'
import { ReviewItem } from '@/components/ReviewItem'
import { BusinessResponseForm } from '@/components/BusinessResponseForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MapPin, Star, Clock, Phone, Mail, Globe, BadgeCheck, Sparkles, Calendar, Tag } from 'lucide-react'

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

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch the business with category and region
  const { data: business } = await supabase
    .from('businesses')
    .select(`
      *,
      categories:category_id (name, slug),
      regions:region_id (name)
    `)
    .eq('slug', slug)
    .single()

  if (!business) {
    notFound()
  }

  // Fetch business photos
  const { data: photos } = await supabase
    .from('business_photos')
    .select('*')
    .eq('business_id', business.id)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true })

  // Fetch reviews for this business with helpful votes and responses
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (name, photo)
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  // Fetch user's own review if logged in
  const userReview = user && reviews?.find(review => review.user_id === user.id)

  // Fetch helpful votes for current user
  const { data: userVotes } = user ? await supabase
    .from('review_helpful_votes')
    .select('review_id, is_helpful')
    .eq('user_id', user.id)
    .in('review_id', reviews?.map(r => r.id) || [])
    : { data: null }

  // Create a map of user votes for easy lookup
  const userVotesMap = new Map(userVotes?.map(v => [v.review_id, v]) || [])

  // Fetch business responses
  const { data: responses } = await supabase
    .from('review_responses')
    .select(`
      *,
      profiles:user_id (name, photo)
    `)
    .in('review_id', reviews?.map(r => r.id) || [])

  // Create a map of responses for easy lookup
  const responsesMap = new Map(responses?.map(r => [r.review_id, r]) || [])

  // Calculate rating breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews?.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating as 1 | 2 | 3 | 4 | 5]++
    }
  })

  // Check if current user is the business owner
  const isBusinessOwner = user && business.owner_id === user.id

  // Fetch upcoming business events
  const now = new Date().toISOString()
  const { data: businessEvents } = await supabase
    .from('business_events')
    .select(`
      *,
      business_event_types:event_type_id (name, icon)
    `)
    .eq('business_id', business.id)
    .gte('end_date', now)
    .order('start_date', { ascending: true })
    .limit(5)

  // Parse business hours if available
  const businessHours = business.hours as BusinessHours | null

  return (
    <>
      {/* Track page view */}
      <PageViewTracker businessId={business.id} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Photos */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {!photos || photos.length === 0 ? (
                  /* No photos - show default image */
                  <div className="aspect-video w-full relative">
                    <Image
                      src={DEFAULT_BUSINESS_IMAGE}
                      alt={business.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      priority
                    />
                  </div>
                ) : photos.length === 1 ? (
                  /* Single photo */
                  <div className="aspect-video w-full relative">
                    <Image
                      src={photos[0].image_url}
                      alt={business.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      priority
                    />
                  </div>
                ) : photos.length === 2 ? (
                  /* Two photos */
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="aspect-video relative">
                        <Image
                          src={photo.image_url}
                          alt={business.name}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 50vw, 400px"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Three photos */
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="row-span-2 aspect-square relative">
                      <Image
                        src={photos[0].image_url}
                        alt={business.name}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 50vw, 400px"
                      />
                    </div>
                    {photos.slice(1).map((photo) => (
                      <div key={photo.id} className="aspect-video relative">
                        <Image
                          src={photo.image_url}
                          alt={business.name}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 50vw, 400px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-3 mb-4">
                  {business.is_featured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full">
                      <Sparkles className="w-4 h-4" />
                      Featured
                    </span>
                  )}
                  {business.is_verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {business.name}
                </h1>

                {business.categories && (
                  <Link
                    href={`/businesses/category/${business.categories.slug}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-block"
                  >
                    {business.categories.name}
                  </Link>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={business.rating ?? 0} size="lg" />
                  <span className="text-lg font-medium text-gray-900">
                    {(business.rating ?? 0) > 0 ? (business.rating ?? 0).toFixed(1) : 'No ratings yet'}
                  </span>
                  {(business.review_count ?? 0) > 0 && (
                    <span className="text-gray-600">({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})</span>
                  )}
                </div>

                {/* Location */}
                {business.regions && (
                  <div className="flex items-center gap-2 text-gray-600 mb-6">
                    <MapPin className="w-5 h-5" />
                    <span>{business.regions.name}</span>
                  </div>
                )}

                {/* Description */}
                {business.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      About
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {business.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {businessHours && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Business Hours
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-700 capitalize">{day}</span>
                        <span className="text-gray-900 font-medium">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Events */}
              {businessEvents && businessEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Events & Offers
                  </h2>
                  <div className="space-y-4">
                    {businessEvents.map((event) => {
                      const startDate = new Date(event.start_date)
                      const endDate = new Date(event.end_date)
                      const isOngoing = startDate <= new Date() && endDate >= new Date()

                      return (
                        <div
                          key={event.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                              <Tag className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {event.title}
                                </h3>
                                {isOngoing && (
                                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                                    Active Now
                                  </span>
                                )}
                              </div>

                              {event.business_event_types && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {event.business_event_types.name}
                                </p>
                              )}

                              <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                                {event.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Starts:</span>{' '}
                                  {startDate.toLocaleDateString()} at{' '}
                                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div>
                                  <span className="font-medium">Ends:</span>{' '}
                                  {endDate.toLocaleDateString()} at{' '}
                                  {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Reviews ({business.review_count})
                </h2>

                {/* Ratings Breakdown */}
                {reviews && reviews.length > 0 && (
                  <RatingsBreakdown
                    ratingCounts={ratingCounts}
                    totalReviews={business.review_count || 0}
                    averageRating={business.rating || 0}
                  />
                )}

                {/* Review Form */}
                <div className="mb-6">
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
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    {reviews
                      .filter(review => review.user_id !== user?.id) // Don't show user's own review in the list
                      .map((review) => (
                        <div key={review.id}>
                          <ReviewItem
                            review={review}
                            user={user}
                            userVote={userVotesMap.get(review.id)}
                            businessResponse={responsesMap.get(review.id)}
                          />
                          {/* Business Response Form (only for business owner) */}
                          {isBusinessOwner && (
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
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-6 border-t border-gray-200">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
                {/* WhatsApp Button */}
                <WhatsAppButton
                  businessName={business.name}
                  whatsappNumber={business.whatsapp_number}
                  businessId={business.id}
                />

                {/* Contact Information */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>

                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-emerald-600"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{business.phone}</span>
                    </a>
                  )}

                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-emerald-600"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="break-all">{business.email}</span>
                    </a>
                  )}

                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-emerald-600"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="break-all">Website</span>
                    </a>
                  )}

                  {business.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 mt-0.5" />
                      <span>{business.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Stats</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>WhatsApp Clicks</span>
                      <span className="font-medium text-gray-900">{business.whatsapp_clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Page Views</span>
                      <span className="font-medium text-gray-900">{(business.view_count ?? 0) + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
