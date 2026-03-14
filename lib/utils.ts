import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL for auth redirects.
 * For Capacitor apps, always use production URL to ensure OAuth works.
 * For web, use the current origin.
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  // Production URL for the app
  const PRODUCTION_URL = 'https://waypointgy.com'

  if (typeof window === 'undefined') {
    const serverUrl = process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_URL
    return `${serverUrl}${path}`
  }

  // Check if running in Capacitor (native app)
  const isCapacitor = !!(window as typeof window & { Capacitor?: unknown }).Capacitor

  // In Capacitor, use production URL so OAuth works
  if (isCapacitor ||
      window.location.origin.includes('capacitor://') ||
      window.location.origin.includes('10.0.2.2')) {
    return `${PRODUCTION_URL}${path}`
  }

  // For local dev and web, use current origin
  return `${window.location.origin}${path}`
}

/**
 * Format a Guyana phone number for display.
 * Strips non-digits, removes country code prefix (592),
 * and formats as XXX XXXX (7-digit local format).
 */
export function formatPhoneDisplay(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')

  // Remove Guyana country code (592) if present
  let local = digits
  if (local.startsWith('592') && local.length >= 10) {
    local = local.slice(3)
  }
  // Remove leading 1 (international prefix) + 592
  if (local.startsWith('1592') && local.length >= 11) {
    local = digits.slice(4)
  }

  // Format 7-digit number as XXX XXXX
  if (local.length === 7) {
    return `${local.slice(0, 3)} ${local.slice(3)}`
  }

  // Return cleaned number if non-standard length
  return local
}
