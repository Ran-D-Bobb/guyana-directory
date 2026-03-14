'use client'

import Image from 'next/image'
import KioskContentRow from './KioskContentRow'
import KioskExperienceCard from './KioskExperienceCard'
import type { KioskExperience, KioskCategory } from '@/app/kiosk/KioskHomePage'
import { getTourismCategoryImage } from '@/lib/category-images'

interface KioskCategoryBrowserProps {
  category: KioskCategory
  experiences: KioskExperience[]
  onOpenExperience: (exp: KioskExperience) => void
  onBack: () => void
}

/**
 * Filtered category view with hero image and experience grid.
 */
export default function KioskCategoryBrowser({
  category,
  experiences,
  onOpenExperience,
  onBack,
}: KioskCategoryBrowserProps) {
  const categoryImage = getTourismCategoryImage(category.slug)

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--kiosk-bg-cinema)',
      }}
    >
      {/* Hero header */}
      <div
        style={{
          position: 'relative',
          height: '35vh',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={categoryImage}
          alt={category.name}
          fill
          className="object-cover"
          sizes="100vw"
          style={{ animation: 'kiosk-ken-burns-slow 20s ease-in-out forwards' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--kiosk-gradient-cinema)' }} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="kiosk-glass"
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-24)',
            left: 'var(--kiosk-sp-32)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-8)',
            padding: 'var(--kiosk-sp-12) var(--kiosk-sp-20)',
            cursor: 'pointer',
            border: '1px solid var(--kiosk-glass-border)',
            color: 'white',
            fontSize: 'var(--kiosk-text-18)',
            fontWeight: 600,
            zIndex: 5,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Title */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--kiosk-sp-40)',
            left: 'var(--kiosk-sp-64)',
            zIndex: 5,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontSize: 'var(--kiosk-text-64)',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            }}
          >
            {category.name}
          </h1>
          <p style={{ fontSize: 'var(--kiosk-text-24)', color: 'var(--kiosk-text-secondary)', marginTop: 'var(--kiosk-sp-8)' }}>
            {experiences.length} experience{experiences.length !== 1 ? 's' : ''} to explore
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'var(--kiosk-sp-32)', paddingBottom: 'var(--kiosk-sp-80)' }}>
        <KioskContentRow title="All Experiences" subtitle={`${experiences.length} total`}>
          {experiences.map(exp => (
            <KioskExperienceCard
              key={exp.id}
              experience={exp}
              onClick={() => onOpenExperience(exp)}
            />
          ))}
        </KioskContentRow>
      </div>
    </div>
  )
}
