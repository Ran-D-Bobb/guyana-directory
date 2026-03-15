const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup expired entries every 60 seconds
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

/**
 * Simple in-memory sliding-window rate limiter.
 * Returns { success: true } if the request is allowed.
 */
export function rateLimit(
  ip: string,
  limit = 30,
  windowMs = 60_000
): { success: boolean } {
  cleanup()
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  entry.count++
  if (entry.count > limit) {
    return { success: false }
  }

  return { success: true }
}
