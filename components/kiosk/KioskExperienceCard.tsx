'use client'

import KioskMedia from './KioskMedia'
import type { KioskExperience } from '@/app/[locale]/kiosk/KioskHomePage'

interface KioskExperienceCardProps {
  experience: KioskExperience
  onClick: () => void
}

/**
 * Landscape 16:9 card for tourism experiences.
 * Shows image, name, category, rating, and price.
 */
export default function KioskExperienceCard({ experience, onClick }: KioskExperienceCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 'var(--kiosk-row-card-width)',
        aspectRatio: '16 / 9',
        borderRadius: 'var(--kiosk-radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        background: 'var(--kiosk-bg-elevated)',
        flexShrink: 0,
        transition: 'all 0.4s var(--kiosk-ease-expo)',
        textAlign: 'left',
        padding: 0,
      }}
      className="kiosk-ripple"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(16, 185, 129, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Media (video or image) */}
      <KioskMedia
        videoUrl={experience.video_url}
        imageUrl={experience.image_url}
        posterUrl={experience.video_thumbnail_url}
        alt={experience.name}
        sizes="400px"
        style={{ transition: 'transform 0.6s var(--kiosk-ease-expo)' }}
      />

      {/* Card gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--kiosk-gradient-card)',
          pointerEvents: 'none',
        }}
      />

      {/* Category badge — top left */}
      <span
        style={{
          position: 'absolute',
          top: 'var(--kiosk-sp-12)',
          left: 'var(--kiosk-sp-12)',
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'var(--kiosk-bg-cinema)',
          padding: 'var(--kiosk-sp-4) var(--kiosk-sp-12)',
          borderRadius: 'var(--kiosk-radius-full)',
          fontSize: 'var(--kiosk-text-12)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          zIndex: 2,
        }}
      >
        {experience.category_name}
      </span>

      {/* Rating — top right */}
      {experience.rating > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-12)',
            right: 'var(--kiosk-sp-12)',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            color: 'var(--kiosk-accent-gold-400)',
            padding: 'var(--kiosk-sp-4) var(--kiosk-sp-8)',
            borderRadius: 'var(--kiosk-radius-full)',
            fontSize: 'var(--kiosk-text-14)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-4)',
            zIndex: 2,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {experience.rating.toFixed(1)}
        </span>
      )}

      {/* Bottom content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--kiosk-sp-16)',
          zIndex: 2,
        }}
      >
        <h3
          style={{
            fontSize: 'var(--kiosk-text-20)',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          {experience.name}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-12)',
            marginTop: 'var(--kiosk-sp-6)',
          }}
        >
          {experience.price_from > 0 && (
            <span style={{ color: 'var(--kiosk-primary-300)', fontSize: 'var(--kiosk-text-14)', fontWeight: 600 }}>
              From ${experience.price_from.toLocaleString()}
            </span>
          )}
          {experience.duration && (
            <span style={{ color: 'var(--kiosk-text-muted)', fontSize: 'var(--kiosk-text-14)' }}>
              {experience.duration}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
