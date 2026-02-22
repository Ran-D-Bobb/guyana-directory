'use client'

import { useEffect, useRef } from 'react'

interface EventViewTrackerProps {
  eventId: string
}

export function EventViewTracker({ eventId }: EventViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per component mount
    if (hasTracked.current) return
    hasTracked.current = true

    // Deduplicate within the same session
    const sessionKey = `viewed_event_${eventId}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return
    }

    const trackView = async () => {
      try {
        await fetch('/api/track-event-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId }),
        })
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, '1')
        }
      } catch (error) {
        console.error('Failed to track event view:', error)
      }
    }

    trackView()
  }, [eventId])

  // This component doesn't render anything
  return null
}
