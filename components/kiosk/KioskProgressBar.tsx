'use client'

import { useEffect, useRef } from 'react'

interface KioskProgressBarProps {
  /** Duration in ms for one full cycle */
  duration: number
  /** Whether the progress bar is actively animating */
  isActive: boolean
  /** Called when the bar completes one fill cycle */
  onComplete?: () => void
  /** Optional extra className */
  className?: string
}

/**
 * Thin animated progress bar used across kiosk screens.
 * Fills left-to-right over `duration` ms, then calls onComplete.
 * Uses CSS animation for smooth 60fps performance.
 */
export default function KioskProgressBar({
  duration,
  isActive,
  onComplete,
  className = '',
}: KioskProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!barRef.current) return

    if (isActive) {
      // Reset and start animation
      barRef.current.style.transition = 'none'
      barRef.current.style.transform = 'scaleX(0)'

      // Force reflow then animate
      barRef.current.offsetHeight
      barRef.current.style.transition = `transform ${duration}ms linear`
      barRef.current.style.transform = 'scaleX(1)'

      // Fire completion callback
      if (onComplete) {
        timeoutRef.current = setTimeout(onComplete, duration)
      }
    } else {
      barRef.current.style.transition = 'none'
      barRef.current.style.transform = 'scaleX(0)'
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [duration, isActive, onComplete])

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: 'calc(4px * var(--kiosk-scale))',
        background: 'transparent',
        overflow: 'hidden',
        borderRadius: 'var(--kiosk-radius-full)',
      }}
    >
      <div
        ref={barRef}
        className="kiosk-attract-progress"
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: 'left',
          transform: 'scaleX(0)',
        }}
      />
    </div>
  )
}
