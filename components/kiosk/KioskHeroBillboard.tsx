'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import KioskProgressBar from './KioskProgressBar'
import type { KioskExperience, KioskEvent } from '@/app/kiosk/KioskHomePage'

type HeroItem =
  | { type: 'experience'; data: KioskExperience }
  | { type: 'event'; data: KioskEvent }

interface KioskHeroBillboardProps {
  featuredExperiences: KioskExperience[]
  featuredEvents: KioskEvent[]
  onOpenExperience: (exp: KioskExperience) => void
  onOpenEvent: (evt: KioskEvent) => void
}

const HERO_DURATION = 8000 // 8 seconds per hero

/**
 * Auto-rotating hero billboard at the top of Home Hub.
 * Mixes featured experiences and events.
 */
export default function KioskHeroBillboard({
  featuredExperiences,
  featuredEvents,
  onOpenExperience,
  onOpenEvent,
}: KioskHeroBillboardProps) {
  // Interleave experiences and events
  const heroItems: HeroItem[] = [
    ...featuredExperiences.slice(0, 5).map(e => ({ type: 'experience' as const, data: e })),
    ...featuredEvents.filter(e => e.image_url).slice(0, 3).map(e => ({ type: 'event' as const, data: e })),
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const advanceSlide = useCallback(() => {
    if (heroItems.length <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % heroItems.length)
      setIsTransitioning(false)
    }, 600)
  }, [heroItems.length])

  useEffect(() => {
    if (heroItems.length <= 1) return
    timerRef.current = setTimeout(advanceSlide, HERO_DURATION)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, advanceSlide, heroItems.length])

  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 400)
  }

  if (heroItems.length === 0) return null

  const current = heroItems[currentIndex]
  const isExperience = current.type === 'experience'
  const exp = isExperience ? (current.data as KioskExperience) : null
  const evt = !isExperience ? (current.data as KioskEvent) : null

  const title = isExperience ? exp!.name : evt!.title
  const description = isExperience ? exp!.description : (evt!.description || '')
  const imageUrl = isExperience ? exp!.image_url : evt!.image_url
  const categoryLabel = isExperience ? exp!.category_name : (evt!.category_name || evt!.event_type_name || 'Event')

  const handleClick = () => {
    if (isExperience) onOpenExperience(exp!)
    else onOpenEvent(evt!)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '55vh',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background image with Ken Burns */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isTransitioning ? 0.5 : 1,
          transition: 'opacity 0.6s ease-in-out',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            style={{
              animation: 'kiosk-ken-burns-slow 15s ease-in-out forwards',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--kiosk-gradient-tropical)' }} />
        )}
      </div>

      {/* Left gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--kiosk-gradient-hero-left)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, var(--kiosk-bg-cinema) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glass info panel — left side */}
      <div
        style={{
          position: 'absolute',
          left: 'var(--kiosk-sp-64)',
          bottom: 'var(--kiosk-sp-48)',
          maxWidth: '45%',
          zIndex: 5,
        }}
      >
        {/* Category + type badge */}
        <div style={{ display: 'flex', gap: 'var(--kiosk-sp-12)', marginBottom: 'var(--kiosk-sp-16)' }}>
          <span
            style={{
              background: isExperience ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: 'var(--kiosk-sp-6) var(--kiosk-sp-16)',
              borderRadius: 'var(--kiosk-radius-full)',
              fontSize: 'var(--kiosk-text-16)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {categoryLabel}
          </span>
          {isExperience && exp!.rating > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kiosk-sp-6)',
                color: 'var(--kiosk-accent-gold-400)',
                fontSize: 'var(--kiosk-text-18)',
                fontWeight: 700,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {exp!.rating.toFixed(1)}
            </span>
          )}
          {!isExperience && (
            <span style={{ color: 'var(--kiosk-primary-300)', fontSize: 'var(--kiosk-text-16)', fontWeight: 600 }}>
              {new Date(evt!.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-56)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            margin: 0,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          }}
        >
          {title}
        </h1>

        {/* Description — 2 lines max */}
        <p
          style={{
            fontSize: 'var(--kiosk-text-20)',
            color: 'var(--kiosk-text-secondary)',
            marginTop: 'var(--kiosk-sp-12)',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          {description}
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 'var(--kiosk-sp-16)', marginTop: 'var(--kiosk-sp-24)' }}>
          <button
            onClick={handleClick}
            style={{
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              color: 'var(--kiosk-bg-cinema)',
              padding: 'var(--kiosk-sp-16) var(--kiosk-sp-32)',
              borderRadius: 'var(--kiosk-radius-md)',
              fontSize: 'var(--kiosk-text-20)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s var(--kiosk-ease-expo)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              minHeight: 'var(--kiosk-touch-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-8)',
            }}
          >
            View Details
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      {heroItems.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--kiosk-sp-24)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 'var(--kiosk-sp-8)',
            zIndex: 5,
          }}
        >
          {heroItems.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: i === currentIndex ? 'calc(32px * var(--kiosk-scale))' : 'calc(10px * var(--kiosk-scale))',
                height: 'calc(10px * var(--kiosk-scale))',
                borderRadius: 'var(--kiosk-radius-full)',
                background: i === currentIndex ? 'var(--kiosk-primary-500)' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s var(--kiosk-ease-expo)',
                padding: 0,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5 }}>
        <KioskProgressBar
          key={currentIndex}
          duration={HERO_DURATION}
          isActive={!isTransitioning}
        />
      </div>
    </div>
  )
}
