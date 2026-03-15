'use client'

import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import type { KioskEvent } from '@/app/[locale]/kiosk/KioskHomePage'

interface KioskEventDetailProps {
  event: KioskEvent
}

function formatEventDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getTimingLabel(start: string, end: string): { label: string; color: string } | null {
  const now = new Date()
  const s = new Date(start)
  const e = new Date(end)

  if (now >= s && now <= e) return { label: 'Happening Now', color: '#ef4444' }
  const diffH = (s.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (diffH > 0 && diffH <= 24) return { label: 'Tomorrow', color: '#10b981' }
  if (diffH > 0 && diffH <= 168) return { label: 'This Week', color: '#3b82f6' }
  return null
}

/**
 * Event detail content for the overlay.
 * Left 60%: hero image. Right 40%: scrollable info + inline QR.
 */
export default function KioskEventDetail({ event }: KioskEventDetailProps) {
  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.slug}`
  const timing = getTimingLabel(event.start_date, event.end_date)

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: 'var(--kiosk-bg-cinema)' }}>
      {/* Left: Hero Image — slightly wider to eliminate sub-pixel gap */}
      <div
        style={{
          width: 'calc(60% + 2px)',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--kiosk-bg-cinema)',
          marginRight: '-2px',
          zIndex: 1,
        }}
      >
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #064e3b, #0f766e, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}

        {/* Right bleed gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 60%, var(--kiosk-bg-cinema) 100%)',
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
            height: '30%',
            background: 'linear-gradient(180deg, transparent, var(--kiosk-bg-cinema))',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Right: Info Panel */}
      <div
        style={{
          width: '40%',
          height: '100%',
          overflowY: 'auto',
          padding: 'var(--kiosk-sp-48)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--kiosk-sp-24)',
          position: 'relative',
          zIndex: 2,
          background: 'var(--kiosk-bg-cinema)',
          boxShadow: '-4px 0 0 0 var(--kiosk-bg-cinema)',
        }}
      >
        {/* Timing badge */}
        {timing && (
          <span
            style={{
              alignSelf: 'flex-start',
              background: timing.color,
              color: 'white',
              padding: 'var(--kiosk-sp-8) var(--kiosk-sp-20)',
              borderRadius: 'var(--kiosk-radius-full)',
              fontSize: 'var(--kiosk-text-16)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {timing.label}
          </span>
        )}

        {/* Category */}
        {(event.category_name || event.event_type_name) && (
          <span
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              padding: 'var(--kiosk-sp-6) var(--kiosk-sp-16)',
              borderRadius: 'var(--kiosk-radius-full)',
              fontSize: 'var(--kiosk-text-14)',
              fontWeight: 700,
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            {event.category_name || event.event_type_name}
          </span>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-48)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {event.title}
        </h1>

        {/* Date & time block */}
        <div
          className="kiosk-glass"
          style={{
            padding: 'var(--kiosk-sp-24)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--kiosk-sp-16)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--kiosk-sp-12)' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--kiosk-primary-400)"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <span style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Starts
              </span>
              <p style={{ fontSize: 'var(--kiosk-text-18)', color: 'white', fontWeight: 600, margin: 0 }}>
                {formatEventDateTime(event.start_date)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--kiosk-sp-12)' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--kiosk-text-muted)"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div>
              <span style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ends
              </span>
              <p style={{ fontSize: 'var(--kiosk-text-18)', color: 'var(--kiosk-text-tertiary)', fontWeight: 600, margin: 0 }}>
                {formatEventDateTime(event.end_date)}
              </p>
            </div>
          </div>

          {event.location && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--kiosk-sp-12)' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--kiosk-primary-400)"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <span style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Location
                </span>
                <p style={{ fontSize: 'var(--kiosk-text-18)', color: 'white', fontWeight: 600, margin: 0 }}>
                  {event.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 style={{ fontSize: 'var(--kiosk-text-20)', fontWeight: 700, color: 'white', marginBottom: 'var(--kiosk-sp-12)' }}>
              About This Event
            </h3>
            <p
              style={{
                fontSize: 'var(--kiosk-text-18)',
                color: 'var(--kiosk-text-tertiary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {event.description}
            </p>
          </div>
        )}

        {/* Business info */}
        {event.business_name && (
          <div
            className="kiosk-glass"
            style={{ padding: 'var(--kiosk-sp-16)', display: 'flex', alignItems: 'center', gap: 'var(--kiosk-sp-12)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kiosk-primary-400)" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{ color: 'var(--kiosk-text-secondary)', fontSize: 'var(--kiosk-text-16)' }}>
              Hosted by <strong style={{ color: 'white' }}>{event.business_name}</strong>
            </span>
          </div>
        )}

        {/* Inline QR Code */}
        <div
          className="kiosk-glass"
          style={{
            padding: 'var(--kiosk-sp-24)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-24)',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 'var(--kiosk-sp-8)',
              borderRadius: 'var(--kiosk-radius-sm)',
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <QRCodeSVG
              value={eventUrl}
              size={120}
              level="M"
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <div>
            <p style={{ fontSize: 'var(--kiosk-text-18)', color: 'white', fontWeight: 700, margin: 0, marginBottom: 'var(--kiosk-sp-6)' }}>
              Save to Phone
            </p>
            <p style={{ fontSize: 'var(--kiosk-text-14)', color: 'var(--kiosk-text-muted)', margin: 0 }}>
              Scan this QR code to view full details on your device
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
