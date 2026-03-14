'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BedDouble, Bath, Users, MapPin, Home,
  Wifi, Wind, Car, Droplets, Tv, UtensilsCrossed,
  WashingMachine, Shield, Dumbbell, Trees,
  X, CheckCircle2, Heart, Flag, Share2,
  ChevronLeft, ChevronRight, Star, Phone, Mail,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { StaticMapCard } from '@/components/StaticMapCard'

// Format raw database slugs into human-readable labels
function formatLabel(slug: string): string {
  const labelMap: Record<string, string> = {
    'wifi': 'WiFi',
    'ac': 'AC',
    'tv': 'TV',
    'parking': 'Parking',
    'hot_water': 'Hot Water',
    'pool': 'Pool',
    'kitchen': 'Kitchen',
    'washer_dryer': 'Washer/Dryer',
    'security': 'Security',
    'gym': 'Gym',
    'garden': 'Garden',
    'furnished': 'Furnished',
    'no_smoking': 'No Smoking',
    'no_pets': 'No Pets',
    'no_parties': 'No Parties',
    'water': 'Water',
    'electricity': 'Electricity',
    'internet': 'Internet',
    'gas': 'Gas',
    'cable': 'Cable TV',
  }
  return labelMap[slug.toLowerCase()] || slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const amenityIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'wifi': Wifi,
  'ac': Wind,
  'parking': Car,
  'hot_water': Droplets,
  'pool': Droplets,
  'kitchen': UtensilsCrossed,
  'washer_dryer': WashingMachine,
  'security': Shield,
  'gym': Dumbbell,
  'garden': Trees,
  'tv': Tv,
  'furnished': Home,
  // Also support already-formatted keys
  'WiFi': Wifi,
  'AC': Wind,
  'Parking': Car,
  'Hot Water': Droplets,
  'Pool': Droplets,
  'Kitchen': UtensilsCrossed,
  'Washer/Dryer': WashingMachine,
  'Security': Shield,
  'Gym': Dumbbell,
  'Garden': Trees,
  'TV': Tv,
  'Furnished': Home,
}

function formatPrice(amount: number | null | undefined): string | null {
  if (!amount || amount <= 0) return null
  return `GYD ${amount.toLocaleString()}`
}

interface RentalDetailClientProps {
  rental: {
    id: string
    name: string
    description?: string
    slug: string
    price_per_month?: number | null
    price_per_week?: number | null
    security_deposit?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    max_guests?: number | null
    amenities?: unknown
    house_rules?: unknown
    utilities_included?: unknown
    phone?: string | null
    email?: string | null
    average_rating?: number | null
    view_count?: number | null
    location_details?: string | null
    latitude?: number | null
    longitude?: number | null
    address?: string | null
    rental_categories?: {
      name: string
      slug?: string
    } | null
    regions?: {
      name: string
      slug?: string
    } | null
  }
  photos: Array<{
    image_url: string
    is_primary?: boolean | null
    display_order?: number | null
  }>
  defaultImage: string
  reviews: Array<{
    id: string
    rating_overall: number
    rating_cleanliness: number
    rating_communication: number
    rating_location: number
    rating_value: number
    comment: string
    created_at: string | null
    profiles?: {
      avatar_url?: string | null
      full_name?: string | null
    }
  }>
  similarRentals: Array<{
    id: string
    name: string
    slug: string
    price_per_month?: number | null
    average_rating?: number | null
    rental_photos?: Array<{
      image_url: string
      is_primary?: boolean | null
      display_order?: number | null
    }>
    regions?: {
      name?: string
    } | null
  }>
}

export function RentalDetailClient({
  rental,
  photos,
  defaultImage,
  reviews,
  similarRentals
}: RentalDetailClientProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const allPhotos = photos.length > 0 ? photos : [{ image_url: defaultImage }]
  const amenities = Array.isArray(rental.amenities) ? rental.amenities as string[] : []
  const houseRules = Array.isArray(rental.house_rules) ? rental.house_rules as string[] : []
  const utilitiesIncluded = Array.isArray(rental.utilities_included) ? rental.utilities_included as string[] : []

  const hasContact = !!(rental.phone || rental.email)
  const monthlyPrice = formatPrice(rental.price_per_month)
  const weeklyPrice = formatPrice(rental.price_per_week)
  const depositPrice = formatPrice(rental.security_deposit)

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight
        const scrolled = window.scrollY
        setIsSticky(scrolled > heroHeight - 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (allPhotos.length > 1 && !isGalleryOpen) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [allPhotos.length, isGalleryOpen])

  // Calculate ratings
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((review) => {
    const rating = Math.floor(review.rating_overall)
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating as keyof typeof ratingCounts]++
    }
  })

  const averageRating = Number(rental.average_rating) || 0
  const totalReviews = reviews.length

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length)
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)

  const nextGalleryPhoto = () => setGalleryPhotoIndex((prev) => (prev + 1) % allPhotos.length)
  const prevGalleryPhoto = () => setGalleryPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)

  const openGallery = (index: number = 0) => {
    setGalleryPhotoIndex(index)
    setIsGalleryOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
    document.body.style.overflow = 'unset'
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: String(rental.name),
          text: `Check out ${rental.name} on Waypoint`,
          url: window.location.href,
        })
      } catch {
        // User cancelled share dialog
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Handle keyboard navigation in gallery
  useEffect(() => {
    if (!isGalleryOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGallery()
      if (e.key === 'ArrowRight') nextGalleryPhoto()
      if (e.key === 'ArrowLeft') prevGalleryPhoto()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGalleryOpen])

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,5%)]">
      {/* Fullscreen Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white text-sm font-bold">
            {galleryPhotoIndex + 1} / {allPhotos.length}
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={String(allPhotos[galleryPhotoIndex].image_url)}
              alt={`${rental.name} - Photo ${galleryPhotoIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {allPhotos.length > 1 && (
            <>
              <button
                onClick={prevGalleryPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={nextGalleryPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-full overflow-x-auto">
            <div className="flex gap-2 px-4">
              {allPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setGalleryPhotoIndex(index)}
                  aria-label={`View photo ${index + 1} of ${allPhotos.length}`}
                  aria-current={index === galleryPhotoIndex ? 'true' : undefined}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    index === galleryPhotoIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={String(photo.image_url)}
                    alt={`${rental.name} - Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div ref={heroRef} className="relative w-full h-[70vh] sm:h-[80vh] md:h-screen overflow-hidden">
        <div className="absolute inset-0">
          {allPhotos.map((photo, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={String(photo.image_url)}
                alt={`${rental.name} - Photo ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
          <Link
            href="/rentals"
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isSaved ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Photo Navigation */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="absolute bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex">
              {allPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  aria-label={`Go to photo ${index + 1} of ${allPhotos.length}`}
                  aria-current={index === currentPhotoIndex ? 'true' : undefined}
                  className="relative flex items-center justify-center w-11 h-11"
                >
                  <span className={`block transition-all duration-300 rounded-full ${
                    index === currentPhotoIndex
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => openGallery(currentPhotoIndex)}
              className="absolute bottom-24 sm:bottom-32 right-4 z-20 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <span className="text-white text-sm font-bold">View All ({allPhotos.length})</span>
            </button>
          </>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {rental.rental_categories?.name && (
              <Link
                href={`/rentals/category/${rental.rental_categories.slug || ''}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-3 hover:bg-white/25 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{rental.rental_categories.name}</span>
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 leading-tight">
              {rental.name}
            </h1>

            <div className="flex items-center gap-2 text-white/90 text-base sm:text-lg mb-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">
                {rental.location_details && rental.location_details !== '' && <span>{rental.location_details}, </span>}
                {rental.regions?.name && <span>{rental.regions.name}</span>}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Number(rental.bedrooms) > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
                  <BedDouble className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">{rental.bedrooms} {Number(rental.bedrooms) === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              )}
              {Number(rental.bathrooms) > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
                  <Bath className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">{rental.bathrooms} {Number(rental.bathrooms) === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              )}
              {Number(rental.max_guests) > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">{rental.max_guests} {Number(rental.max_guests) === 1 ? 'Guest' : 'Guests'}</span>
                </div>
              )}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm border border-white/20">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="text-white font-bold text-sm">{averageRating.toFixed(1)} ({totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA (Sticky) */}
      {hasContact && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
            isSticky ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-white/95 dark:bg-[hsl(0,0%,10%)]/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="hidden sm:block">
                  {monthlyPrice ? (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-0.5">Starting from</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {monthlyPrice}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{rental.name}</p>
                  )}
                </div>
                {rental.phone ? (
                  <a
                    href={`tel:${rental.phone}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Now</span>
                  </a>
                ) : rental.email ? (
                  <a
                    href={`mailto:${rental.email}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send Email</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mobile Price & Contact Card */}
            <div className="lg:hidden bg-emerald-600 rounded-2xl p-6 text-white">
              {monthlyPrice ? (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold">{monthlyPrice}</span>
                  <span className="text-base opacity-90">/month</span>
                </div>
              ) : (
                <p className="text-xl font-bold mb-2">Contact for pricing</p>
              )}
              {weeklyPrice && (
                <p className="text-white/80 text-sm mb-1">{weeklyPrice}/week also available</p>
              )}
              {depositPrice && (
                <p className="text-white/80 text-sm">Security deposit: {depositPrice}</p>
              )}

              {hasContact && (
                <div className="mt-5 pt-4 border-t border-white/30 space-y-3">
                  {rental.phone && (
                    <a href={`tel:${rental.phone}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-emerald-700 rounded-xl font-bold hover:bg-green-50 transition-all active:scale-95">
                      <Phone className="w-5 h-5" />
                      Call Now
                    </a>
                  )}
                  {rental.email && (
                    <a href={`mailto:${rental.email}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all active:scale-95">
                      <Mail className="w-5 h-5" />
                      Send Email
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {rental.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About This Property</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]">{rental.description}</p>
              </div>
            )}

            {/* Location Map */}
            {rental.latitude && rental.longitude && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Location</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <StaticMapCard
                    latitude={rental.latitude}
                    longitude={rental.longitude}
                    address={rental.address || rental.location_details}
                    name={rental.name}
                  />
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((amenity: string) => {
                    const Icon = amenityIcons[amenity] || amenityIcons[amenity.toLowerCase()] || CheckCircle2
                    const label = formatLabel(amenity)
                    return (
                      <div key={amenity} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{label}</span>
                      </div>
                    )
                  })}
                </div>
                {amenities.length > 8 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {showAllAmenities ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show All {amenities.length} Amenities
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Good to Know: Utilities + House Rules combined */}
            {(utilitiesIncluded.length > 0 || houseRules.length > 0) && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Good to Know</h2>
                <div className="space-y-4">
                  {utilitiesIncluded.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Utilities Included</h3>
                      <div className="flex flex-wrap gap-2">
                        {utilitiesIncluded.map((utility: string) => (
                          <span key={utility} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {formatLabel(utility)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {houseRules.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">House Rules</h3>
                      <div className="space-y-1.5">
                        {houseRules.map((rule: string) => {
                          const label = formatLabel(rule)
                          const isNegative = label.toLowerCase().startsWith('no ')
                          const Icon = isNegative ? X : CheckCircle2
                          return (
                            <div
                              key={rule}
                              className="flex items-center gap-2.5 py-2"
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`} />
                              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            {totalReviews > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Guest Reviews</h2>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>

                {/* Rating Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-5 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingCounts[rating as keyof typeof ratingCounts]
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-10">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{rating}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="w-8 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => {
                    const avatarUrl = review.profiles?.avatar_url || null
                    const fullName = review.profiles?.full_name || 'Anonymous'
                    return (
                    <div key={review.id} className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-start gap-3 mb-2">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={fullName}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {fullName.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{fullName}</h4>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= Math.round(review.rating_overall) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {new Date(review.created_at || new Date().toISOString()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm pl-12">{review.comment}</p>
                    </div>
                  )})}
                </div>

                {reviews.length > 5 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold text-gray-700 dark:text-gray-300 transition-all text-sm"
                  >
                    {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                {monthlyPrice ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Starting from</p>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-0.5">
                      {monthlyPrice}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-5">/month</p>
                  </>
                ) : (
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-5">Contact for pricing</p>
                )}

                {weeklyPrice && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{weeklyPrice}/week also available</p>
                )}

                {depositPrice && (
                  <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Security Deposit</p>
                    <p className="text-sm text-gray-900 dark:text-white font-bold">{depositPrice}</p>
                  </div>
                )}

                {hasContact ? (
                  <div className="space-y-3 mb-5">
                    {rental.phone && (
                      <a href={`tel:${rental.phone}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                        <Phone className="w-5 h-5" />
                        Call Now
                      </a>
                    )}
                    {rental.email && (
                      <a href={`mailto:${rental.email}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95">
                        <Mail className="w-5 h-5" />
                        Send Email
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 italic">Contact info coming soon</p>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-6">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs font-semibold">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Flag className="w-5 h-5" />
                    <span className="text-xs font-semibold">Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarRentals.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarRentals.map((similar) => {
                const similarPhoto = similar.rental_photos?.find((p) => p.is_primary)?.image_url || defaultImage
                const avgRating = similar.average_rating || 0
                const price = formatPrice(similar.price_per_month)
                return (
                  <Link
                    key={similar.id}
                    href={`/rentals/${similar.slug}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image src={similarPhoto} alt={similar.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                      {avgRating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{similar.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {similar.regions?.name || ''}
                      </p>
                      {price ? (
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{price}<span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/mo</span></p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Contact for pricing</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
