'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, ChevronLeft, ChevronRight, QrCode, ArrowLeft, MapPin } from 'lucide-react'
import KioskQRCode from './KioskQRCode'

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  duration: string | null
  group_size_max: number | null
  price_from: number
  difficulty_level: string | null
  location_details: string | null
  region_name: string | null
}

interface KioskCategorySlideshowProps {
  experiences: Experience[]
  categoryName: string
  onBack: () => void
}

export default function KioskCategorySlideshow({ experiences, categoryName, onBack }: KioskCategorySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [qrExperience, setQrExperience] = useState<Experience | null>(null)

  // Auto-advance every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % experiences.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [experiences.length])

  const currentExperience = experiences[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
  }

  const handleShowQR = (experience: Experience) => {
    setQrExperience(experience)
    setShowQR(true)
  }

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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        {currentExperience.image_url ? (
          <Image
            src={currentExperience.image_url}
            alt={currentExperience.name}
            fill
            className="object-cover blur-2xl scale-110 opacity-30"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 opacity-50" />
        )}
      </div>

      {/* Header - positioned to avoid navbar overlap - Responsive */}
      <div className="absolute top-20 sm:top-24 lg:top-28 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full group shadow-xl border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white group-hover:-translate-x-1 transition-transform" />
            <span className="text-base sm:text-xl lg:text-2xl font-bold text-white">Back</span>
          </button>

          <div className="bg-white/20 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full shadow-xl border border-white/10">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white">{categoryName}</h2>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive padding and grid */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-8 lg:p-16 pt-36 sm:pt-40 lg:pt-44">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Image Gallery Card - Responsive */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20">
              {/* Main Image - Responsive height */}
              <div className="relative h-[250px] sm:h-[400px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 group">
                {currentExperience.image_url ? (
                  <Image
                    src={currentExperience.image_url}
                    alt={currentExperience.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold opacity-50">
                      {currentExperience.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Difficulty Badge - Responsive */}
                {currentExperience.difficulty_level && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6">
                    <div className={`bg-gradient-to-r ${getDifficultyColor(currentExperience.difficulty_level)} px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full shadow-lg`}>
                      <span className="text-white font-bold text-xs sm:text-base lg:text-xl capitalize">{currentExperience.difficulty_level}</span>
                    </div>
                  </div>
                )}

                {/* Price Badge - Responsive */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-full">
                  <span className="text-white font-bold text-xs sm:text-base lg:text-2xl">From GYD {currentExperience.price_from.toLocaleString()}</span>
                </div>
              </div>

              {/* Thumbnail Navigation - Responsive sizing and visibility */}
              <div className="hidden sm:flex items-center justify-center gap-2 lg:gap-3">
                {experiences.slice(0, 5).map((exp, idx) => (
                  <button
                    key={exp.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`
                      transition-all duration-300 rounded-lg sm:rounded-xl overflow-hidden
                      ${idx === currentIndex
                        ? 'ring-2 sm:ring-4 ring-yellow-400 scale-110'
                        : 'opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                      {exp.image_url ? (
                        <Image
                          src={exp.image_url}
                          alt={exp.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Info Card - Responsive */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl border border-white/20 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Title - Responsive */}
              <h3 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight">
                {currentExperience.name}
              </h3>

              {/* Location - Responsive */}
              {(currentExperience.location || currentExperience.region_name) && (
                <div className="flex items-center gap-2 sm:gap-3 text-white/90">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm sm:text-lg lg:text-2xl">
                    {currentExperience.location}
                    {currentExperience.location && currentExperience.region_name && ', '}
                    {currentExperience.region_name}
                  </span>
                </div>
              )}

              {/* Description - Responsive */}
              <p className="text-sm sm:text-base lg:text-2xl text-white/90 leading-relaxed line-clamp-3 sm:line-clamp-4 lg:line-clamp-6">
                {currentExperience.description}
              </p>

              {/* Stats Grid - Responsive cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                {/* Rating */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-400 fill-yellow-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.rating.toFixed(1)}</div>
                  <div className="text-xs sm:text-sm text-white/70 mt-0.5 sm:mt-1">{currentExperience.review_count} reviews</div>
                </div>

                {/* Duration */}
                {currentExperience.duration && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.duration}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-0.5 sm:mt-1">Duration</div>
                  </div>
                )}

                {/* Group Size */}
                {currentExperience.max_group_size && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center col-span-2 sm:col-span-1">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.max_group_size}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-0.5 sm:mt-1">Max Group</div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  href={`/kiosk/experience/${currentExperience.slug}`}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-base sm:text-lg lg:text-2xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 rounded-xl sm:rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  View Details
                </Link>

                <button
                  onClick={() => handleShowQR(currentExperience)}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold text-base sm:text-lg lg:text-2xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 border border-white/30"
                >
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  <span className="hidden sm:inline">Save to Phone</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Responsive */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all p-3 sm:p-4 lg:p-6 rounded-full group"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all p-3 sm:p-4 lg:p-6 rounded-full group"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Progress Bar - Responsive */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/20 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full">
        <span className="text-white font-bold text-sm sm:text-base lg:text-xl">
          {currentIndex + 1} / {experiences.length}
        </span>
        <div className="w-32 sm:w-48 lg:w-64 h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / experiences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && qrExperience && (
        <KioskQRCode
          url={`${window.location.origin}/tourism/${qrExperience.slug}`}
          title={qrExperience.name}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
