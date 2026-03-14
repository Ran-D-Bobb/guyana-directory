'use client'

import Image from 'next/image'
import { getTourismCategoryImage } from '@/lib/category-images'
import type { KioskCategory } from '@/app/kiosk/KioskHomePage'

interface KioskCategoryCardProps {
  category: KioskCategory
  onClick: () => void
}

/**
 * Cinematic category card for the categories section.
 * Shows category image, name, icon, and experience count.
 */
export default function KioskCategoryCard({ category, onClick }: KioskCategoryCardProps) {
  const imageUrl = getTourismCategoryImage(category.slug)

  return (
    <button
      onClick={onClick}
      style={{
        flex: '0 0 auto',
        width: 'calc(280px * var(--kiosk-scale, 1))',
        aspectRatio: '4 / 3',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--kiosk-radius-lg)',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        textAlign: 'left',
        transition: 'all 0.4s var(--kiosk-ease-expo)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Background image */}
      <Image
        src={imageUrl}
        alt={category.name}
        fill
        className="object-cover"
        sizes="280px"
        style={{
          transition: 'transform 0.6s var(--kiosk-ease-expo)',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Icon circle top-right */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--kiosk-sp-16)',
          right: 'var(--kiosk-sp-16)',
          width: 'calc(44px * var(--kiosk-scale, 1))',
          height: 'calc(44px * var(--kiosk-scale, 1))',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'calc(22px * var(--kiosk-scale, 1))',
        }}
      >
        {category.icon}
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--kiosk-sp-20)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--kiosk-sp-4)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: 'var(--kiosk-text-24)',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {category.name}
        </h3>
        <span
          style={{
            fontSize: 'var(--kiosk-text-14)',
            color: 'var(--kiosk-primary-300)',
            fontWeight: 600,
          }}
        >
          {category.experience_count} {category.experience_count === 1 ? 'experience' : 'experiences'}
        </span>
        {category.description && (
          <p
            style={{
              fontSize: 'var(--kiosk-text-12)',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--kiosk-primary-500)',
          opacity: 0.7,
        }}
      />
    </button>
  )
}
