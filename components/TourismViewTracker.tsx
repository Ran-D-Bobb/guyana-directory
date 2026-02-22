'use client'

import { useEffect, useRef } from 'react'

interface TourismViewTrackerProps {
  experienceId: string
}

export function TourismViewTracker({ experienceId }: TourismViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    // Deduplicate within the same session
    const sessionKey = `viewed_tourism_${experienceId}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return
    }

    const trackView = async () => {
      try {
        await fetch('/api/track-tourism-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ experienceId }),
        })
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, '1')
        }
      } catch (error) {
        console.error('Failed to track tourism view:', error)
      }
    }

    trackView()
  }, [experienceId])

  return null
}
