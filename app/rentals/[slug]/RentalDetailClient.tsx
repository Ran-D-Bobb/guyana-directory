'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BedDouble, Bath, Users, MapPin, Home,
  Wifi, Wind, Car, Droplets, Tv, UtensilsCrossed,
  WashingMachine, Shield, Dumbbell, Trees,
  X, CheckCircle2, Heart, Flag, Share2,
  ChevronLeft, ChevronRight, Star, MessageCircle, Phone, Mail,
  TrendingUp, Eye, ChevronDown, ChevronUp, Sparkles,
  MessageSquare, Crown, BadgeCheck
} from 'lucide-react'

const amenityIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
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
    whatsapp_number?: string | null
    phone?: string | null
    email?: string | null
    average_rating?: number | null
    view_count?: number | null
    whatsapp_clicks?: number | null
    location_details?: string | null
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
  const [isSticky, setIsSticky] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const allPhotos = photos.length > 0 ? photos : [{ image_url: defaultImage }]
  const amenities = Array.isArray(rental.amenities) ? rental.amenities as string[] : []
  const houseRules = Array.isArray(rental.house_rules) ? rental.house_rules as string[] : []
  const utilitiesIncluded = Array.isArray(rental.utilities_included) ? rental.utilities_included as string[] : []

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
          text: `Check out ${rental.name} on Guyana Directory`,
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
    <div className="min-h-screen bg-white">
      {/* Fullscreen Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white text-sm font-bold">
            {galleryPhotoIndex + 1} / {allPhotos.length}
          </div>

          {/* Main Photo */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={String(allPhotos[galleryPhotoIndex].image_url)}
              alt={`${rental.name} - Photo ${galleryPhotoIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={prevGalleryPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={nextGalleryPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-full overflow-x-auto">
            <div className="flex gap-2 px-4">
              {allPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setGalleryPhotoIndex(index)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    index === galleryPhotoIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={String(photo.image_url)}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Mobile First */}
      <div ref={heroRef} className="relative w-full h-[70vh] sm:h-[80vh] md:h-screen overflow-hidden">
        {/* Photo Carousel */}
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
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
          <Link
            href="/rentals"
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Photo Indicators */}
            <div className="absolute bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {allPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentPhotoIndex
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* View All Photos Button */}
            <button
              onClick={() => openGallery(currentPhotoIndex)}
              className="absolute bottom-24 sm:bottom-32 right-4 z-20 px-4 py-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/50 transition-all active:scale-95"
            >
              <span className="text-white text-sm font-bold">View All ({allPhotos.length})</span>
            </button>
          </>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Category Badge */}
            {rental.rental_categories?.name && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold mb-3">
                <Crown className="w-4 h-4" />
                <span>{rental.rental_categories.name}</span>
              </div>
            )}

            {/* Title - Mobile Optimized */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
              {rental.name}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/90 text-base sm:text-lg mb-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">
                {rental.location_details && rental.location_details !== '' && <span>{rental.location_details}, </span>}
                {rental.regions?.name && <span>{rental.regions.name}</span>}
              </span>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20">
                <BedDouble className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">{Number(rental.bedrooms || 0)} Beds</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20">
                <Bath className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">{Number(rental.bathrooms || 0)} Baths</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20">
                <Users className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">{Number(rental.max_guests || 0)} Guests</span>
              </div>
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-xl border border-white/20">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="text-white font-bold text-sm">{averageRating.toFixed(1)} ({totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA (Sticky) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500 font-semibold mb-0.5">Starting from</p>
                <p className="text-2xl font-black text-gray-900">
                  GYD {Number(rental.price_per_month || 0).toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
              <a
                href={`https://wa.me/${rental.whatsapp_number}?text=${encodeURIComponent(
                  `Hi! I'm interested in ${rental.name} on Guyana Directory. Is it still available?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price & Contact Card (Mobile) */}
            <div className="lg:hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-5 h-5" />
                <span className="text-sm font-bold">Verified Listing</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black">GYD {Number(rental.price_per_month || 0).toLocaleString()}</span>
                <span className="text-lg">/month</span>
              </div>
              {rental.price_per_week && rental.price_per_week !== null && (
                <p className="text-white/90 mb-1">GYD {Number(rental.price_per_week).toLocaleString()}/week</p>
              )}
              {rental.security_deposit && rental.security_deposit !== null && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-sm"><span className="font-bold">Security Deposit:</span> GYD {Number(rental.security_deposit).toLocaleString()}</p>
                </div>
              )}

              {/* Mobile Contact Buttons */}
              <div className="mt-6 pt-4 border-t border-white/30 space-y-3">
                <a
                  href={`https://wa.me/${rental.whatsapp_number}?text=${encodeURIComponent(
                    `Hi! I'm interested in ${rental.name} on Guyana Directory. Is it still available?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-green-700 rounded-xl font-bold hover:bg-green-50 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>

                {rental.phone && rental.phone !== null && (
                  <a href={`tel:${rental.phone}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all active:scale-95">
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>
                )}

                {rental.email && rental.email !== null && (
                  <a href={`mailto:${rental.email}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all active:scale-95">
                    <Mail className="w-5 h-5" />
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">About This Property</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{rental.description || ''}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Eye, label: 'Views', value: Number(rental.view_count || 0), color: 'blue' },
                { icon: MessageCircle, label: 'Inquiries', value: Number(rental.whatsapp_clicks || 0), color: 'green' },
                { icon: Star, label: 'Rating', value: averageRating.toFixed(1), color: 'amber' },
                { icon: MessageSquare, label: 'Reviews', value: totalReviews, color: 'purple' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                  <div className={`inline-flex p-2 rounded-xl bg-${stat.color}-100 mb-2`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600 font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Amenities</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(showAllAmenities ? amenities : amenities.slice(0, 9)).map((amenity: string) => {
                    const Icon = amenityIcons[amenity] || CheckCircle2
                    return (
                      <div key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-green-300 transition-colors">
                        <Icon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
                {amenities.length > 9 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 w-full py-3 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 font-bold text-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    {showAllAmenities ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        Show All {amenities.length} Amenities
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Utilities */}
            {utilitiesIncluded.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  Utilities Included
                </h2>
                <div className="flex flex-wrap gap-2">
                  {utilitiesIncluded.map((utility: string) => (
                    <span key={utility} className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                      {utility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {houseRules.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">House Rules</h2>
                </div>
                <div className="space-y-2">
                  {houseRules.map((rule: string) => {
                    const isNegative = rule.toLowerCase().includes('no ')
                    const Icon = isNegative ? X : CheckCircle2
                    return (
                      <div
                        key={rule}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          isNegative ? 'bg-red-50' : 'bg-green-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isNegative ? 'text-red-600' : 'text-green-600'}`} />
                        <span className="text-gray-900 font-medium">{rule}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            {totalReviews > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Guest Reviews</h2>
                </div>

                {/* Rating Overview */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 mb-6 text-white">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center sm:w-1/3 pb-6 sm:pb-0 sm:border-r border-white/30">
                      <div className="text-6xl font-black mb-2">{averageRating.toFixed(1)}</div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(averageRating) ? 'fill-white text-white' : 'text-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-bold">{totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}</div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = ratingCounts[rating as keyof typeof ratingCounts]
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-sm font-bold">{rating}</span>
                              <Star className="w-3 h-3 fill-white text-white" />
                            </div>
                            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                            </div>
                            <div className="w-8 text-sm font-bold text-right">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => {
                    const avatarUrl = review.profiles?.avatar_url || null
                    const fullName = review.profiles?.full_name || 'Anonymous'
                    return (
                    <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-3 mb-3">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={fullName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {fullName.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{fullName}</h4>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span className="text-xs font-bold text-amber-700">
                                {review.rating_overall.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at || new Date().toISOString()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                    </div>
                  )})}
                </div>

                {reviews.length > 5 && (
                  <button className="mt-4 w-full py-3 rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 font-bold text-gray-700 transition-all">
                    Show All {reviews.length} Reviews
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-bold mb-4 w-fit">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Verified</span>
                </div>

                <p className="text-sm text-gray-500 font-semibold mb-1">Starting from</p>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  GYD {Number(rental.price_per_month || 0).toLocaleString()}
                </p>
                <p className="text-gray-500 mb-6">/month</p>

                {rental.price_per_week && rental.price_per_week !== null && (
                  <p className="text-sm text-gray-600 mb-2">GYD {Number(rental.price_per_week).toLocaleString()}/week</p>
                )}

                {rental.security_deposit && rental.security_deposit !== null && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700 font-bold">
                      <span className="block text-xs text-gray-500 mb-1">Security Deposit</span>
                      GYD {Number(rental.security_deposit).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <a
                    href={`https://wa.me/${rental.whatsapp_number}?text=${encodeURIComponent(
                      `Hi! I'm interested in ${rental.name} on Guyana Directory. Is it still available?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>

                  {rental.phone && rental.phone !== null && (
                    <a href={`tel:${rental.phone}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">
                      <Phone className="w-5 h-5" />
                      Call Now
                    </a>
                  )}

                  {rental.email && rental.email !== null && (
                    <a href={`mailto:${rental.email}`} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">
                      <Mail className="w-5 h-5" />
                      Email
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-center gap-6">
                  <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-semibold">Save</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
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
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Similar Properties</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarRentals.map((similar) => {
                const similarPhoto = similar.rental_photos?.find((p) => p.is_primary)?.image_url || defaultImage
                const avgRating = similar.average_rating || 0
                return (
                  <Link
                    key={similar.id}
                    href={`/rentals/${similar.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all"
                  >
                    <div className="relative h-48">
                      <Image src={similarPhoto} alt={similar.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {avgRating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">{avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{similar.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {similar.regions?.name || ''}
                      </p>
                      <p className="text-xl font-black text-gray-900">GYD {(similar.price_per_month || 0).toLocaleString()}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
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
