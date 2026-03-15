'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RentalViewTrackerProps {
  rentalId: string
}

export function RentalViewTracker({ rentalId }: RentalViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    const sessionKey = `viewed_rental_${rentalId}`
    if (sessionStorage.getItem(sessionKey)) return

    const supabase = createClient()
    supabase.rpc('increment_rental_view_count', { rental_id: rentalId })
      .then(
        () => { sessionStorage.setItem(sessionKey, '1') },
        () => {}
      )
  }, [rentalId])

  return null
}
