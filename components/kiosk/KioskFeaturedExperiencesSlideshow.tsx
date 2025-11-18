'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, DollarSign, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

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

interface KioskFeaturedExperiencesSlideshowProps {
  experiences: FeaturedExperience[]
  title?: string
  autoAdvance?: boolean
  autoAdvanceInterval?: number
}

export default function KioskFeaturedExperiencesSlideshow({
  experiences,
  title = "Featured Experiences",
  autoAdvance = true,
  autoAdvanceInterval = 8000
}: KioskFeaturedExperiencesSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoAdvance || experiences.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % experiences.length)
    }, autoAdvanceInterval)

    return () => clearInterval(interval)
  }, [experiences.length, autoAdvance, autoAdvanceInterval])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  if (experiences.length === 0) return null

  const currentExperience = experiences[currentIndex]

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '320px',
        maxHeight: '90vh',
        background: 'rgba(16, 34, 16, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '2px solid rgba(59, 84, 59, 1)',
        padding: '24px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
          {title}
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
          {currentIndex + 1} of {experiences.length}
        </p>
      </div>

      {/* Slideshow Content */}
      <Link
        href={`/kiosk/experience/${currentExperience.slug}`}
        style={{
          textDecoration: 'none',
          display: 'block',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            background: 'rgba(28, 39, 28, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 84, 59, 1)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            {currentExperience.image_url ? (
              <Image
                src={currentExperience.image_url}
                alt={currentExperience.name}
                fill
                className="object-cover"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(19, 236, 19, 0.2), rgba(19, 236, 19, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={60} style={{ color: 'var(--kiosk-primary-500)', opacity: 0.3 }} />
              </div>
            )}

            {/* Rating Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Star size={16} style={{ color: '#facc15', fill: '#facc15' }} />
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                {currentExperience.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                background: 'rgba(19, 236, 19, 0.15)',
                padding: '6px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'inline-block',
                alignSelf: 'flex-start'
              }}
            >
              <span style={{ color: 'var(--kiosk-primary-500)', fontWeight: 'bold', fontSize: '12px' }}>
                {currentExperience.category_name}
              </span>
            </div>

            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '12px',
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {currentExperience.name}
            </h3>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.5',
                flex: 1
              }}
            >
              {currentExperience.description}
            </p>

            {/* Meta Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {currentExperience.duration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--kiosk-primary-500)' }} />
                  <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {currentExperience.duration}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--kiosk-primary-500)' }} />
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  ${currentExperience.price_from.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, #13ec13 0%, #22c55e 100%)',
                color: '#102210',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 0 16px rgba(19, 236, 19, 0.3)'
              }}
            >
              View Details →
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows */}
      {experiences.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={goToPrevious}
            style={{
              background: 'rgba(28, 39, 28, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 84, 59, 1)',
              padding: '12px',
              borderRadius: '50%',
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
            <ChevronLeft size={20} style={{ color: 'white' }} />
          </button>

          <button
            onClick={goToNext}
            style={{
              background: 'rgba(28, 39, 28, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 84, 59, 1)',
              padding: '12px',
              borderRadius: '50%',
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
            <ChevronRight size={20} style={{ color: 'white' }} />
          </button>
        </div>
      )}

      {/* Indicators */}
      {experiences.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {experiences.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              style={{
                width: index === currentIndex ? '32px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: index === currentIndex ? 'var(--kiosk-primary-500)' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: index === currentIndex ? '0 0 10px rgba(19, 236, 19, 0.6)' : 'none'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
