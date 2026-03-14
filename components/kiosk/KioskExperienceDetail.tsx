'use client'

import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import type { KioskExperience } from '@/app/kiosk/KioskHomePage'

interface KioskExperienceDetailProps {
  experience: KioskExperience
}

/**
 * Experience detail content for the overlay.
 * Left 60%: hero image. Right 40%: scrollable info + inline QR.
 */
export default function KioskExperienceDetail({ experience }: KioskExperienceDetailProps) {
  const detailUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/tourism/${experience.slug}`

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
        {experience.image_url ? (
          <Image
            src={experience.image_url}
            alt={experience.name}
            fill
            className="object-cover"
            sizes="60vw"
            priority
            style={{ animation: 'kiosk-ken-burns-slow 20s ease-in-out forwards' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--kiosk-gradient-tropical)' }} />
        )}

        {/* Gradient overlay for right-side bleed */}
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
        {/* Category badge */}
        <span
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--kiosk-primary-400)',
            padding: 'var(--kiosk-sp-8) var(--kiosk-sp-20)',
            borderRadius: 'var(--kiosk-radius-full)',
            fontSize: 'var(--kiosk-text-16)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          {experience.category_name}
        </span>

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
          {experience.name}
        </h1>

        {/* Rating and review count */}
        {experience.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kiosk-sp-12)' }}>
            <div style={{ display: 'flex', gap: 'var(--kiosk-sp-4)' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={star <= Math.round(experience.rating) ? 'var(--kiosk-accent-gold-400)' : 'rgba(255,255,255,0.2)'}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span style={{ color: 'var(--kiosk-text-secondary)', fontSize: 'var(--kiosk-text-18)' }}>
              {experience.rating.toFixed(1)} ({experience.review_count} reviews)
            </span>
          </div>
        )}

        {/* Detail grid */}
        <div
          className="kiosk-glass"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--kiosk-sp-20)',
            padding: 'var(--kiosk-sp-24)',
          }}
        >
          {experience.price_from > 0 && (
            <DetailItem
              icon="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
              label="Price"
              value={`From $${experience.price_from.toLocaleString()}`}
            />
          )}
          {experience.duration && (
            <DetailItem
              icon="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2"
              label="Duration"
              value={experience.duration}
            />
          )}
          {experience.difficulty_level && (
            <DetailItem
              icon="M13 10V3L4 14h7v7l9-11h-7z"
              label="Difficulty"
              value={experience.difficulty_level}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: 'var(--kiosk-text-20)', fontWeight: 700, color: 'white', marginBottom: 'var(--kiosk-sp-12)' }}>
            About
          </h3>
          <p
            style={{
              fontSize: 'var(--kiosk-text-18)',
              color: 'var(--kiosk-text-tertiary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {experience.description}
          </p>
        </div>

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
              value={detailUrl}
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

/* Helper: detail grid item */
function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--kiosk-sp-12)' }}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--kiosk-primary-400)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '2px' }}
      >
        <path d={icon} />
      </svg>
      <div>
        <span style={{ fontSize: 'var(--kiosk-text-12)', color: 'var(--kiosk-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <p style={{ fontSize: 'var(--kiosk-text-18)', color: 'white', fontWeight: 600, margin: 0 }}>
          {value}
        </p>
      </div>
    </div>
  )
}
