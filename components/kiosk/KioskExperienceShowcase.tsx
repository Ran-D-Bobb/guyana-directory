'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Clock, Users, MapPin, Calendar, Shield, Languages, QrCode, ArrowLeft, DollarSign, Sparkles } from 'lucide-react'
import KioskQRCode from './KioskQRCode'
import KioskFeaturedExperiencesSlideshow from './KioskFeaturedExperiencesSlideshow'

interface ExperiencePhoto {
  id: string
  image_url: string
  is_primary: boolean
}

interface ExperienceReview {
  id: string
  overall_rating: number
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

interface KioskExperienceShowcaseProps {
  experience: Experience
  featuredExperiences?: FeaturedExperience[]
  onBack: () => void
}

export default function KioskExperienceShowcase({ experience, featuredExperiences, onBack }: KioskExperienceShowcaseProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [qrType, setQrType] = useState<'page' | 'whatsapp'>('page')

  const photos = experience.tourism_photos || []
  const reviews = experience.tourism_reviews || []

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

  const primaryPhoto = photos[currentPhotoIndex]

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--kiosk-bg-base)' }}>
      {/* Background with blur */}
      <div className="absolute inset-0 z-0">
        {primaryPhoto?.image_url ? (
          <>
            <Image
              src={primaryPhoto.image_url}
              alt={experience.name}
              fill
              className="object-cover opacity-15 blur-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#102210]/95 via-[#102210]/90 to-[#102210]/95" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--kiosk-bg-base)' }} />
        )}
      </div>

      {/* Header */}
      <div className="relative z-20 px-16 pt-8 pb-6">
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
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-16 pb-16" style={{ height: 'calc(100vh - 160px)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 h-full">
          {/* Left Column - Images */}
          <div className="lg:col-span-3 flex flex-col gap-4" style={{ height: '100%' }}>
            {/* Hero Image */}
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '2px solid rgba(59, 84, 59, 1)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                height: 'calc(100% - 120px)'
              }}
            >
              {primaryPhoto?.image_url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center flex flex-col justify-end"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("${primaryPhoto.image_url}")`
                  }}
                >
                  {/* Photo Indicators */}
                  {photos.length > 1 && (
                    <div className="flex justify-center gap-2 p-5">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: idx === currentPhotoIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(19, 236, 19, 0.2), rgba(19, 236, 19, 0.05))' }}
                >
                  <Sparkles size={120} style={{ color: 'var(--kiosk-primary-500)', opacity: 0.3 }} />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-4" style={{ height: '100px' }}>
                {photos.slice(0, 5).map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    style={{
                      position: 'relative',
                      height: '100%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: idx === currentPhotoIndex ? '2px solid var(--kiosk-primary-500)' : '1px solid rgba(59, 84, 59, 1)',
                      opacity: idx === currentPhotoIndex ? 1 : 0.6,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (idx !== currentPhotoIndex) e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      if (idx !== currentPhotoIndex) e.currentTarget.style.opacity = '0.6'
                    }}
                  >
                    <Image src={photo.image_url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            {/* Title & Category */}
            <div className="flex flex-col gap-3">
              <h1 style={{ fontSize: '56px', fontWeight: '800', color: 'white', lineHeight: '1.1' }}>
                {experience.name}
              </h1>
              <p style={{ fontSize: '20px', color: 'rgba(157, 185, 157, 1)' }}>
                {experience.category_name}
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
              {experience.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1">
              {/* Duration */}
              {experience.duration && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    borderTop: '1px solid rgba(19, 236, 19, 0.2)',
                    padding: '20px 0'
                  }}
                >
                  <Clock size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Duration</p>
                    <p style={{ fontSize: '18px', color: 'white', fontWeight: '600' }}>{experience.duration}</p>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  alignItems: 'center',
                  gap: '16px',
                  borderTop: '1px solid rgba(19, 236, 19, 0.2)',
                  padding: '20px 0'
                }}
              >
                <DollarSign size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Pricing</p>
                  <p style={{ fontSize: '18px', color: 'white', fontWeight: '600' }}>
                    From ${experience.price_from.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Location */}
              {(experience.location || experience.region_name) && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    borderTop: '1px solid rgba(19, 236, 19, 0.2)',
                    borderBottom: '1px solid rgba(19, 236, 19, 0.2)',
                    padding: '20px 0'
                  }}
                >
                  <MapPin size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Location</p>
                    <p style={{ fontSize: '18px', color: 'white', fontWeight: '600' }}>
                      {experience.location}
                      {experience.region_name && `, ${experience.region_name}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional details... */}
              {experience.max_group_size && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: '1px solid rgba(19, 236, 19, 0.2)',
                    padding: '20px 0'
                  }}
                >
                  <Users size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Max Group Size</p>
                    <p style={{ fontSize: '18px', color: 'white', fontWeight: '600' }}>{experience.max_group_size} people</p>
                  </div>
                </div>
              )}

              {experience.min_age && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: '1px solid rgba(19, 236, 19, 0.2)',
                    padding: '20px 0'
                  }}
                >
                  <Calendar size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Minimum Age</p>
                    <p style={{ fontSize: '18px', color: 'white', fontWeight: '600' }}>{experience.min_age}+ years</p>
                  </div>
                </div>
              )}

              {experience.difficulty_level && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: '1px solid rgba(19, 236, 19, 0.2)',
                    padding: '20px 0'
                  }}
                >
                  <Shield size={24} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(157, 185, 157, 1)', marginBottom: '4px' }}>Difficulty Level</p>
                    <p style={{ fontSize: '18px', color: 'white', fontWeight: '600', textTransform: 'capitalize' }}>
                      {experience.difficulty_level}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingBottom: '32px' }}>
              <button
                onClick={handleShowPageQR}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'rgba(28, 39, 28, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: '20px',
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
                <QrCode size={24} />
                <span>Save to Phone</span>
              </button>

              {experience.whatsapp_number && (
                <button
                  onClick={handleShowWhatsAppQR}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    padding: '24px 32px',
                    borderRadius: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.8)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)'
                  }}
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>

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
