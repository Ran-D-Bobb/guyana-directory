'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bed, Bath, Users, Maximize, Wifi, Wind, Car, Star, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Database } from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'

type Rental = Database['public']['Tables']['rentals']['Row'] & {
  rental_photos: Array<{
    id?: string
    image_url: string
    is_primary: boolean | null
    display_order: number | null
  }>
  rental_categories: {
    name: string
    icon: string
  }
  regions: {
    name: string
  } | null
}

interface RentalCardProps {
  rental: Rental
  onSaveToggle?: (rentalId: string, isSaved: boolean) => void
  isSaved?: boolean
}

const DEFAULT_RENTAL_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'

export function RentalCard({ rental, onSaveToggle, isSaved = false }: RentalCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const supabase = createClient()

  const photos = rental.rental_photos
    ?.sort((a, b) => {
      if (a.is_primary) return -1
      if (b.is_primary) return 1
      return (a.display_order || 0) - (b.display_order || 0)
    })
    .slice(0, 3) || []

  const displayPhoto = photos[currentPhotoIndex]?.image_url || DEFAULT_RENTAL_IMAGE

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newSavedState = !saved
    setSaved(newSavedState)

    // Call parent callback
    onSaveToggle?.(rental.id, newSavedState)

    // Update database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin?redirect=/rentals/' + rental.slug
      return
    }

    if (newSavedState) {
      await supabase.from('rental_saved').insert({
        rental_id: rental.id,
        user_id: user.id,
      })
    } else {
      await supabase.from('rental_saved').delete().match({
        rental_id: rental.id,
        user_id: user.id,
      })
    }
  }

  const handlePhotoNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (direction === 'next') {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    } else {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const formatPrice = (pricePerMonth?: number | null, pricePerNight?: number | null) => {
    if (pricePerNight) {
      return `GYD ${pricePerNight.toLocaleString()}/night`
    }
    if (pricePerMonth) {
      return `GYD ${pricePerMonth.toLocaleString()}/month`
    }
    return 'Contact for price'
  }

  const topAmenities = [
    { key: 'has_wifi', icon: Wifi, label: 'WiFi' },
    { key: 'has_ac', icon: Wind, label: 'AC' },
    { key: 'has_parking', icon: Car, label: 'Parking' },
  ].filter((amenity) => rental[amenity.key as keyof Rental])

  return (
    <Link
      href={`/rentals/${rental.slug}`}
      className="block group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Photo Carousel */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <Image
          src={displayPhoto}
          alt={rental.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
          {rental.rental_categories.name}
        </div>

        {/* Save to Wishlist Button */}
        <button
          onClick={handleSaveToggle}
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              saved ? 'fill-red-500 text-red-500' : 'text-gray-700'
            }`}
          />
        </button>

        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => handlePhotoNavigation('prev', e)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => handlePhotoNavigation('next', e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Photo Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Info */}
      <div className="p-4">
        {/* Location & Name */}
        <div className="mb-3">
          {rental.regions && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span>{rental.regions.name}</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {rental.name}
          </h3>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          {rental.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{rental.bedrooms === 0 ? 'Studio' : `${rental.bedrooms} bed`}</span>
            </div>
          )}
          {rental.bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{rental.bathrooms} bath</span>
            </div>
          )}
          {rental.max_guests && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{rental.max_guests}</span>
            </div>
          )}
          {rental.square_feet && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{rental.square_feet} sqft</span>
            </div>
          )}
        </div>

        {/* Top Amenities */}
        {topAmenities.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            {topAmenities.map((amenity) => (
              <div
                key={amenity.key}
                className="flex items-center gap-1 text-xs text-gray-600"
                title={amenity.label}
              >
                <amenity.icon className="h-4 w-4" />
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rating & Reviews */}
        {rental.rating && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{rental.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-600">
              ({rental.review_count} {rental.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(rental.price_per_month, rental.price_per_night)}
            </p>
            {rental.price_per_week && rental.price_per_month && (
              <p className="text-xs text-emerald-600 font-medium">
                Weekly/Monthly discounts available
              </p>
            )}
          </div>

          {/* WhatsApp Quick Inquiry */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(
                `https://wa.me/${rental.whatsapp_number}?text=${encodeURIComponent(
                  `Hi! I'm interested in ${rental.name} on Guyana Directory.`
                )}`,
                '_blank'
              )
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
            aria-label="Contact via WhatsApp"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
