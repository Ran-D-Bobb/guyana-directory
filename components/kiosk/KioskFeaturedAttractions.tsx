'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, DollarSign, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface FeaturedAttraction {
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

interface KioskFeaturedAttractionsProps {
  attractions: FeaturedAttraction[]
  title?: string
}

export default function KioskFeaturedAttractions({
  attractions,
  title = "Featured Attractions"
}: KioskFeaturedAttractionsProps) {
  const [startIndex, setStartIndex] = useState(0)
  const itemsPerPage = 3

  const visibleAttractions = attractions.slice(startIndex, startIndex + itemsPerPage)
  const canGoNext = startIndex + itemsPerPage < attractions.length
  const canGoPrev = startIndex > 0

  const handleNext = () => {
    if (canGoNext) {
      setStartIndex(startIndex + itemsPerPage)
    }
  }

  const handlePrev = () => {
    if (canGoPrev) {
      setStartIndex(startIndex - itemsPerPage)
    }
  }

  if (attractions.length === 0) return null

  return (
    <div
      style={{
        background: 'rgba(16, 34, 16, 0.5)',
        backdropFilter: 'blur(8px)',
        borderRadius: '24px',
        border: '2px solid rgba(59, 84, 59, 1)',
        padding: '48px',
        marginTop: '48px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'white' }}>
          {title}
        </h2>

        {/* Navigation Arrows */}
        {attractions.length > itemsPerPage && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              style={{
                background: canGoPrev ? 'rgba(28, 39, 28, 0.8)' : 'rgba(28, 39, 28, 0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(59, 84, 59, 1)',
                padding: '16px',
                borderRadius: '50%',
                cursor: canGoPrev ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: canGoPrev ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (canGoPrev) {
                  e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
                  e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
                }
              }}
              onMouseLeave={(e) => {
                if (canGoPrev) {
                  e.currentTarget.style.background = 'rgba(28, 39, 28, 0.8)'
                  e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
                }
              }}
            >
              <ChevronLeft size={32} style={{ color: 'white' }} />
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              style={{
                background: canGoNext ? 'rgba(28, 39, 28, 0.8)' : 'rgba(28, 39, 28, 0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(59, 84, 59, 1)',
                padding: '16px',
                borderRadius: '50%',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: canGoNext ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
                  e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
                }
              }}
              onMouseLeave={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.background = 'rgba(28, 39, 28, 0.8)'
                  e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
                }
              }}
            >
              <ChevronRight size={32} style={{ color: 'white' }} />
            </button>
          </div>
        )}
      </div>

      {/* Attractions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {visibleAttractions.map((attraction) => (
          <Link
            key={attraction.id}
            href={`/kiosk/experience/${attraction.slug}`}
            style={{
              textDecoration: 'none',
              display: 'block'
            }}
          >
            <div
              style={{
                background: 'rgba(28, 39, 28, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                border: '1px solid rgba(59, 84, 59, 1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)'
                e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.borderColor = 'rgba(59, 84, 59, 1)'
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                {attraction.image_url ? (
                  <Image
                    src={attraction.image_url}
                    alt={attraction.name}
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

                {/* Category Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(19, 236, 19, 0.95)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <span style={{ color: '#102210', fontWeight: 'bold', fontSize: '14px' }}>
                    {attraction.category_name}
                  </span>
                </div>

                {/* Rating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Star size={16} style={{ color: '#facc15', fill: '#facc15' }} />
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                    {attraction.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {attraction.name}
                </h3>

                <p
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.5'
                  }}
                >
                  {attraction.description}
                </p>

                {/* Meta Info */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {attraction.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={18} style={{ color: 'var(--kiosk-primary-500)' }} />
                      <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                        {attraction.duration}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={18} style={{ color: 'var(--kiosk-primary-500)' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      ${attraction.price_from.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Page Indicator */}
      {attractions.length > itemsPerPage && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }}>
            {Math.floor(startIndex / itemsPerPage) + 1} / {Math.ceil(attractions.length / itemsPerPage)}
          </span>
        </div>
      )}
    </div>
  )
}
