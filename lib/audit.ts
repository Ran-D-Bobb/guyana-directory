import { createClient } from '@/lib/supabase/client'

// Action types that can be logged
export type AdminAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'verify'
  | 'unverify'
  | 'feature'
  | 'unfeature'
  | 'approve'
  | 'unapprove'
  | 'suspend'
  | 'ban'
  | 'reactivate'
  | 'dismiss_flag'

// Entity types that can be acted upon
export type EntityType =
  | 'business'
  | 'review'
  | 'event'
  | 'tourism'
  | 'rental'
  | 'user'
  | 'photo'
  | 'category'
  | 'region'
  | 'timeline'
  | 'tag'

export interface AuditLogEntry {
  action: AdminAction
  entity_type: EntityType
  entity_id: string
  entity_name: string
  before_data?: Record<string, unknown> | null
  after_data?: Record<string, unknown> | null
}

/**
 * Client-side audit logging utility
 * Use this in client components to log admin actions
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Failed to get user for audit log:', userError)
    return { success: false, error: 'User not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('admin_audit_logs')
    .insert({
      admin_id: user.id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      entity_name: entry.entity_name,
      before_data: entry.before_data || null,
      after_data: entry.after_data || null,
    })

  if (error) {
    console.error('Failed to create audit log:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Helper to create a before/after snapshot for updates
 * Filters out null values and only includes changed fields
 */
export function createUpdateSnapshot(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields?: string[]
): { before_data: Record<string, unknown>; after_data: Record<string, unknown> } {
  const relevantFields = fields || Object.keys(after)
  const before_data: Record<string, unknown> = {}
  const after_data: Record<string, unknown> = {}

  for (const field of relevantFields) {
    if (before[field] !== after[field]) {
      before_data[field] = before[field]
      after_data[field] = after[field]
    }
  }

  return { before_data, after_data }
}
