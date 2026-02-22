'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface BusinessHours {
  [day: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

interface BusinessStatusBadgeProps {
  hours: BusinessHours | null
  variant?: 'hero' | 'inline'
}

function getCurrentDayStatus(hours: BusinessHours | null): { isOpen: boolean; statusText: string } {
  if (!hours) return { isOpen: false, statusText: 'Hours not available' }

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = now.getHours() * 100 + now.getMinutes()

  const todayHours = hours[dayName]
  if (!todayHours || todayHours.closed) {
    return { isOpen: false, statusText: 'Closed today' }
  }

  if (todayHours.open && todayHours.close) {
    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))

    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, statusText: `Open until ${todayHours.close}` }
    } else if (currentTime < openTime) {
      return { isOpen: false, statusText: `Opens at ${todayHours.open}` }
    }
  }

  return { isOpen: false, statusText: 'Closed now' }
}

export function BusinessStatusBadge({ hours, variant = 'hero' }: BusinessStatusBadgeProps) {
  const [status, setStatus] = useState(() => getCurrentDayStatus(hours))

  useEffect(() => {
    // Recalculate every minute
    const interval = setInterval(() => {
      setStatus(getCurrentDayStatus(hours))
    }, 60_000)

    return () => clearInterval(interval)
  }, [hours])

  if (variant === 'hero') {
    return status.isOpen ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/90 backdrop-blur-sm text-white rounded-full shadow-lg">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        Open Now
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-black/50 backdrop-blur-sm text-white/90 rounded-full shadow-lg">
        <Clock className="w-3.5 h-3.5" />
        {status.statusText}
      </span>
    )
  }

  // inline variant (for CollapsibleHours)
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
      status.isOpen
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-100 text-gray-600'
    }`}>
      {status.statusText}
    </span>
  )
}

export { getCurrentDayStatus }
export type { BusinessHours }
