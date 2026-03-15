'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PageViewTrackerProps {
  businessId: string
}

export function PageViewTracker({ businessId }: PageViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    const sessionKey = `viewed_business_${businessId}`
    if (sessionStorage.getItem(sessionKey)) return

    const supabase = createClient()
    supabase.rpc('increment_view_count', { business_id: businessId })
      .then(
        () => { sessionStorage.setItem(sessionKey, '1') },
        () => {}
      )
  }, [businessId])

  return null
}
