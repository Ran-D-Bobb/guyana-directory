'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Force a hard refresh to ensure session is loaded
    router.refresh()
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--jungle-500))] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
