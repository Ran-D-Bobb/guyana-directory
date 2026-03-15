'use client'

import { useState, useCallback, useRef } from 'react'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import KioskAttractScreen from '@/components/kiosk/KioskAttractScreen'
import KioskHomeHub from '@/components/kiosk/KioskHomeHub'
import KioskDetailOverlay from '@/components/kiosk/KioskDetailOverlay'
import KioskExperienceDetail from '@/components/kiosk/KioskExperienceDetail'
import KioskEventDetail from '@/components/kiosk/KioskEventDetail'
import KioskTimelineDetail from '@/components/kiosk/KioskTimelineDetail'

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
export interface KioskExperience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  video_url: string | null
  video_thumbnail_url: string | null
  rating: number
  review_count: number
  duration: string | null
  price_from: number
  category_name: string
  difficulty_level: string | null
}

export interface KioskEvent {
  id: string
  title: string
  slug: string
  description: string | null
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  is_featured: boolean
  view_count: number
  interest_count: number
  source_type: 'community' | 'business'
  business_name: string | null
  business_slug: string | null
  category_name: string | null
  category_icon: string | null
  event_type_name: string | null
}

export interface KioskCategory {
  id: string
  slug: string
  name: string
  icon: string
  description: string | null
  experience_count: number
}

export interface KioskTimelineEvent {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  month: string
  month_short: string
  day: string
  location: string | null
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url: string | null
  gradient_colors: string
  accent_color: string
  category: string
  highlights: string[]
  display_order: number
}

interface KioskHomePageProps {
  featuredExperiences: KioskExperience[]
  allExperiences: KioskExperience[]
  categories: KioskCategory[]
  upcomingEvents: KioskEvent[]
  timelineEvents: KioskTimelineEvent[]
}

type KioskMode = 'attract' | 'hub' | 'detail'
type DetailTarget =
  | { type: 'experience'; data: KioskExperience; siblings?: KioskExperience[] }
  | { type: 'event'; data: KioskEvent; siblings?: KioskEvent[] }
  | { type: 'timeline'; data: KioskTimelineEvent; siblings?: KioskTimelineEvent[] }
  | null

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
export default function KioskHomePage({
  featuredExperiences,
  allExperiences,
  categories,
  upcomingEvents,
  timelineEvents,
}: KioskHomePageProps) {
  const [mode, setMode] = useState<KioskMode>('attract')
  const [detail, setDetail] = useState<DetailTarget>(null)
  const [isOverlayExiting, setIsOverlayExiting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Prioritize featured in the attract screen
  const attractExperiences = featuredExperiences.length > 0
    ? [...featuredExperiences, ...allExperiences.filter(e => !featuredExperiences.find(f => f.id === e.id))].slice(0, 10)
    : allExperiences.slice(0, 10)

  // Idle timer: return to attract mode after inactivity
  const { resetTimer } = useIdleTimer(() => {
    if (mode === 'detail') {
      closeDetail()
      setTimeout(() => transitionTo('attract'), 500)
    } else if (mode === 'hub') {
      transitionTo('attract')
    }
  }, mode === 'detail' ? 120000 : 90000) // 120s from detail, 90s from hub

  // Smooth crossfade transition between modes
  const transitionTo = useCallback((nextMode: KioskMode) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    // Quick fade out
    setTimeout(() => {
      setMode(nextMode)
      requestAnimationFrame(() => {
        setIsTransitioning(false)
      })
    }, 300)
  }, [isTransitioning])

  // Touch to explore — attract → hub
  const handleTapToExplore = useCallback(() => {
    transitionTo('hub')
    resetTimer()
  }, [transitionTo, resetTimer])

  // Open detail overlay
  const openDetail = useCallback((target: DetailTarget) => {
    setDetail(target)
    setMode('detail')
    resetTimer()
  }, [resetTimer])

  // Close detail overlay with exit animation
  const closeDetail = useCallback(() => {
    setIsOverlayExiting(true)
    setTimeout(() => {
      setDetail(null)
      setIsOverlayExiting(false)
      setMode('hub')
    }, 400) // matches kiosk-overlay-exit duration
  }, [])

  // Navigate between siblings in detail view
  const navigateDetail = useCallback((direction: 'prev' | 'next') => {
    if (!detail || !detail.siblings) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const siblings = detail.siblings as any[]
    const currentId = 'id' in detail.data ? detail.data.id : ''
    const currentIdx = siblings.findIndex((s) => s.id === currentId)
    if (currentIdx === -1) return

    const nextIdx = direction === 'next'
      ? (currentIdx + 1) % siblings.length
      : (currentIdx - 1 + siblings.length) % siblings.length

    const nextItem = siblings[nextIdx]
    if (detail.type === 'experience') {
      setDetail({
        type: 'experience',
        data: nextItem as KioskExperience,
        siblings: siblings as KioskExperience[],
      })
    } else if (detail.type === 'timeline') {
      setDetail({
        type: 'timeline',
        data: nextItem as KioskTimelineEvent,
        siblings: siblings as KioskTimelineEvent[],
      })
    } else {
      setDetail({
        type: 'event',
        data: nextItem as KioskEvent,
        siblings: siblings as KioskEvent[],
      })
    }
    resetTimer()
  }, [detail, resetTimer])

  // Back to attract from hub
  const handleBackToAttract = useCallback(() => {
    transitionTo('attract')
    resetTimer()
  }, [transitionTo, resetTimer])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--kiosk-bg-cinema)',
        position: 'relative',
      }}
    >
      {/* Main content with crossfade transition */}
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.3s var(--kiosk-ease-expo)',
        }}
      >
        {mode === 'attract' ? (
          <KioskAttractScreen
            experiences={attractExperiences}
            onTapToExplore={handleTapToExplore}
          />
        ) : (
          <KioskHomeHub
            featuredExperiences={featuredExperiences}
            allExperiences={allExperiences}
            categories={categories}
            upcomingEvents={upcomingEvents}
            timelineEvents={timelineEvents}
            onOpenExperience={(exp, siblings) => openDetail({ type: 'experience', data: exp, siblings })}
            onOpenEvent={(evt, siblings) => openDetail({ type: 'event', data: evt, siblings })}
            onOpenTimelineEvent={(evt, siblings) => openDetail({ type: 'timeline', data: evt, siblings })}
            onBackToAttract={handleBackToAttract}
          />
        )}
      </div>

      {/* Detail overlay — renders on top when in detail mode */}
      {detail && (
        <KioskDetailOverlay
          isExiting={isOverlayExiting}
          onClose={closeDetail}
          onPrev={detail.siblings ? () => navigateDetail('prev') : undefined}
          onNext={detail.siblings ? () => navigateDetail('next') : undefined}
        >
          {detail.type === 'experience' ? (
            <KioskExperienceDetail experience={detail.data} />
          ) : detail.type === 'timeline' ? (
            <KioskTimelineDetail event={detail.data} />
          ) : (
            <KioskEventDetail event={detail.data} />
          )}
        </KioskDetailOverlay>
      )}
    </div>
  )
}
