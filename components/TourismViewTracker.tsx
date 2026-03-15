'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TourismViewTrackerProps {
  experienceId: string
}

export function TourismViewTracker({ experienceId }: TourismViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    const sessionKey = `viewed_tourism_${experienceId}`
    if (sessionStorage.getItem(sessionKey)) return

    const supabase = createClient()
    supabase.rpc('increment_tourism_view_count', { experience_id: experienceId })
      .then(
        () => { sessionStorage.setItem(sessionKey, '1') },
        () => {}
      )
  }, [experienceId])

  return null
}
