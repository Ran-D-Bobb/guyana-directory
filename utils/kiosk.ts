// Kiosk utility functions

/**
 * Generate a unique session ID for kiosk analytics
 */
export function generateKioskSessionId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `kiosk_${timestamp}_${random}`
}

/**
 * Get or create a kiosk session ID (stored in sessionStorage)
 */
export function getKioskSessionId(): string {
  if (typeof window === 'undefined') {
    return generateKioskSessionId()
  }

  const storageKey = 'kiosk_session_id'
  let sessionId = sessionStorage.getItem(storageKey)

  if (!sessionId) {
    sessionId = generateKioskSessionId()
    sessionStorage.setItem(storageKey, sessionId)
  }

  return sessionId
}

/**
 * Track a kiosk interaction
 */
export async function trackKioskInteraction(
  interaction_type: 'view' | 'qr_scan' | 'whatsapp_click' | 'category_view',
  experience_id?: string,
  metadata?: Record<string, any>
) {
  try {
    const sessionId = getKioskSessionId()

    const response = await fetch('/api/track-kiosk-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        experience_id,
        interaction_type,
        session_id: sessionId,
        metadata
      })
    })

    if (!response.ok) {
      console.error('Failed to track kiosk interaction')
    }
  } catch (error) {
    console.error('Error tracking kiosk interaction:', error)
  }
}
