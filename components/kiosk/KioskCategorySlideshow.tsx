'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, ChevronLeft, ChevronRight, QrCode, ArrowLeft, MapPin, Eye, Sparkles, DollarSign } from 'lucide-react'
import KioskQRCode from './KioskQRCode'
import KioskFeaturedExperiencesSlideshow from './KioskFeaturedExperiencesSlideshow'

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

interface FeaturedExperience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  duration: string | null
  price_from: number
  category_name: string
}

interface KioskCategorySlideshowProps {
  experiences: Experience[]
  categoryName: string
  featuredExperiences?: FeaturedExperience[]
  onBack: () => void
}

export default function KioskCategorySlideshow({ experiences, categoryName, featuredExperiences, onBack }: KioskCategorySlideshowProps) {
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
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--kiosk-bg-base)' }}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {currentExperience.image_url ? (
          <>
            <Image
              src={currentExperience.image_url}
              alt={currentExperience.name}
              fill
              className="object-cover opacity-20 blur-sm"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#102210]/90 via-[#102210]/80 to-[#102210]/95" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--kiosk-bg-base)' }} />
        )}
      </div>

      {/* Header */}
      <div className="relative z-20 px-16 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderRadius: '9999px',
              border: '1px solid rgba(19, 236, 19, 0.5)',
              background: 'rgba(16, 34, 16, 0.8)',
              padding: '16px 32px',
              color: 'white',
              fontSize: '24px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 34, 16, 0.8)'
            }}
          >
            <ArrowLeft size={28} />
            <span>Back to Categories</span>
          </button>

          <div
            style={{
              background: 'rgba(28, 39, 28, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '16px 48px',
              borderRadius: '9999px',
              border: '2px solid rgba(59, 84, 59, 1)'
            }}
          >
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>{categoryName}</h2>
          </div>

          <div style={{ width: '250px' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-16 pb-32" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="max-w-7xl w-full grid grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '2px solid rgba(59, 84, 59, 1)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Main Image */}
              <div className="relative h-[650px] group">
                {currentExperience.image_url ? (
                  <Image
                    src={currentExperience.image_url}
                    alt={currentExperience.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'var(--kiosk-gradient-tropical)' }}
                  >
                    <Sparkles size={120} style={{ color: 'var(--kiosk-primary-500)', opacity: 0.5 }} />
                  </div>
                )}

                {/* Gradient Overlay at Bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(16, 34, 16, 0.9) 0%, transparent 100%)'
                  }}
                />

                {/* Difficulty Badge */}
                {currentExperience.difficulty_level && (
                  <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${
                          currentExperience.difficulty_level.toLowerCase() === 'easy' ? '#22c55e, #16a34a' :
                          currentExperience.difficulty_level.toLowerCase() === 'moderate' ? '#eab308, #f97316' :
                          '#ef4444, #dc2626'
                        })`,
                        padding: '12px 24px',
                        borderRadius: '9999px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', textTransform: 'capitalize' }}>
                        {currentExperience.difficulty_level}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Badge */}
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      background: 'rgba(19, 236, 19, 0.95)',
                      padding: '16px 32px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 16px rgba(19, 236, 19, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={28} style={{ color: '#102210' }} />
                      <span style={{ color: '#102210', fontWeight: 'bold', fontSize: '28px' }}>
                        ${currentExperience.price_from.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#102210', opacity: 0.8 }}>Starting Price</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="flex flex-col gap-8">
            {/* Title */}
            <h3 style={{ fontSize: '56px', fontWeight: '800', color: 'white', lineHeight: '1.1' }}>
              {currentExperience.name}
            </h3>

            {/* Location */}
            {(currentExperience.location_details || currentExperience.region_name) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={28} style={{ color: 'var(--kiosk-primary-500)' }} />
                <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  {currentExperience.location_details}
                  {currentExperience.location_details && currentExperience.region_name && ', '}
                  {currentExperience.region_name}
                </span>
              </div>
            )}

            {/* Description */}
            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', maxHeight: '140px', overflow: 'hidden' }}>
              {currentExperience.description}
            </p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* Rating */}
              <div
                style={{
                  background: 'rgba(28, 39, 28, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(59, 84, 59, 1)'
                }}
              >
                <Star size={40} style={{ color: '#facc15', fill: '#facc15', margin: '0 auto 12px' }} />
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{currentExperience.rating.toFixed(1)}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
                  {currentExperience.review_count} reviews
                </div>
              </div>

              {/* Duration */}
              {currentExperience.duration && (
                <div
                  style={{
                    background: 'rgba(28, 39, 28, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 84, 59, 1)'
                  }}
                >
                  <Clock size={40} style={{ color: '#60a5fa', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{currentExperience.duration}</div>
                  <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>Duration</div>
                </div>
              )}

              {/* Group Size */}
              {currentExperience.group_size_max && (
                <div
                  style={{
                    background: 'rgba(28, 39, 28, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(59, 84, 59, 1)'
                  }}
                >
                  <Users size={40} style={{ color: '#c084fc', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{currentExperience.group_size_max}</div>
                  <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>Max Group</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <Link
                href={`/kiosk/experience/${currentExperience.slug}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'linear-gradient(135deg, #13ec13 0%, #22c55e 50%, #10c010 100%)',
                  color: '#102210',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  padding: '24px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 0 40px rgba(19, 236, 19, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Eye size={28} />
                <span>View Full Details</span>
              </Link>

              <button
                onClick={() => handleShowQR(currentExperience)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'rgba(28, 39, 28, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  padding: '24px 32px',
                  borderRadius: '16px',
                  border: '1px solid rgba(59, 84, 59, 1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
                  e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(28, 39, 28, 0.8)'
                  e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
                }}
              >
                <QrCode size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        style={{
          position: 'absolute',
          left: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(28, 39, 28, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(59, 84, 59, 1)',
          padding: '24px',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
          e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(28, 39, 28, 0.8)'
          e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <ChevronLeft size={48} style={{ color: 'white' }} />
      </button>

      <button
        onClick={goToNext}
        style={{
          position: 'absolute',
          right: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(28, 39, 28, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(59, 84, 59, 1)',
          padding: '24px',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
          e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(28, 39, 28, 0.8)'
          e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <ChevronRight size={48} style={{ color: 'white' }} />
      </button>

      {/* Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'rgba(28, 39, 28, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '20px 40px',
          borderRadius: '9999px',
          border: '2px solid rgba(59, 84, 59, 1)'
        }}
      >
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>
          {currentIndex + 1} / {experiences.length}
        </span>
        <div
          style={{
            width: '320px',
            height: '8px',
            background: 'rgba(59, 84, 59, 1)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #13ec13 0%, #22c55e 100%)',
              width: `${((currentIndex + 1) / experiences.length) * 100}%`,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 12px rgba(19, 236, 19, 0.6)'
            }}
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

      {/* Featured Experiences Slideshow - Fixed to right side */}
      {featuredExperiences && featuredExperiences.length > 0 && (
        <KioskFeaturedExperiencesSlideshow
          experiences={featuredExperiences}
          title="Featured"
          autoAdvance={true}
          autoAdvanceInterval={10000}
        />
      )}
    </div>
  )
}
