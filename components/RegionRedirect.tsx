'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { REGION_COOKIE } from '@/lib/regions'

export function RegionRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.has('region')) return

    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${REGION_COOKIE}=([^;]*)`))
    const cookieValue = match ? decodeURIComponent(match[1]) : null

    if (cookieValue && cookieValue !== 'all') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('region', cookieValue)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [router, searchParams, pathname])

  return null
}
