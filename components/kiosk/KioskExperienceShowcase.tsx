'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Star,
  Clock,
  Users,
  MapPin,
  Calendar,
  Shield,
  Languages,
  Heart,
  QrCode,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react'
import KioskQRCode from './KioskQRCode'

interface ExperiencePhoto {
  id: string
  image_url: string
  is_primary: boolean
}

interface ExperienceReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: {
    name: string
  } | null
}

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  category_name: string
  region_name: string | null
  location: string | null
  duration: string | null
  difficulty_level: string | null
  max_group_size: number | null
  min_age: number | null
  price_from: number
  rating: number
  review_count: number
  whatsapp_number: string | null
  phone: string | null
  languages_offered: string[] | null
  what_to_bring: string[] | null
  accessibility_info: string | null
  safety_information: string | null
  included_items: string[] | null
  excluded_items: string[] | null
  tourism_photos: ExperiencePhoto[]
  tourism_reviews: ExperienceReview[]
}

interface KioskExperienceShowcaseProps {
  experience: Experience
  onBack: () => void
}

export default function KioskExperienceShowcase({ experience, onBack }: KioskExperienceShowcaseProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [qrType, setQrType] = useState<'page' | 'whatsapp'>('page')

  const photos = experience.tourism_photos || []
  const reviews = experience.tourism_reviews || []

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'from-green-500 to-emerald-600'
      case 'moderate':
        return 'from-yellow-500 to-orange-500'
      case 'challenging':
        return 'from-orange-500 to-red-500'
      case 'difficult':
        return 'from-red-600 to-rose-700'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const handleShowPageQR = () => {
    setQrType('page')
    setShowQR(true)
  }

  const handleShowWhatsAppQR = () => {
    setQrType('whatsapp')
    setShowQR(true)
  }

  const getQRUrl = () => {
    if (qrType === 'whatsapp' && experience.whatsapp_number) {
      const message = encodeURIComponent(
        `Hi! I found your experience "${experience.name}" on the Guyana Tourism Kiosk and I'm interested in learning more.`
      )
      return `https://wa.me/${experience.whatsapp_number}?text=${message}`
    }
    return `${window.location.origin}/tourism/${experience.slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-8 pt-32">
      {/* Header - Back Button positioned to avoid navbar overlap */}
      <div className="max-w-[1920px] mx-auto mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-4 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all px-8 py-4 rounded-full group shadow-xl border border-white/10"
        >
          <ArrowLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
          <span className="text-2xl font-bold text-white">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Photos & Gallery */}
        <div className="xl:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <div className="relative h-[700px] rounded-2xl overflow-hidden group mb-6">
              {photos.length > 0 ? (
                <Image
                  src={photos[currentPhotoIndex].image_url}
                  alt={experience.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-50">
                    {experience.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Photo Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md hover:bg-black/70 p-4 rounded-full transition-all"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md hover:bg-black/70 p-4 rounded-full transition-all"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              {photos.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                  <span className="text-white font-bold">
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`
                      flex-shrink-0 relative w-32 h-32 rounded-xl overflow-hidden
                      transition-all duration-300
                      ${idx === currentPhotoIndex
                        ? 'ring-4 ring-yellow-400 scale-105'
                        : 'opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    <Image
                      src={photo.image_url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-3xl font-black text-white mb-4">About This Experience</h3>
            <p className="text-xl text-white/90 leading-relaxed whitespace-pre-line">
              {experience.description}
            </p>
          </div>

          {/* What's Included / Excluded */}
          {(experience.included_items || experience.excluded_items) && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {experience.included_items && experience.included_items.length > 0 && (
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-green-400 fill-green-400" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {experience.included_items.map((item, idx) => (
                        <li key={idx} className="text-lg text-white/80 flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {experience.excluded_items && experience.excluded_items.length > 0 && (
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-4">What's Not Included</h4>
                    <ul className="space-y-2">
                      {experience.excluded_items.map((item, idx) => (
                        <li key={idx} className="text-lg text-white/80 flex items-start gap-2">
                          <span className="text-red-400 mt-1">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-black text-white mb-6">Recent Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-semibold">
                        {review.profiles?.name || 'Anonymous'}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-white/80 text-lg">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details & Booking */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-4">
            <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-full">
              <span className="text-white font-bold text-lg">{experience.category_name}</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-tight">
              {experience.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold text-white">{experience.rating.toFixed(1)}</span>
              </div>
              <span className="text-xl text-white/70">({experience.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-center">
              <p className="text-white text-xl font-semibold mb-1">From</p>
              <p className="text-white text-5xl font-black">GYD {experience.price_from.toLocaleString()}</p>
              <p className="text-white/90 text-lg mt-1">per person</p>
            </div>
          </div>

          {/* Key Details */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-4">
            <h3 className="text-2xl font-black text-white mb-4">Details</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              {experience.duration && (
                <div className="bg-white/5 rounded-xl p-4">
                  <Clock className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{experience.duration}</p>
                  <p className="text-sm text-white/70">Duration</p>
                </div>
              )}

              {/* Group Size */}
              {experience.max_group_size && (
                <div className="bg-white/5 rounded-xl p-4">
                  <Users className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{experience.max_group_size}</p>
                  <p className="text-sm text-white/70">Max Group</p>
                </div>
              )}

              {/* Difficulty */}
              {experience.difficulty_level && (
                <div className="bg-white/5 rounded-xl p-4 col-span-2">
                  <div className={`inline-block bg-gradient-to-r ${getDifficultyColor(experience.difficulty_level)} px-4 py-2 rounded-full`}>
                    <span className="text-white font-bold capitalize">{experience.difficulty_level}</span>
                  </div>
                  <p className="text-sm text-white/70 mt-2">Difficulty Level</p>
                </div>
              )}
            </div>

            {/* Location */}
            {(experience.location || experience.region_name) && (
              <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                <MapPin className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-white">
                    {experience.location}
                  </p>
                  {experience.region_name && (
                    <p className="text-white/70">{experience.region_name}</p>
                  )}
                </div>
              </div>
            )}

            {/* Min Age */}
            {experience.min_age && (
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-pink-400" />
                <div>
                  <p className="text-lg font-semibold text-white">Minimum Age: {experience.min_age}+</p>
                </div>
              </div>
            )}

            {/* Languages */}
            {experience.languages_offered && experience.languages_offered.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-6 h-6 text-cyan-400" />
                  <p className="text-lg font-semibold text-white">Languages Offered</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {experience.languages_offered.map((lang, idx) => (
                    <span key={idx} className="bg-white/10 px-3 py-1 rounded-full text-white text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What to Bring */}
          {experience.what_to_bring && experience.what_to_bring.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-black text-white mb-4">What to Bring</h3>
              <ul className="space-y-2">
                {experience.what_to_bring.map((item, idx) => (
                  <li key={idx} className="text-lg text-white/80 flex items-center gap-2">
                    <span className="text-emerald-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety & Accessibility */}
          {(experience.safety_information || experience.accessibility_info) && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-4">
              {experience.safety_information && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-green-400" />
                    <h4 className="text-xl font-bold text-white">Safety Information</h4>
                  </div>
                  <p className="text-white/80">{experience.safety_information}</p>
                </div>
              )}

              {experience.accessibility_info && (
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Accessibility</h4>
                  <p className="text-white/80">{experience.accessibility_info}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-4">
            <h3 className="text-2xl font-black text-white mb-4">Book This Experience</h3>

            <button
              onClick={handleShowPageQR}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-2xl px-8 py-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <QrCode className="w-8 h-8" />
              Save to Phone
            </button>

            {experience.whatsapp_number && (
              <button
                onClick={handleShowWhatsAppQR}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-2xl px-8 py-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <Phone className="w-8 h-8" />
                Contact via WhatsApp
              </button>
            )}

            <p className="text-center text-white/60 text-lg">
              Scan the QR code to continue booking on your phone
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <KioskQRCode
          url={getQRUrl()}
          title={qrType === 'whatsapp' ? `WhatsApp: ${experience.name}` : experience.name}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
