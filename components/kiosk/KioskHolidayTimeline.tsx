'use client'

import Image from 'next/image'
import type { KioskTimelineEvent } from '@/app/[locale]/kiosk/KioskHomePage'

interface KioskHolidayTimelineProps {
  events: KioskTimelineEvent[]
  onOpenEvent: (event: KioskTimelineEvent) => void
}

/**
 * Cinematic horizontal timeline of Guyana's annual holidays and festivals.
 * Each card shows the festival with its custom gradient, date, and highlights.
 */
export default function KioskHolidayTimeline({ events, onOpenEvent }: KioskHolidayTimelineProps) {
  if (events.length === 0) return null

  return (
    <div
      style={{
        padding: '0 var(--kiosk-sp-64)',
        marginBottom: 'var(--kiosk-sp-48)',
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 'var(--kiosk-sp-32)',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontSize: 'var(--kiosk-text-40)',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Annual Festivals & Holidays
          </h2>
          <p
            style={{
              fontSize: 'var(--kiosk-text-18)',
              color: 'var(--kiosk-text-secondary)',
              marginTop: 'var(--kiosk-sp-8)',
            }}
          >
            Journey through Guyana&apos;s most celebrated events
          </p>
        </div>
      </div>

      {/* Horizontal timeline with connected nodes */}
      <div style={{ position: 'relative' }}>
        {/* Horizontal connecting line */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--kiosk-sp-20))',
            left: 'var(--kiosk-sp-24)',
            right: 'var(--kiosk-sp-24)',
            height: 'calc(3px * var(--kiosk-scale, 1))',
            background: 'linear-gradient(90deg, var(--kiosk-primary-600), var(--kiosk-primary-400), var(--kiosk-primary-600))',
            borderRadius: '2px',
            zIndex: 0,
            opacity: 0.5,
          }}
        />

        {/* Scrollable cards */}
        <div
          className="kiosk-content-row"
          style={{
            display: 'flex',
            gap: 'var(--kiosk-sp-24)',
            overflowX: 'auto',
            paddingTop: 'var(--kiosk-sp-48)',
            paddingBottom: 'var(--kiosk-sp-16)',
            scrollSnapType: 'x mandatory',
          }}
        >
          {events.map((event, index) => (
            <button
              key={event.id}
              onClick={() => onOpenEvent(event)}
              style={{
                flex: '0 0 auto',
                width: 'calc(320px * var(--kiosk-scale, 1))',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                border: 'none',
                background: 'none',
                padding: 0,
              }}
            >
              {/* Month node on timeline */}
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(-1 * var(--kiosk-sp-32))',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 'calc(40px * var(--kiosk-scale, 1))',
                    height: 'calc(40px * var(--kiosk-scale, 1))',
                    borderRadius: '50%',
                    background: event.accent_color || 'var(--kiosk-primary-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${event.accent_color || 'var(--kiosk-primary-500)'}60`,
                    border: '3px solid var(--kiosk-bg-cinema)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--kiosk-text-12)',
                      fontWeight: 800,
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {event.month_short}
                  </span>
                </div>
              </div>

              {/* Card */}
              <div
                style={{
                  borderRadius: 'var(--kiosk-radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  transition: 'all 0.4s var(--kiosk-ease-expo)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  e.currentTarget.style.boxShadow = `0 20px 60px ${event.accent_color || 'var(--kiosk-primary-500)'}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                {/* Background gradient + image */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: event.gradient_colors || 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
                  }}
                />
                {(event.media_url || event.thumbnail_url) && (
                  <Image
                    src={event.thumbnail_url || event.media_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                    style={{ opacity: 0.6 }}
                  />
                )}

                {/* Cinema overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)',
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'var(--kiosk-sp-24)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--kiosk-sp-8)',
                  }}
                >
                  {/* Category badge */}
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 'var(--kiosk-text-11)',
                      fontWeight: 700,
                      color: 'white',
                      background: `${event.accent_color || 'var(--kiosk-primary-500)'}90`,
                      padding: 'var(--kiosk-sp-4) var(--kiosk-sp-12)',
                      borderRadius: 'var(--kiosk-radius-pill)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      width: 'fit-content',
                    }}
                  >
                    {event.category}
                  </span>

                  {/* Date */}
                  <span
                    style={{
                      fontSize: 'var(--kiosk-text-14)',
                      fontWeight: 600,
                      color: event.accent_color || 'var(--kiosk-primary-300)',
                    }}
                  >
                    {event.month} {event.day}
                  </span>

                  {/* Title */}
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
                    {event.title}
                  </h3>

                  {/* Subtitle */}
                  {event.subtitle && (
                    <p
                      style={{
                        fontSize: 'var(--kiosk-text-14)',
                        color: 'rgba(255,255,255,0.7)',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {event.subtitle}
                    </p>
                  )}

                  {/* Highlights preview */}
                  {event.highlights && event.highlights.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--kiosk-sp-4)',
                        marginTop: 'var(--kiosk-sp-4)',
                      }}
                    >
                      {event.highlights.slice(0, 2).map((h, hi) => (
                        <span
                          key={hi}
                          style={{
                            fontSize: 'var(--kiosk-text-11)',
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(255,255,255,0.1)',
                            padding: 'var(--kiosk-sp-2) var(--kiosk-sp-8)',
                            borderRadius: 'var(--kiosk-radius-pill)',
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accent border glow on bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: event.accent_color || 'var(--kiosk-primary-500)',
                    opacity: 0.8,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
