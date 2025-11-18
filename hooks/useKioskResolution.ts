'use client'

import { useState, useEffect } from 'react'

/**
 * Kiosk Resolution Detection Hook
 *
 * Detects screen resolution and returns kiosk-optimized configuration
 * Supports multiple display sizes from 21.5" to 55"+ kiosks
 *
 * Resolution Categories:
 * - HD Landscape: 1366x768 (21.5"-27" displays) - scale 0.85
 * - Full HD Landscape: 1920x1080 (32"-55" displays) - scale 1.0 (default)
 * - Portrait: 1080x1920 (vertical kiosks) - scale 1.0
 * - 4K/Ultra HD: 3840x2160+ (50"+ large format) - scale 1.5
 */

export type KioskResolution = 'hd' | 'fullhd' | 'portrait' | '4k' | 'unknown'
export type KioskOrientation = 'landscape' | 'portrait'

export interface KioskConfig {
  // Display properties
  width: number
  height: number
  resolution: KioskResolution
  orientation: KioskOrientation

  // Scale factor for sizing elements
  scale: number

  // Grid configuration (for category grids)
  gridColumns: number // Number of columns for category cards

  // Card dimensions
  cardWidth: number
  cardHeight: number

  // Button dimensions
  primaryButtonWidth: number
  primaryButtonHeight: number

  // Touch target minimum size
  touchTargetMin: number

  // QR code size
  qrCodeSize: number

  // Navigation height
  navHeight: number

  // Typography scale multiplier
  textScale: number

  // Is this a touch-enabled device?
  isTouch: boolean

  // Device type hint (for analytics)
  deviceType: 'kiosk-small' | 'kiosk-medium' | 'kiosk-large' | 'kiosk-portrait' | 'unknown'
}

const DEFAULT_CONFIG: KioskConfig = {
  width: 1920,
  height: 1080,
  resolution: 'fullhd',
  orientation: 'landscape',
  scale: 1,
  gridColumns: 3,
  cardWidth: 400,
  cardHeight: 400,
  primaryButtonWidth: 320,
  primaryButtonHeight: 120,
  touchTargetMin: 88,
  qrCodeSize: 400,
  navHeight: 88,
  textScale: 1,
  isTouch: true,
  deviceType: 'kiosk-medium',
}

/**
 * Determine kiosk configuration based on window dimensions
 */
function getKioskConfig(width: number, height: number): KioskConfig {
  const isPortrait = height > width
  const orientation: KioskOrientation = isPortrait ? 'portrait' : 'landscape'

  // Detect touch support
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Portrait orientation (1080x1920 or similar)
  if (isPortrait) {
    return {
      width,
      height,
      resolution: 'portrait',
      orientation: 'portrait',
      scale: 1,
      gridColumns: 1, // Single column for portrait
      cardWidth: 600,
      cardHeight: 400,
      primaryButtonWidth: 400,
      primaryButtonHeight: 140,
      touchTargetMin: 88,
      qrCodeSize: 400,
      navHeight: 88,
      textScale: 1,
      isTouch,
      deviceType: 'kiosk-portrait',
    }
  }

  // 4K / Ultra HD (3840x2160 or larger)
  if (width >= 2560) {
    return {
      width,
      height,
      resolution: '4k',
      orientation: 'landscape',
      scale: 1.5,
      gridColumns: 4, // More columns for ultra-wide displays
      cardWidth: 600,
      cardHeight: 600,
      primaryButtonWidth: 480,
      primaryButtonHeight: 180,
      touchTargetMin: 120, // Larger touch targets for big screens
      qrCodeSize: 600,
      navHeight: 120,
      textScale: 1.5,
      isTouch,
      deviceType: 'kiosk-large',
    }
  }

  // Full HD (1920x1080) - Most common kiosk resolution
  if (width >= 1680) {
    return {
      width,
      height,
      resolution: 'fullhd',
      orientation: 'landscape',
      scale: 1,
      gridColumns: 3,
      cardWidth: 400,
      cardHeight: 400,
      primaryButtonWidth: 320,
      primaryButtonHeight: 120,
      touchTargetMin: 88,
      qrCodeSize: 400,
      navHeight: 88,
      textScale: 1,
      isTouch,
      deviceType: 'kiosk-medium',
    }
  }

  // HD (1366x768 or 1440x900) - Smaller kiosk displays
  if (width >= 1024) {
    return {
      width,
      height,
      resolution: 'hd',
      orientation: 'landscape',
      scale: 0.85,
      gridColumns: 2, // Fewer columns for smaller screens
      cardWidth: 340,
      cardHeight: 340,
      primaryButtonWidth: 280,
      primaryButtonHeight: 100,
      touchTargetMin: 88,
      qrCodeSize: 340,
      navHeight: 80,
      textScale: 0.9,
      isTouch,
      deviceType: 'kiosk-small',
    }
  }

  // Fallback for unknown/smaller displays
  return {
    width,
    height,
    resolution: 'unknown',
    orientation: 'landscape',
    scale: 0.75,
    gridColumns: 2,
    cardWidth: 300,
    cardHeight: 300,
    primaryButtonWidth: 240,
    primaryButtonHeight: 90,
    touchTargetMin: 88,
    qrCodeSize: 300,
    navHeight: 72,
    textScale: 0.8,
    isTouch,
    deviceType: 'unknown',
  }
}

/**
 * Custom hook for kiosk resolution detection
 *
 * Usage:
 * ```tsx
 * const kioskConfig = useKioskResolution()
 *
 * console.log(kioskConfig.resolution) // 'fullhd'
 * console.log(kioskConfig.scale) // 1.0
 * console.log(kioskConfig.gridColumns) // 3
 * ```
 */
export function useKioskResolution(): KioskConfig {
  const [config, setConfig] = useState<KioskConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    // Initial detection
    function updateConfig() {
      const width = window.innerWidth
      const height = window.innerHeight
      const newConfig = getKioskConfig(width, height)
      setConfig(newConfig)

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Kiosk Resolution]', {
          dimensions: `${width}x${height}`,
          resolution: newConfig.resolution,
          orientation: newConfig.orientation,
          scale: newConfig.scale,
          deviceType: newConfig.deviceType,
          gridColumns: newConfig.gridColumns,
        })
      }
    }

    updateConfig()

    // Listen for orientation/resize changes (e.g., kiosk rotation)
    window.addEventListener('resize', updateConfig)
    window.addEventListener('orientationchange', updateConfig)

    return () => {
      window.removeEventListener('resize', updateConfig)
      window.removeEventListener('orientationchange', updateConfig)
    }
  }, [])

  return config
}

/**
 * Helper: Apply kiosk CSS custom properties to document root
 * Call this in your layout component
 *
 * Usage:
 * ```tsx
 * const kioskConfig = useKioskResolution()
 * useEffect(() => {
 *   applyKioskCSS(kioskConfig)
 * }, [kioskConfig])
 * ```
 */
export function applyKioskCSS(config: KioskConfig) {
  const root = document.documentElement

  // Apply CSS custom properties
  root.style.setProperty('--kiosk-scale', config.scale.toString())
  root.style.setProperty('--kiosk-orientation', config.orientation)
  root.style.setProperty('--kiosk-card-width', `${config.cardWidth}px`)
  root.style.setProperty('--kiosk-card-height', `${config.cardHeight}px`)
  root.style.setProperty('--kiosk-button-primary-width', `${config.primaryButtonWidth}px`)
  root.style.setProperty('--kiosk-button-primary-height', `${config.primaryButtonHeight}px`)
  root.style.setProperty('--kiosk-qr-size', `${config.qrCodeSize}px`)
  root.style.setProperty('--kiosk-nav-height', `${config.navHeight}px`)
  root.style.setProperty('--kiosk-touch-min', `${config.touchTargetMin}px`)

  // Apply text scale
  if (config.textScale !== 1) {
    // Multiply all text sizes by text scale
    const textSizes = {
      '--kiosk-text-xs': 24,
      '--kiosk-text-sm': 28,
      '--kiosk-text-base': 32,
      '--kiosk-text-lg': 40,
      '--kiosk-text-xl': 48,
      '--kiosk-text-2xl': 56,
      '--kiosk-text-3xl': 64,
      '--kiosk-text-4xl': 72,
      '--kiosk-text-5xl': 96,
      '--kiosk-text-hero': 120,
    }

    Object.entries(textSizes).forEach(([key, baseSize]) => {
      root.style.setProperty(key, `${Math.round(baseSize * config.textScale)}px`)
    })
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Kiosk CSS Applied]', {
      scale: config.scale,
      cardSize: `${config.cardWidth}x${config.cardHeight}`,
      buttonSize: `${config.primaryButtonWidth}x${config.primaryButtonHeight}`,
      navHeight: config.navHeight,
    })
  }
}
