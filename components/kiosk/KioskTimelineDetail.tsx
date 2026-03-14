'use client'

import Image from 'next/image'
import type { KioskTimelineEvent } from '@/app/kiosk/KioskHomePage'

interface KioskTimelineDetailProps {
  event: KioskTimelineEvent
}

/**
 * Detail view for an annual holiday/festival from the timeline.
 * Left 60%: hero image with gradient, Right 40%: festival info.
 */
export default function KioskTimelineDetail({ event }: KioskTimelineDetailProps) {
  const hasImage = event.media_url || event.thumbnail_url
  const imageUrl = event.thumbnail_url || event.media_url

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'var(--kiosk-bg-cinema)',
      }}
    >
      {/* Left — Hero Image */}
      <div
        style={{
          width: '60%',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Background gradient fallback */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: event.gradient_colors || 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
          }}
        />
        {hasImage && (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="60vw"
            priority
            style={{
              animation: 'kiosk-ken-burns-slow 20s ease-in-out forwards',
            }}
          />
        )}
        {/* Right-bleed gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 50%, var(--kiosk-bg-cinema) 100%)',
          }}
        />
        {/* Bottom vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 60%, rgba(8,15,12,0.6) 100%)',
          }}
        />

        {/* Large month display */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--kiosk-sp-48)',
            left: 'var(--kiosk-sp-48)',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 'var(--kiosk-text-80)',
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontWeight: 900,
              color: event.accent_color || 'var(--kiosk-primary-400)',
              lineHeight: 0.9,
              opacity: 0.3,
            }}
          >
            {event.month_short}
          </div>
          <div
            style={{
              fontSize: 'var(--kiosk-text-48)',
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontWeight: 900,
              color: 'white',
              opacity: 0.2,
              marginTop: 'calc(-8px * var(--kiosk-scale, 1))',
            }}
          >
            {event.day}
          </div>
        </div>
      </div>

      {/* Right — Info Panel */}
      <div
        style={{
          width: '40%',
          overflowY: 'auto',
          padding: 'var(--kiosk-sp-48)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--kiosk-sp-24)',
        }}
      >
        {/* Category badge */}
        <span
          style={{
            display: 'inline-block',
            width: 'fit-content',
            fontSize: 'var(--kiosk-text-12)',
            fontWeight: 700,
            color: 'white',
            background: `${event.accent_color || 'var(--kiosk-primary-500)'}90`,
            padding: 'var(--kiosk-sp-6) var(--kiosk-sp-16)',
            borderRadius: 'var(--kiosk-radius-pill)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {event.category}
        </span>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-48)',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {event.title}
        </h1>

        {/* Subtitle */}
        {event.subtitle && (
          <p
            style={{
              fontSize: 'var(--kiosk-text-20)',
              color: event.accent_color || 'var(--kiosk-primary-300)',
              margin: 0,
              fontWeight: 600,
              fontStyle: 'italic',
            }}
          >
            {event.subtitle}
          </p>
        )}

        {/* Date & Location block */}
        <div
          className="kiosk-glass"
          style={{
            padding: 'var(--kiosk-sp-24)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--kiosk-sp-16)',
            border: `1px solid ${event.accent_color || 'var(--kiosk-glass-border)'}30`,
          }}
        >
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kiosk-sp-12)' }}>
            <div
              style={{
                width: 'calc(44px * var(--kiosk-scale, 1))',
                height: 'calc(44px * var(--kiosk-scale, 1))',
                borderRadius: 'var(--kiosk-radius-sm)',
                background: `${event.accent_color || 'var(--kiosk-primary-500)'}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={event.accent_color || 'var(--kiosk-primary-400)'} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date
              </div>
              <div style={{ fontSize: 'var(--kiosk-text-20)', color: 'white', fontWeight: 700 }}>
                {event.month} {event.day}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kiosk-sp-12)' }}>
              <div
                style={{
                  width: 'calc(44px * var(--kiosk-scale, 1))',
                  height: 'calc(44px * var(--kiosk-scale, 1))',
                  borderRadius: 'var(--kiosk-radius-sm)',
                  background: `${event.accent_color || 'var(--kiosk-primary-500)'}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={event.accent_color || 'var(--kiosk-primary-400)'} strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Location
                </div>
                <div style={{ fontSize: 'var(--kiosk-text-18)', color: 'white', fontWeight: 600 }}>
                  {event.location}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3
              style={{
                fontSize: 'var(--kiosk-text-16)',
                fontWeight: 700,
                color: 'var(--kiosk-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--kiosk-sp-12)',
              }}
            >
              About This Festival
            </h3>
            <p
              style={{
                fontSize: 'var(--kiosk-text-18)',
                color: 'var(--kiosk-text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {event.description}
            </p>
          </div>
        )}

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: 'var(--kiosk-text-16)',
                fontWeight: 700,
                color: 'var(--kiosk-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--kiosk-sp-16)',
              }}
            >
              Highlights
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--kiosk-sp-8)',
              }}
            >
              {event.highlights.map((highlight, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--kiosk-sp-6)',
                    fontSize: 'var(--kiosk-text-14)',
                    color: 'white',
                    background: `${event.accent_color || 'var(--kiosk-primary-500)'}15`,
                    border: `1px solid ${event.accent_color || 'var(--kiosk-primary-500)'}30`,
                    padding: 'var(--kiosk-sp-8) var(--kiosk-sp-16)',
                    borderRadius: 'var(--kiosk-radius-pill)',
                    fontWeight: 500,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={event.accent_color || 'var(--kiosk-primary-400)'} stroke="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Accent divider */}
        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, ${event.accent_color || 'var(--kiosk-primary-500)'}60, transparent)`,
            marginTop: 'var(--kiosk-sp-8)',
          }}
        />

        {/* Annual event note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-12)',
            padding: 'var(--kiosk-sp-16) var(--kiosk-sp-20)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--kiosk-radius-sm)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kiosk-text-muted)" strokeWidth="1.5">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span
            style={{
              fontSize: 'var(--kiosk-text-14)',
              color: 'var(--kiosk-text-muted)',
              fontStyle: 'italic',
            }}
          >
            This is an annual event celebrated every year in Guyana
          </span>
        </div>
      </div>
    </div>
  )
}
