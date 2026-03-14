'use client'

import Image from 'next/image'
import type { KioskEvent } from '@/app/kiosk/KioskHomePage'

interface KioskEventCardProps {
  event: KioskEvent
  onClick: () => void
}

/** Get timing badge info for an event */
function getTimingBadge(startDate: string, endDate: string): { label: string; className: string } | null {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now >= start && now <= end) {
    return { label: 'LIVE', className: 'kiosk-badge-live' }
  }

  const diffMs = start.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 24 && diffHours > 0) {
    return { label: 'Tomorrow', className: 'kiosk-badge-tomorrow' }
  }

  if (diffHours <= 168 && diffHours > 0) {
    return { label: 'This Week', className: 'kiosk-badge-this-week' }
  }

  return null
}

/** Format event date nicely */
function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Landscape 16:9 card for events.
 * Shows image, title, date, location, and timing badge.
 */
export default function KioskEventCard({ event, onClick }: KioskEventCardProps) {
  const badge = getTimingBadge(event.start_date, event.end_date)

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
      {/* Image */}
      {event.image_url ? (
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          className="object-cover"
          sizes="400px"
          style={{ transition: 'transform 0.6s var(--kiosk-ease-expo)' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #064e3b 0%, #115e59 50%, #0f766e 100%)',
          }}
        />
      )}

      {/* Card gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--kiosk-gradient-card)',
          pointerEvents: 'none',
        }}
      />

      {/* Timing badge — top left */}
      {badge && (
        <span
          className={badge.className}
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-12)',
            left: 'var(--kiosk-sp-12)',
            zIndex: 2,
          }}
        >
          {badge.label}
        </span>
      )}

      {/* Category/type — top right */}
      {(event.category_name || event.event_type_name) && (
        <span
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-12)',
            right: 'var(--kiosk-sp-12)',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: 'var(--kiosk-sp-4) var(--kiosk-sp-12)',
            borderRadius: 'var(--kiosk-radius-full)',
            fontSize: 'var(--kiosk-text-12)',
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          {event.category_name || event.event_type_name}
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
        {/* Date */}
        <span
          style={{
            fontSize: 'var(--kiosk-text-14)',
            fontWeight: 600,
            color: 'var(--kiosk-primary-300)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {formatEventDate(event.start_date)}
        </span>

        {/* Title */}
        <h3
          style={{
            fontSize: 'var(--kiosk-text-20)',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginTop: 'var(--kiosk-sp-4)',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
          }}
        >
          {event.title}
        </h3>

        {/* Location */}
        {event.location && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-4)',
              color: 'var(--kiosk-text-muted)',
              fontSize: 'var(--kiosk-text-14)',
              marginTop: 'var(--kiosk-sp-4)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </span>
        )}
      </div>
    </button>
  )
}
