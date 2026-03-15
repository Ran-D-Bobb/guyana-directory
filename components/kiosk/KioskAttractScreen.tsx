'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import KioskProgressBar from './KioskProgressBar'
import KioskMedia from './KioskMedia'

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  video_url?: string | null
  video_thumbnail_url?: string | null
  rating: number
  category_name: string
  price_from: number
  duration: string | null
}

interface KioskAttractScreenProps {
  experiences: Experience[]
  onTapToExplore: () => void
}

const SLIDE_DURATION = 10000 // 10 seconds per slide

/**
 * Cinematic idle screensaver for the kiosk.
 * Full-bleed Ken Burns slideshow with editorial typography.
 * Designed to attract attention from 10+ feet away.
 */
export default function KioskAttractScreen({ experiences, onTapToExplore }: KioskAttractScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const items = experiences.length > 0 ? experiences : []

  const advanceSlide = useCallback(() => {
    if (items.length <= 1) return
    const next = (currentIndex + 1) % items.length
    setNextIndex(next)
    setIsTransitioning(true)

    // After crossfade completes, swap
    setTimeout(() => {
      setCurrentIndex(next)
      setNextIndex(null)
      setIsTransitioning(false)
    }, 1500) // matches kiosk-crossfade-in duration
  }, [currentIndex, items.length])

  // Auto-advance slides
  useEffect(() => {
    if (items.length <= 1) return
    timerRef.current = setTimeout(advanceSlide, SLIDE_DURATION)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, advanceSlide, items.length])

  const current = items[currentIndex]
  const next = nextIndex !== null ? items[nextIndex] : null

  if (!current) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: 'var(--kiosk-bg-cinema)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onTapToExplore}
      >
        <p style={{ color: 'var(--kiosk-text-muted)', fontSize: 'var(--kiosk-text-32)' }}>
          Loading experiences...
        </p>
      </div>
    )
  }

  return (
    <div
      onClick={onTapToExplore}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--kiosk-bg-cinema)',
        cursor: 'pointer',
      }}
    >
      {/* Current Slide — Ken Burns */}
      <SlideMedia
        key={`current-${currentIndex}`}
        experience={current}
        isActive={true}
        isFadingOut={isTransitioning}
      />

      {/* Next Slide — Crossfade in */}
      {next && (
        <SlideMedia
          key={`next-${nextIndex}`}
          experience={next}
          isActive={true}
          isCrossfadingIn={true}
        />
      )}

      {/* Cinematic gradient overlay — bottom third */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--kiosk-gradient-cinema)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--kiosk-gradient-vignette)',
          pointerEvents: 'none',
        }}
      />

      {/* Waypoint logo — top left */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--kiosk-sp-40)',
          left: 'var(--kiosk-sp-48)',
          zIndex: 10,
          opacity: 0.7,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-36)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          Waypoint
        </span>
      </div>

      {/* Editorial content — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(var(--kiosk-sp-80) + calc(4px * var(--kiosk-scale)))', // above progress bar
          left: 'var(--kiosk-sp-64)',
          right: '40%',
          zIndex: 10,
        }}
      >
        {/* Category pill + rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kiosk-sp-16)', marginBottom: 'var(--kiosk-sp-24)' }}>
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.9)',
              color: 'var(--kiosk-bg-cinema)',
              padding: 'var(--kiosk-sp-8) var(--kiosk-sp-20)',
              borderRadius: 'var(--kiosk-radius-full)',
              fontSize: 'var(--kiosk-text-18)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {current.category_name}
          </span>
          {current.rating > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kiosk-sp-6)',
                color: 'var(--kiosk-accent-gold-400)',
                fontSize: 'var(--kiosk-text-20)',
                fontWeight: 700,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {current.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Experience name — hero typography */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-hero)',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {current.name}
        </h1>

        {/* One-line description */}
        <p
          style={{
            fontSize: 'var(--kiosk-text-28)',
            color: 'var(--kiosk-text-secondary)',
            marginTop: 'var(--kiosk-sp-20)',
            lineHeight: 1.4,
            maxWidth: '800px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {current.description}
        </p>

        {/* Quick info pills */}
        <div style={{ display: 'flex', gap: 'var(--kiosk-sp-16)', marginTop: 'var(--kiosk-sp-24)' }}>
          {current.price_from > 0 && (
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: 'var(--kiosk-sp-8) var(--kiosk-sp-16)',
                borderRadius: 'var(--kiosk-radius-full)',
                color: 'var(--kiosk-text-secondary)',
                fontSize: 'var(--kiosk-text-18)',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              From ${current.price_from.toLocaleString()}
            </span>
          )}
          {current.duration && (
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: 'var(--kiosk-sp-8) var(--kiosk-sp-16)',
                borderRadius: 'var(--kiosk-radius-full)',
                color: 'var(--kiosk-text-secondary)',
                fontSize: 'var(--kiosk-text-18)',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {current.duration}
            </span>
          )}
        </div>
      </div>

      {/* "Touch to Explore" CTA — center-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(25vh)',
          right: 'var(--kiosk-sp-96)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--kiosk-sp-20)',
        }}
      >
        {/* Pulsing ring container */}
        <div style={{ position: 'relative', width: 'calc(120px * var(--kiosk-scale))', height: 'calc(120px * var(--kiosk-scale))' }}>
          {/* Concentric ring animations */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                animation: `kiosk-touch-ring 2.4s ease-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          {/* Center dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(16px * var(--kiosk-scale))',
              height: 'calc(16px * var(--kiosk-scale))',
              borderRadius: '50%',
              background: 'var(--kiosk-primary-500)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
            }}
          />
        </div>
        <span
          style={{
            color: 'var(--kiosk-text-secondary)',
            fontSize: 'var(--kiosk-text-24)',
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            animation: 'kiosk-float 3s ease-in-out infinite',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Touch to Explore
        </span>
      </div>

      {/* Slide counter — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--kiosk-sp-40)',
          right: 'var(--kiosk-sp-48)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--kiosk-sp-8)',
        }}
      >
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentIndex ? 'calc(32px * var(--kiosk-scale))' : 'calc(8px * var(--kiosk-scale))',
              height: 'calc(8px * var(--kiosk-scale))',
              borderRadius: 'var(--kiosk-radius-full)',
              background: i === currentIndex ? 'var(--kiosk-primary-500)' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.5s var(--kiosk-ease-expo)',
            }}
          />
        ))}
      </div>

      {/* Full-width progress bar — absolute bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <KioskProgressBar
          key={currentIndex}
          duration={SLIDE_DURATION}
          isActive={!isTransitioning}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   SlideMedia — single slide with Ken Burns (images) or video playback
   ------------------------------------------------------------------ */
function SlideMedia({
  experience,
  isActive,
  isFadingOut,
  isCrossfadingIn,
}: {
  experience: Experience
  isActive: boolean
  isFadingOut?: boolean
  isCrossfadingIn?: boolean
}) {
  // Randomize Ken Burns direction per slide
  const [kenBurnsStyle] = useState(() => {
    const directions = [
      { from: 'scale(1) translate(0, 0)', to: 'scale(1.12) translate(-1.5%, -1%)' },
      { from: 'scale(1) translate(0, 0)', to: 'scale(1.1) translate(1%, -1.5%)' },
      { from: 'scale(1.08) translate(-1%, 1%)', to: 'scale(1) translate(0, 0)' },
      { from: 'scale(1) translate(0, 0)', to: 'scale(1.1) translate(-0.5%, 1%)' },
    ]
    return directions[Math.floor(Math.random() * directions.length)]
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isCrossfadingIn ? 0 : 1,
        animation: isCrossfadingIn
          ? 'kiosk-crossfade-in 1500ms ease-in-out forwards'
          : undefined,
        zIndex: isCrossfadingIn ? 2 : 1,
      }}
    >
      <KioskMedia
        videoUrl={experience.video_url}
        imageUrl={experience.image_url}
        posterUrl={experience.video_thumbnail_url}
        alt={experience.name}
        sizes="100vw"
        kenBurns={isActive}
        kenBurnsDuration={12}
        kenBurnsStyle={kenBurnsStyle}
        priority
      />
    </div>
  )
}
