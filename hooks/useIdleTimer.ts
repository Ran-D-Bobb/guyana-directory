'use client'

import { useEffect, useRef, useState } from 'react'

export function useIdleTimer(onIdle: () => void, idleTime: number = 60000) {
  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    setIsIdle(false)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsIdle(true)
      onIdle()
    }, idleTime)
  }

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Reset timer on any user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    // Start the timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [idleTime, onIdle])

  return { isIdle, resetTimer }
}
