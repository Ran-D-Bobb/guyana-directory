'use client'

import { ReactNode, useEffect } from 'react'

interface KioskDetailOverlayProps {
  children: ReactNode
  isExiting: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Full-screen modal overlay for experience/event details.
 * Slides up from bottom with backdrop blur.
 */
export default function KioskDetailOverlay({
  children,
  isExiting,
  onClose,
  onPrev,
  onNext,
}: KioskDetailOverlayProps) {
  // Trap focus inside overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext])

  return (
    <>
      {/* Backdrop */}
      <div
        className="kiosk-overlay-backdrop"
        onClick={onClose}
        style={{ opacity: isExiting ? 0 : 1, transition: 'opacity 0.4s ease' }}
      />

      {/* Overlay container */}
      <div
        className={`kiosk-overlay-container ${isExiting ? 'exiting' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Detail view"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-24)',
            right: 'var(--kiosk-sp-24)',
            zIndex: 10,
            width: 'calc(56px * var(--kiosk-scale))',
            height: 'calc(56px * var(--kiosk-scale))',
            borderRadius: '50%',
            background: 'var(--kiosk-glass-bg-heavy)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--kiosk-glass-border)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s var(--kiosk-ease-expo)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--kiosk-glass-bg-heavy)'
            e.currentTarget.style.borderColor = 'var(--kiosk-glass-border)'
          }}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="kiosk-nav-arrow"
            style={{
              position: 'absolute',
              left: 'var(--kiosk-sp-24)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 'calc(64px * var(--kiosk-scale))',
              height: 'calc(64px * var(--kiosk-scale))',
            }}
            aria-label="Previous item"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="kiosk-nav-arrow"
            style={{
              position: 'absolute',
              right: 'var(--kiosk-sp-24)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 'calc(64px * var(--kiosk-scale))',
              height: 'calc(64px * var(--kiosk-scale))',
            }}
            aria-label="Next item"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--kiosk-bg-cinema)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
