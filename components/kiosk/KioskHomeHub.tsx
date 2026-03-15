'use client'

import { useState, useRef } from 'react'
import KioskHeroBillboard from './KioskHeroBillboard'
import KioskContentRow from './KioskContentRow'
import KioskExperienceCard from './KioskExperienceCard'
import KioskEventCard from './KioskEventCard'
import KioskCategoryCard from './KioskCategoryCard'
import KioskHolidayTimeline from './KioskHolidayTimeline'
import KioskNavigationPill from './KioskNavigationPill'
import type { KioskExperience, KioskEvent, KioskCategory, KioskTimelineEvent } from '@/app/[locale]/kiosk/KioskHomePage'

interface KioskHomeHubProps {
  featuredExperiences: KioskExperience[]
  allExperiences: KioskExperience[]
  categories: KioskCategory[]
  upcomingEvents: KioskEvent[]
  timelineEvents: KioskTimelineEvent[]
  onOpenExperience: (exp: KioskExperience, siblings?: KioskExperience[]) => void
  onOpenEvent: (evt: KioskEvent, siblings?: KioskEvent[]) => void
  onOpenTimelineEvent: (evt: KioskTimelineEvent, siblings?: KioskTimelineEvent[]) => void
  onBackToAttract: () => void
}

/**
 * Netflix-style scrollable home hub.
 * Hero billboard + 3 clearly separated sections:
 *   1. Experiences — Featured + per-category rows
 *   2. Events — Happening Now & Soon + Upcoming + Annual Festivals Timeline
 *   3. Categories — Visual grid of tourism categories
 */
export default function KioskHomeHub({
  featuredExperiences,
  allExperiences,
  categories,
  upcomingEvents,
  timelineEvents,
  onOpenExperience,
  onOpenEvent,
  onOpenTimelineEvent,
  onBackToAttract,
}: KioskHomeHubProps) {
  const [activeSection, setActiveSection] = useState('experiences')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const experiencesSectionRef = useRef<HTMLDivElement>(null)
  const eventsSectionRef = useRef<HTMLDivElement>(null)
  const categoriesSectionRef = useRef<HTMLDivElement>(null)

  // Group experiences by category for per-category rows
  const categoriesWithExperiences = categories
    .filter(c => c.experience_count >= 1)
    .map(category => ({
      ...category,
      experiences: allExperiences.filter(e => e.category_name === category.name),
    }))
    .filter(c => c.experiences.length >= 1)

  // Separate events into "soon" (7 days) and "later"
  const now = new Date()
  const soonEvents = upcomingEvents.filter(e => {
    const diff = (new Date(e.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7 || new Date(e.start_date) <= now
  })
  const laterEvents = upcomingEvents.filter(e => {
    const diff = (new Date(e.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 7
  })

  // Featured events for billboard
  const featuredEvents = upcomingEvents.filter(e => e.is_featured)

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      experiences: experiencesSectionRef,
      events: eventsSectionRef,
      categories: categoriesSectionRef,
    }
    const ref = refMap[section]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className="kiosk-home-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          paddingBottom: 'calc(var(--kiosk-touch-sm) + var(--kiosk-sp-80))', // space for nav pill
        }}
      >
        {/* Hero Billboard */}
        <KioskHeroBillboard
          featuredExperiences={featuredExperiences}
          featuredEvents={featuredEvents}
          onOpenExperience={(exp) => onOpenExperience(exp, featuredExperiences)}
          onOpenEvent={(evt) => onOpenEvent(evt, upcomingEvents)}
        />

        {/* Waypoint logo + back button bar */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--kiosk-sp-24)',
            left: 'var(--kiosk-sp-32)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--kiosk-sp-16)',
          }}
        >
          <button
            onClick={onBackToAttract}
            className="kiosk-glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-8)',
              padding: 'var(--kiosk-sp-12) var(--kiosk-sp-20)',
              cursor: 'pointer',
              border: '1px solid var(--kiosk-glass-border)',
              color: 'white',
              fontSize: 'var(--kiosk-text-16)',
              fontWeight: 600,
              transition: 'all 0.3s var(--kiosk-ease-expo)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
                fontSize: 'var(--kiosk-text-24)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Waypoint
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 1: EXPERIENCES
           Featured Experiences + Per-Category Experience Rows
           Only shown if there are experiences to display
           ═══════════════════════════════════════════════════════════════ */}
        {(featuredExperiences.length > 0 || categoriesWithExperiences.length > 0) && (
        <div ref={experiencesSectionRef} style={{ paddingTop: 'var(--kiosk-sp-32)' }}>
          {/* Section divider */}
          <div
            style={{
              padding: '0 var(--kiosk-sp-64)',
              marginBottom: 'var(--kiosk-sp-16)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kiosk-sp-12)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--kiosk-primary-400)" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
                  fontSize: 'var(--kiosk-text-32)',
                  fontWeight: 800,
                  color: 'white',
                  margin: 0,
                }}
              >
                Experiences
              </h2>
            </div>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, var(--kiosk-glass-border), transparent)',
              }}
            />
          </div>

          {/* Featured Experiences Row */}
          {featuredExperiences.length > 0 && (
            <KioskContentRow title="Featured Experiences" subtitle={`${featuredExperiences.length} curated`}>
              {featuredExperiences.map(exp => (
                <KioskExperienceCard
                  key={exp.id}
                  experience={exp}
                  onClick={() => onOpenExperience(exp, featuredExperiences)}
                />
              ))}
            </KioskContentRow>
          )}

          {/* Per-Category Experience Rows */}
          {categoriesWithExperiences.map(category => (
            <KioskContentRow
              key={category.id}
              title={category.name}
              subtitle={`${category.experiences.length} experiences`}
            >
              {category.experiences.map(exp => (
                <KioskExperienceCard
                  key={exp.id}
                  experience={exp}
                  onClick={() => onOpenExperience(exp, category.experiences)}
                />
              ))}
            </KioskContentRow>
          ))}
        </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 2: EVENTS
           Happening Now & Soon + Upcoming Events + Annual Festivals
           Only shown if there are events to display
           ═══════════════════════════════════════════════════════════════ */}
        {(soonEvents.length > 0 || laterEvents.length > 0 || timelineEvents.length > 0) && (
        <div ref={eventsSectionRef} style={{ paddingTop: 'var(--kiosk-sp-48)' }}>
          {/* Section divider */}
          <div
            style={{
              padding: '0 var(--kiosk-sp-64)',
              marginBottom: 'var(--kiosk-sp-16)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kiosk-sp-12)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--kiosk-primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
                  fontSize: 'var(--kiosk-text-32)',
                  fontWeight: 800,
                  color: 'white',
                  margin: 0,
                }}
              >
                Events
              </h2>
            </div>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, var(--kiosk-glass-border), transparent)',
              }}
            />
          </div>

          {/* Happening Now & Soon */}
          {soonEvents.length > 0 && (
            <KioskContentRow title="Happening Now & Soon" subtitle={`${soonEvents.length} events`}>
              {soonEvents.map(evt => (
                <KioskEventCard
                  key={evt.id}
                  event={evt}
                  onClick={() => onOpenEvent(evt, soonEvents)}
                />
              ))}
            </KioskContentRow>
          )}

          {/* Upcoming Events */}
          {laterEvents.length > 0 && (
            <KioskContentRow title="Upcoming Events" subtitle={`${laterEvents.length} events`}>
              {laterEvents.map(evt => (
                <KioskEventCard
                  key={evt.id}
                  event={evt}
                  onClick={() => onOpenEvent(evt, laterEvents)}
                />
              ))}
            </KioskContentRow>
          )}

          {/* Annual Festivals & Holidays Timeline */}
          {timelineEvents.length > 0 && (
            <KioskHolidayTimeline
              events={timelineEvents}
              onOpenEvent={(evt) => onOpenTimelineEvent(evt, timelineEvents)}
            />
          )}
        </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 3: CATEGORIES
           Visual grid of tourism categories with images
           Only shown if there are categories with experiences
           ═══════════════════════════════════════════════════════════════ */}
        {categories.filter(c => allExperiences.some(e => e.category_name === c.name)).length > 0 && (
        <div ref={categoriesSectionRef} style={{ paddingTop: 'var(--kiosk-sp-48)' }}>
          {/* Section divider */}
          <div
            style={{
              padding: '0 var(--kiosk-sp-64)',
              marginBottom: 'var(--kiosk-sp-16)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--kiosk-sp-16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kiosk-sp-12)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--kiosk-primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
                  fontSize: 'var(--kiosk-text-32)',
                  fontWeight: 800,
                  color: 'white',
                  margin: 0,
                }}
              >
                Categories
              </h2>
            </div>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, var(--kiosk-glass-border), transparent)',
              }}
            />
          </div>

          <div
            style={{
              padding: '0 var(--kiosk-sp-64)',
              marginBottom: 'var(--kiosk-sp-8)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--kiosk-text-18)',
                color: 'var(--kiosk-text-secondary)',
                margin: 0,
              }}
            >
              Explore Guyana by category
            </p>
          </div>

          {/* Horizontal scrolling category cards — only show categories that have experiences */}
          <div
            className="kiosk-content-row"
            style={{
              display: 'flex',
              gap: 'var(--kiosk-sp-20)',
              overflowX: 'auto',
              padding: 'var(--kiosk-sp-16) var(--kiosk-sp-64)',
              paddingBottom: 'var(--kiosk-sp-32)',
              scrollSnapType: 'x mandatory',
            }}
          >
            {categories
              .filter(category => allExperiences.some(e => e.category_name === category.name))
              .map(category => (
              <KioskCategoryCard
                key={category.id}
                category={category}
                onClick={() => {
                  const catExperiences = allExperiences.filter(e => e.category_name === category.name)
                  if (catExperiences.length > 0) {
                    onOpenExperience(catExperiences[0], catExperiences)
                  }
                }}
              />
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Navigation Pill */}
      <KioskNavigationPill
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
