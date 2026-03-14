'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useKioskResolution, applyKioskCSS, type KioskConfig } from '@/hooks/useKioskResolution'
import '@/app/kiosk/kiosk.css'

interface KioskLayoutOptimizedProps {
  children: ReactNode
  /** Enable full-screen mode on mount */
  enableFullScreen?: boolean
}

/**
 * KioskLayoutOptimized - Smart layout wrapper for kiosk displays
 *
 * Features:
 * - Auto-detects screen resolution and applies optimal configuration
 * - Supports 1366x768 (HD), 1920x1080 (Full HD), 1080x1920 (Portrait), 3840x2160 (4K)
 * - Applies kiosk-specific CSS custom properties
 * - Optional full-screen mode
 * - Debug overlay in development
 * - Prevents text selection and context menus (kiosk mode)
 *
 * Usage:
 * ```tsx
 * <KioskLayoutOptimized>
 *   <YourKioskContent />
 * </KioskLayoutOptimized>
 * ```
 */
export default function KioskLayoutOptimized({
  children,
  enableFullScreen = false,
}: KioskLayoutOptimizedProps) {
  const kioskConfig = useKioskResolution()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Apply kiosk CSS custom properties when config changes
  useEffect(() => {
    applyKioskCSS(kioskConfig)
  }, [kioskConfig])

  // Handle component mounting
  useEffect(() => {
    setMounted(true)

    // Disable context menu (right-click) in kiosk mode
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)

    // Prevent accidental text selection
    document.body.classList.add('kiosk-no-select')

    // Apply smooth scrolling
    document.documentElement.classList.add('kiosk-smooth-scroll')

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.body.classList.remove('kiosk-no-select')
      document.documentElement.classList.remove('kiosk-smooth-scroll')
    }
  }, [])

  // Full-screen mode handling
  useEffect(() => {
    if (!enableFullScreen || !mounted) return

    const requestFullScreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullScreen(true)
        }
      } catch (err) {
        console.warn('[Kiosk] Full-screen request failed:', err)
      }
    }

    requestFullScreen()

    // Listen for full-screen changes
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [enableFullScreen, mounted])

  // Exit full-screen function (can be called from child components)
  const exitFullScreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  // Don't render until mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">Loading Kiosk Mode...</div>
      </div>
    )
  }

  return (
    <div
      className="kiosk-layout-optimized"
      data-resolution={kioskConfig.resolution}
      data-orientation={kioskConfig.orientation}
      data-device-type={kioskConfig.deviceType}
    >
      {/* Main Kiosk Content */}
      {children}
    </div>
  )
}

/**
 * Hook to access kiosk config from child components
 * Use this instead of calling useKioskResolution directly
 *
 * Usage:
 * ```tsx
 * import { useKioskConfig } from '@/components/kiosk/KioskLayoutOptimized'
 *
 * function MyComponent() {
 *   const { gridColumns, cardWidth } = useKioskConfig()
 *   // ...
 * }
 * ```
 */
export function useKioskConfig(): KioskConfig {
  return useKioskResolution()
}
