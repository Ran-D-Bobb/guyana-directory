/**
 * Utilities for saving and loading form drafts to/from localStorage
 */

const DRAFT_KEY_PREFIX = 'form_draft_'
const DRAFT_TIMESTAMP_SUFFIX = '_timestamp'
const DRAFT_EXPIRY_DAYS = 7 // Drafts expire after 7 days

type FormType = 'business' | 'rental' | 'event' | 'tourism'

/**
 * Generate a unique storage key for a form draft
 */
function getDraftKey(formType: FormType, userId: string): string {
  return `${DRAFT_KEY_PREFIX}${formType}_${userId}`
}

/**
 * Generate a key for storing the draft timestamp
 */
function getTimestampKey(formType: FormType, userId: string): string {
  return `${getDraftKey(formType, userId)}${DRAFT_TIMESTAMP_SUFFIX}`
}

/**
 * Check if a draft has expired
 */
function isDraftExpired(timestamp: number): boolean {
  const now = Date.now()
  const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // Convert days to milliseconds
  return now - timestamp > expiryTime
}

/**
 * Save form data as a draft to localStorage
 */
export function saveDraft<T>(
  formType: FormType,
  userId: string,
  data: Partial<T>
): void {
  if (typeof window === 'undefined') return

  try {
    const key = getDraftKey(formType, userId)
    const timestampKey = getTimestampKey(formType, userId)

    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(timestampKey, Date.now().toString())

    console.log(`Draft saved for ${formType} form`)
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

/**
 * Load a form draft from localStorage
 * Returns null if no draft exists or if it has expired
 */
export function loadDraft<T>(
  formType: FormType,
  userId: string
): Partial<T> | null {
  if (typeof window === 'undefined') return null

  try {
    const key = getDraftKey(formType, userId)
    const timestampKey = getTimestampKey(formType, userId)

    const draftData = localStorage.getItem(key)
    const timestamp = localStorage.getItem(timestampKey)

    if (!draftData || !timestamp) {
      return null
    }

    // Check if draft has expired
    if (isDraftExpired(parseInt(timestamp, 10))) {
      clearDraft(formType, userId)
      return null
    }

    const parsed = JSON.parse(draftData) as Partial<T>
    console.log(`Draft loaded for ${formType} form`)

    return parsed
  } catch (error) {
    console.error('Error loading draft:', error)
    return null
  }
}

/**
 * Clear a form draft from localStorage
 */
export function clearDraft(formType: FormType, userId: string): void {
  if (typeof window === 'undefined') return

  try {
    const key = getDraftKey(formType, userId)
    const timestampKey = getTimestampKey(formType, userId)

    localStorage.removeItem(key)
    localStorage.removeItem(timestampKey)

    console.log(`Draft cleared for ${formType} form`)
  } catch (error) {
    console.error('Error clearing draft:', error)
  }
}

/**
 * Check if a draft exists for a given form
 */
export function hasDraft(formType: FormType, userId: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    const key = getDraftKey(formType, userId)
    const timestampKey = getTimestampKey(formType, userId)

    const draftData = localStorage.getItem(key)
    const timestamp = localStorage.getItem(timestampKey)

    if (!draftData || !timestamp) {
      return false
    }

    // Check if draft has expired
    if (isDraftExpired(parseInt(timestamp, 10))) {
      clearDraft(formType, userId)
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking draft:', error)
    return false
  }
}

/**
 * Get the timestamp of when a draft was last saved
 * Returns null if no draft exists or if it has expired
 */
export function getDraftTimestamp(formType: FormType, userId: string): Date | null {
  if (typeof window === 'undefined') return null

  try {
    const timestampKey = getTimestampKey(formType, userId)
    const timestamp = localStorage.getItem(timestampKey)

    if (!timestamp) {
      return null
    }

    const timestampNum = parseInt(timestamp, 10)

    if (isDraftExpired(timestampNum)) {
      clearDraft(formType, userId)
      return null
    }

    return new Date(timestampNum)
  } catch (error) {
    console.error('Error getting draft timestamp:', error)
    return null
  }
}

/**
 * Clear all expired drafts from localStorage
 * Useful for cleanup/maintenance
 */
export function clearExpiredDrafts(): void {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage)
    const draftKeys = keys.filter(key => key.startsWith(DRAFT_KEY_PREFIX))

    draftKeys.forEach(key => {
      const timestampKey = `${key}${DRAFT_TIMESTAMP_SUFFIX}`
      const timestamp = localStorage.getItem(timestampKey)

      if (timestamp && isDraftExpired(parseInt(timestamp, 10))) {
        localStorage.removeItem(key)
        localStorage.removeItem(timestampKey)
        console.log(`Expired draft cleared: ${key}`)
      }
    })
  } catch (error) {
    console.error('Error clearing expired drafts:', error)
  }
}
