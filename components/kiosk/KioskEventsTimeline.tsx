'use client'

import Image from 'next/image'
import type { KioskEvent } from '@/app/[locale]/kiosk/KioskHomePage'

interface KioskEventsTimelineProps {
  events: KioskEvent[]
  onOpenEvent: (event: KioskEvent) => void
}

/** Group events by week */
function groupByWeek(events: KioskEvent[]): { label: string; events: KioskEvent[] }[] {
  const now = new Date()
  const groups: { label: string; events: KioskEvent[] }[] = []
  const groupMap = new Map<string, KioskEvent[]>()

  for (const event of events) {
    const start = new Date(event.start_date)
    const diffDays = Math.floor((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let label: string
    if (diffDays < 0) {
      label = 'Happening Now'
    } else if (diffDays < 7) {
      label = 'This Week'
    } else if (diffDays < 14) {
      label = 'Next Week'
    } else {
      label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    const existing = groupMap.get(label) || []
    existing.push(event)
    groupMap.set(label, existing)
  }

  for (const [label, events] of groupMap) {
    groups.push({ label, events })
  }

  return groups
}

function formatDate(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(dateStr)
  return {
    day: d.getDate().toString(),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  }
}

/**
 * Visual vertical timeline of upcoming events.
 * Emerald line with date nodes and event cards.
 */
export default function KioskEventsTimeline({ events, onOpenEvent }: KioskEventsTimelineProps) {
  const groups = groupByWeek(events)

  if (groups.length === 0) return null

  return (
    <div
      style={{
        padding: '0 var(--kiosk-sp-64)',
        marginBottom: 'var(--kiosk-sp-48)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)',
          fontSize: 'var(--kiosk-text-32)',
          fontWeight: 700,
          color: 'white',
          marginBottom: 'var(--kiosk-sp-32)',
        }}
      >
        Events Timeline
      </h2>

      {groups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 'var(--kiosk-sp-40)' }}>
          {/* Week label */}
          <h3
            style={{
              fontSize: 'var(--kiosk-text-20)',
              fontWeight: 600,
              color: 'var(--kiosk-primary-400)',
              marginBottom: 'var(--kiosk-sp-20)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {group.label}
          </h3>

          {/* Timeline items */}
          <div style={{ position: 'relative', paddingLeft: 'calc(var(--kiosk-timeline-node-size) + var(--kiosk-sp-24))' }}>
            {/* Vertical line */}
            <div
              className="kiosk-timeline-line"
              style={{
                position: 'absolute',
                left: 'calc(var(--kiosk-timeline-node-size) / 2 - var(--kiosk-timeline-line-width) / 2)',
                top: 0,
                bottom: 0,
              }}
            />

            {group.events.map((event, ei) => {
              const date = formatDate(event.start_date)
              return (
                <div
                  key={event.id}
                  style={{
                    position: 'relative',
                    marginBottom: 'var(--kiosk-sp-24)',
                  }}
                >
                  {/* Date node on the timeline */}
                  <div
                    className="kiosk-timeline-node"
                    style={{
                      position: 'absolute',
                      left: `calc(-1 * (var(--kiosk-timeline-node-size) + var(--kiosk-sp-24)))`,
                      top: 'var(--kiosk-sp-12)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--kiosk-text-16)',
                        fontWeight: 800,
                        color: 'var(--kiosk-primary-400)',
                        lineHeight: 1,
                      }}
                    >
                      {date.day}
                    </span>
                  </div>

                  {/* Event card */}
                  <button
                    onClick={() => onOpenEvent(event)}
                    className="kiosk-glass kiosk-ripple"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--kiosk-sp-20)',
                      padding: 'var(--kiosk-sp-16)',
                      width: '100%',
                      maxWidth: 'calc(800px * var(--kiosk-scale))',
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: '1px solid var(--kiosk-glass-border)',
                      transition: 'all 0.3s var(--kiosk-ease-expo)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--kiosk-primary-500)'
                      e.currentTarget.style.transform = 'translateX(8px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--kiosk-glass-border)'
                      e.currentTarget.style.transform = ''
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 'calc(120px * var(--kiosk-scale))',
                        height: 'calc(80px * var(--kiosk-scale))',
                        borderRadius: 'var(--kiosk-radius-sm)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--kiosk-gradient-ocean)' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 'var(--kiosk-text-14)',
                          color: 'var(--kiosk-primary-300)',
                          fontWeight: 600,
                        }}
                      >
                        {date.weekday}, {date.month} {date.day}
                      </span>
                      <h4
                        style={{
                          fontSize: 'var(--kiosk-text-20)',
                          fontWeight: 700,
                          color: 'white',
                          margin: 0,
                          marginTop: 'var(--kiosk-sp-4)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </h4>
                      {event.location && (
                        <span
                          style={{
                            fontSize: 'var(--kiosk-text-14)',
                            color: 'var(--kiosk-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--kiosk-sp-4)',
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

                    {/* Arrow */}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--kiosk-text-muted)"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
