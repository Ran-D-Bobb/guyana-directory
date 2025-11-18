'use client'

import { useEffect, useRef } from 'react'

interface PageViewTrackerProps {
  businessId: string
}

export function PageViewTracker({ businessId }: PageViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per component mount
    if (hasTracked.current) return
    hasTracked.current = true

    const trackView = async () => {
      try {
        await fetch('/api/track-page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ businessId }),
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackView()
  }, [businessId])

  // This component doesn't render anything
  return null
}
