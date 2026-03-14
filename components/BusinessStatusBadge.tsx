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

type BusinessStatus = 'open' | 'closing-soon' | 'closed'

function getCurrentDayStatus(hours: BusinessHours | null): { status: BusinessStatus; isOpen: boolean; statusText: string } {
  if (!hours) return { status: 'closed', isOpen: false, statusText: 'Hours not available' }

  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const todayHours = hours[dayName]
  if (!todayHours || todayHours.closed) {
    return { status: 'closed', isOpen: false, statusText: 'Closed today' }
  }

  if (todayHours.open && todayHours.close) {
    const [openH, openM] = todayHours.open.split(':').map(Number)
    const [closeH, closeM] = todayHours.close.split(':').map(Number)
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const minutesLeft = closeMinutes - currentMinutes
      if (minutesLeft <= 60) {
        return { status: 'closing-soon', isOpen: true, statusText: `Closing soon \u00B7 ${todayHours.close}` }
      }
      return { status: 'open', isOpen: true, statusText: `Open until ${todayHours.close}` }
    } else if (currentMinutes < openMinutes) {
      return { status: 'closed', isOpen: false, statusText: `Opens at ${todayHours.open}` }
    }
  }

  return { status: 'closed', isOpen: false, statusText: 'Closed now' }
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
    if (status.status === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/90 backdrop-blur-sm text-white rounded-full shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Open Now
        </span>
      )
    }
    if (status.status === 'closing-soon') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/90 backdrop-blur-sm text-white rounded-full shadow-lg">
          <Clock className="w-3.5 h-3.5" />
          {status.statusText}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500/90 backdrop-blur-sm text-white rounded-full shadow-lg">
        <Clock className="w-3.5 h-3.5" />
        {status.statusText}
      </span>
    )
  }

  // inline variant (for CollapsibleHours)
  const inlineStyles = {
    'open': 'bg-emerald-100 text-emerald-700',
    'closing-soon': 'bg-amber-100 text-amber-700',
    'closed': 'bg-red-100 text-red-700',
  }

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${inlineStyles[status.status]}`}>
      {status.statusText}
    </span>
  )
}

export { getCurrentDayStatus }
export type { BusinessHours }
