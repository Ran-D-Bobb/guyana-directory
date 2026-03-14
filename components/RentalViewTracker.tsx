'use client'

import { useEffect, useRef } from 'react'

interface RentalViewTrackerProps {
  rentalId: string
}

export function RentalViewTracker({ rentalId }: RentalViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    const sessionKey = `viewed_rental_${rentalId}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return
    }

    const trackView = async () => {
      try {
        await fetch('/api/track-rental-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rentalId }),
        })
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, '1')
        }
      } catch (error) {
        console.error('Failed to track rental view:', error)
      }
    }

    trackView()
  }, [rentalId])

  return null
}
