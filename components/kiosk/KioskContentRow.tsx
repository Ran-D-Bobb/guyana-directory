'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'

interface KioskContentRowProps {
  title: string
  children: ReactNode
  /** Optional subtitle or count */
  subtitle?: string
}

/**
 * Horizontal scroll-snap rail for content cards.
 * Netflix-style row with title and scroll arrows.
 */
export default function KioskContentRow({ title, children, subtitle }: KioskContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--kiosk-row-card-width')) || 380
    const scrollAmount = cardWidth * 2 + 24
    el.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div style={{ marginBottom: 'var(--kiosk-sp-40)' }}>
      {/* Row header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '0 var(--kiosk-sp-64)',
          marginBottom: 'var(--kiosk-sp-16)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--kiosk-sp-16)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)',
              fontSize: 'var(--kiosk-text-32)',
              fontWeight: 700,
              color: 'white',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <span style={{ fontSize: 'var(--kiosk-text-16)', color: 'var(--kiosk-text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>

        {/* Scroll arrows */}
        <div style={{ display: 'flex', gap: 'var(--kiosk-sp-8)' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="kiosk-nav-arrow"
            style={{
              width: 'calc(48px * var(--kiosk-scale))',
              height: 'calc(48px * var(--kiosk-scale))',
              opacity: canScrollLeft ? 1 : 0.3,
            }}
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="kiosk-nav-arrow"
            style={{
              width: 'calc(48px * var(--kiosk-scale))',
              height: 'calc(48px * var(--kiosk-scale))',
              opacity: canScrollRight ? 1 : 0.3,
            }}
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div ref={scrollRef} className="kiosk-content-row kiosk-stagger-enter">
        {children}
      </div>
    </div>
  )
}
