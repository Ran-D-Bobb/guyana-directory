'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useKioskResolution, applyKioskCSS, type KioskConfig } from '@/hooks/useKioskResolution'
import '@/app/kiosk/kiosk.css'

interface KioskLayoutOptimizedProps {
  children: ReactNode
  /** Show debug info in development mode */
  showDebugInfo?: boolean
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
  showDebugInfo = false,
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
      {/* Debug Info Overlay (Development Only) */}
      {showDebugInfo && process.env.NODE_ENV === 'development' && (
        <DebugInfoOverlay config={kioskConfig} isFullScreen={isFullScreen} onExitFullScreen={exitFullScreen} />
      )}

      {/* Main Kiosk Content */}
      {children}
    </div>
  )
}

/**
 * Debug Info Overlay - Shows kiosk configuration in development
 */
function DebugInfoOverlay({
  config,
  isFullScreen,
  onExitFullScreen,
}: {
  config: KioskConfig
  isFullScreen: boolean
  onExitFullScreen: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-[9999] font-mono text-xs">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold shadow-lg hover:bg-yellow-400 transition-colors"
      >
        {isExpanded ? '✕ Close Debug' : '🔍 Debug Info'}
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="mt-2 bg-black/90 text-green-400 p-4 rounded-lg shadow-2xl backdrop-blur-sm max-w-md border-2 border-green-500">
          <h3 className="text-yellow-400 font-bold mb-3 text-sm">KIOSK DEBUG INFO</h3>

          <div className="space-y-2">
            <DebugRow label="Resolution" value={`${config.width} × ${config.height}`} />
            <DebugRow label="Type" value={config.resolution.toUpperCase()} />
            <DebugRow label="Orientation" value={config.orientation} />
            <DebugRow label="Device Type" value={config.deviceType} />
            <DebugRow label="Scale Factor" value={config.scale.toFixed(2)} />
            <DebugRow label="Grid Columns" value={config.gridColumns.toString()} />
            <DebugRow label="Card Size" value={`${config.cardWidth} × ${config.cardHeight}`} />
            <DebugRow label="Button Size" value={`${config.primaryButtonWidth} × ${config.primaryButtonHeight}`} />
            <DebugRow label="Touch Target" value={`${config.touchTargetMin}px min`} />
            <DebugRow label="Nav Height" value={`${config.navHeight}px`} />
            <DebugRow label="QR Code Size" value={`${config.qrCodeSize}px`} />
            <DebugRow label="Text Scale" value={config.textScale.toFixed(2)} />
            <DebugRow label="Touch Support" value={config.isTouch ? 'YES' : 'NO'} />
            <DebugRow label="Full-Screen" value={isFullScreen ? 'YES' : 'NO'} />
          </div>

          {/* Full-Screen Controls */}
          {isFullScreen && (
            <button
              onClick={onExitFullScreen}
              className="mt-3 w-full bg-red-600 text-white px-3 py-2 rounded font-bold hover:bg-red-500 transition-colors"
            >
              Exit Full-Screen
            </button>
          )}

          {/* Recommendations */}
          <div className="mt-4 pt-3 border-t border-green-700">
            <h4 className="text-yellow-400 font-bold mb-2">Recommendations:</h4>
            <ul className="text-xs space-y-1">
              {config.resolution === 'unknown' && (
                <li className="text-orange-400">⚠️ Unknown resolution - using fallback config</li>
              )}
              {config.width < 1366 && (
                <li className="text-orange-400">⚠️ Screen too small for optimal kiosk experience</li>
              )}
              {!config.isTouch && <li className="text-blue-400">ℹ️ Touch not detected - using mouse input</li>}
              {config.orientation === 'portrait' && (
                <li className="text-blue-400">ℹ️ Portrait mode - using single column layout</li>
              )}
              {config.resolution === 'fullhd' && <li className="text-green-400">✓ Optimal resolution detected</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Debug Row Component - Helper for debug overlay
 */
function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}:</span>
      <span className="text-green-400 font-bold">{value}</span>
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
