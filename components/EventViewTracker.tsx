'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EventViewTrackerProps {
  eventId: string
}

export function EventViewTracker({ eventId }: EventViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    const sessionKey = `viewed_event_${eventId}`
    if (sessionStorage.getItem(sessionKey)) return

    const supabase = createClient()
    supabase.rpc('increment_event_views', { event_id: eventId })
      .then(
        () => { sessionStorage.setItem(sessionKey, '1') },
        () => {}
      )
  }, [eventId])

  return null
}
