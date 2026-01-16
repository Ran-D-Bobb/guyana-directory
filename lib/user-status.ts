import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/audit'

// Note: After applying migration 20260116110000_user_status.sql,
// run: supabase gen types typescript --local > types/supabase.ts
// to update the types and remove the 'as any' casts below

export type UserStatus = 'active' | 'suspended' | 'banned'

export interface UserStatusInfo {
  status: UserStatus
  status_reason: string | null
  status_expires_at: string | null
  status_updated_at: string | null
  status_updated_by: string | null
}

export interface SuspendUserOptions {
  userId: string
  userName: string
  reason: string
  expiresAt: Date | null // null for indefinite suspension
}

export interface BanUserOptions {
  userId: string
  userName: string
  reason: string
  deleteReviews?: boolean
  removeBusinessOwnership?: boolean
}

export interface ReactivateUserOptions {
  userId: string
  userName: string
}

/**
 * Suspend a user account with optional expiration
 */
export async function suspendUser(options: SuspendUserOptions): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Get current user (admin performing the action)
  const { data: { user: admin }, error: adminError } = await supabase.auth.getUser()
  if (adminError || !admin) {
    return { success: false, error: 'Admin not authenticated' }
  }

  // Get current user status for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentUser, error: fetchError } = await (supabase as any)
    .from('profiles')
    .select('status, status_reason, status_expires_at')
    .eq('id', options.userId)
    .single()

  if (fetchError) {
    return { success: false, error: 'Failed to fetch user data' }
  }

  // Update user status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({
      status: 'suspended',
      status_reason: options.reason,
      status_expires_at: options.expiresAt?.toISOString() || null,
      status_updated_at: new Date().toISOString(),
      status_updated_by: admin.id,
    })
    .eq('id', options.userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the action
  await logAdminAction({
    action: 'suspend',
    entity_type: 'user',
    entity_id: options.userId,
    entity_name: options.userName,
    before_data: {
      status: currentUser.status,
      status_reason: currentUser.status_reason,
      status_expires_at: currentUser.status_expires_at,
    },
    after_data: {
      status: 'suspended',
      status_reason: options.reason,
      status_expires_at: options.expiresAt?.toISOString() || null,
    },
  })

  return { success: true }
}

/**
 * Ban a user account permanently with options to remove their content
 */
export async function banUser(options: BanUserOptions): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Get current user (admin performing the action)
  const { data: { user: admin }, error: adminError } = await supabase.auth.getUser()
  if (adminError || !admin) {
    return { success: false, error: 'Admin not authenticated' }
  }

  // Get current user status for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentUser, error: fetchError } = await (supabase as any)
    .from('profiles')
    .select('status, status_reason')
    .eq('id', options.userId)
    .single()

  if (fetchError) {
    return { success: false, error: 'Failed to fetch user data' }
  }

  // Delete reviews if requested
  if (options.deleteReviews) {
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', options.userId)

    if (reviewsError) {
      console.error('Failed to delete user reviews:', reviewsError)
    }
  }

  // Remove business ownership if requested
  if (options.removeBusinessOwnership) {
    const { error: businessError } = await supabase
      .from('businesses')
      .update({ owner_id: null })
      .eq('owner_id', options.userId)

    if (businessError) {
      console.error('Failed to remove business ownership:', businessError)
    }
  }

  // Update user status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({
      status: 'banned',
      status_reason: options.reason,
      status_expires_at: null, // Bans don't expire
      status_updated_at: new Date().toISOString(),
      status_updated_by: admin.id,
    })
    .eq('id', options.userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the action with content removal details
  await logAdminAction({
    action: 'ban',
    entity_type: 'user',
    entity_id: options.userId,
    entity_name: options.userName,
    before_data: {
      status: currentUser.status,
      status_reason: currentUser.status_reason,
    },
    after_data: {
      status: 'banned',
      status_reason: options.reason,
      reviews_deleted: options.deleteReviews || false,
      ownership_removed: options.removeBusinessOwnership || false,
    },
  })

  return { success: true }
}

/**
 * Reactivate a suspended or banned user account
 */
export async function reactivateUser(options: ReactivateUserOptions): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Get current user (admin performing the action)
  const { data: { user: admin }, error: adminError } = await supabase.auth.getUser()
  if (adminError || !admin) {
    return { success: false, error: 'Admin not authenticated' }
  }

  // Get current user status for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentUser, error: fetchError } = await (supabase as any)
    .from('profiles')
    .select('status, status_reason, status_expires_at')
    .eq('id', options.userId)
    .single()

  if (fetchError) {
    return { success: false, error: 'Failed to fetch user data' }
  }

  // Update user status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({
      status: 'active',
      status_reason: null,
      status_expires_at: null,
      status_updated_at: new Date().toISOString(),
      status_updated_by: admin.id,
    })
    .eq('id', options.userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the action
  await logAdminAction({
    action: 'reactivate',
    entity_type: 'user',
    entity_id: options.userId,
    entity_name: options.userName,
    before_data: {
      status: currentUser.status,
      status_reason: currentUser.status_reason,
      status_expires_at: currentUser.status_expires_at,
    },
    after_data: {
      status: 'active',
    },
  })

  return { success: true }
}

/**
 * Check if a user's suspension has expired and should be auto-reactivated
 */
export function isExpiredSuspension(statusInfo: UserStatusInfo): boolean {
  if (statusInfo.status !== 'suspended' || !statusInfo.status_expires_at) {
    return false
  }
  return new Date(statusInfo.status_expires_at) < new Date()
}

/**
 * Get a human-readable status message for blocked users
 */
export function getBlockedMessage(status: UserStatus, reason: string | null, expiresAt: string | null): string {
  if (status === 'banned') {
    return `Your account has been permanently banned.${reason ? ` Reason: ${reason}` : ''}`
  }

  if (status === 'suspended') {
    if (expiresAt) {
      const expiry = new Date(expiresAt)
      const formattedDate = expiry.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
      return `Your account is suspended until ${formattedDate}.${reason ? ` Reason: ${reason}` : ''}`
    }
    return `Your account is suspended indefinitely.${reason ? ` Reason: ${reason}` : ''}`
  }

  return ''
}
