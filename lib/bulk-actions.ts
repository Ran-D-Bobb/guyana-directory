'use client'

import { createClient } from '@/lib/supabase/client'
import { logAdminAction, AdminAction, EntityType } from '@/lib/audit'

// Helper type for bulk operation results
interface BulkOperationResult {
  success: boolean
  successCount: number
  failedCount: number
  errors: string[]
}

// Generic bulk update function
async function bulkUpdateField<T>(
  table: string,
  ids: string[],
  field: string,
  value: T,
  entityType: EntityType,
  action: AdminAction,
  getEntityName: (id: string) => Promise<string>
): Promise<BulkOperationResult> {
  const supabase = createClient()
  const errors: string[] = []
  let successCount = 0

  for (const id of ids) {
    try {
      // Get current value for logging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: current, error: fetchError } = await (supabase as any)
        .from(table)
        .select(field)
        .eq('id', id)
        .single()

      if (fetchError) {
        errors.push(`Failed to fetch ${id}: ${fetchError.message}`)
        continue
      }

      // Update the field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from(table)
        .update({ [field]: value })
        .eq('id', id)

      if (updateError) {
        errors.push(`Failed to update ${id}: ${updateError.message}`)
        continue
      }

      // Log the action
      const entityName = await getEntityName(id)
      await logAdminAction({
        action,
        entity_type: entityType,
        entity_id: id,
        entity_name: entityName,
        before_data: { [field]: current[field] },
        after_data: { [field]: value },
      })

      successCount++
    } catch (error) {
      errors.push(`Error processing ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    failedCount: ids.length - successCount,
    errors,
  }
}

// Generic bulk delete function
async function bulkDelete(
  table: string,
  ids: string[],
  entityType: EntityType,
  getEntityName: (id: string) => Promise<string>
): Promise<BulkOperationResult> {
  const supabase = createClient()
  const errors: string[] = []
  let successCount = 0

  for (const id of ids) {
    try {
      const entityName = await getEntityName(id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        errors.push(`Failed to delete ${id}: ${error.message}`)
        continue
      }

      // Log the action
      await logAdminAction({
        action: 'delete',
        entity_type: entityType,
        entity_id: id,
        entity_name: entityName,
      })

      successCount++
    } catch (error) {
      errors.push(`Error deleting ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    failedCount: ids.length - successCount,
    errors,
  }
}

// =====================
// Business Bulk Actions
// =====================

async function getBusinessName(id: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', id)
    .single()
  return data?.name || 'Unknown Business'
}

export async function bulkVerifyBusinesses(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'businesses',
    ids,
    'is_verified',
    true,
    'business',
    'verify',
    getBusinessName
  )
}

export async function bulkUnverifyBusinesses(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'businesses',
    ids,
    'is_verified',
    false,
    'business',
    'unverify',
    getBusinessName
  )
}

export async function bulkFeatureBusinesses(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'businesses',
    ids,
    'is_featured',
    true,
    'business',
    'feature',
    getBusinessName
  )
}

export async function bulkUnfeatureBusinesses(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'businesses',
    ids,
    'is_featured',
    false,
    'business',
    'unfeature',
    getBusinessName
  )
}

export async function bulkDeleteBusinesses(ids: string[]): Promise<BulkOperationResult> {
  return bulkDelete('businesses', ids, 'business', getBusinessName)
}

// ====================
// Review Bulk Actions
// ====================

async function getReviewName(id: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select(`
      profiles(name),
      businesses(name)
    `)
    .eq('id', id)
    .single()

  const reviewerName = data?.profiles?.name || 'Unknown User'
  const businessName = data?.businesses?.name || ''
  return businessName
    ? `Review by ${reviewerName} for ${businessName}`
    : `Review by ${reviewerName}`
}

export async function bulkDeleteReviews(ids: string[]): Promise<BulkOperationResult> {
  return bulkDelete('reviews', ids, 'review', getReviewName)
}

// =====================
// Tourism Bulk Actions
// =====================

async function getTourismName(id: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('tourism_experiences')
    .select('name')
    .eq('id', id)
    .single()
  return data?.name || 'Unknown Experience'
}

export async function bulkApproveTourism(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'tourism_experiences',
    ids,
    'is_approved',
    true,
    'tourism',
    'approve',
    getTourismName
  )
}

export async function bulkUnapproveTourism(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'tourism_experiences',
    ids,
    'is_approved',
    false,
    'tourism',
    'unapprove',
    getTourismName
  )
}

export async function bulkFeatureTourism(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'tourism_experiences',
    ids,
    'is_featured',
    true,
    'tourism',
    'feature',
    getTourismName
  )
}

export async function bulkUnfeatureTourism(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'tourism_experiences',
    ids,
    'is_featured',
    false,
    'tourism',
    'unfeature',
    getTourismName
  )
}

export async function bulkDeleteTourism(ids: string[]): Promise<BulkOperationResult> {
  return bulkDelete('tourism_experiences', ids, 'tourism', getTourismName)
}

// ====================
// Rental Bulk Actions
// ====================

async function getRentalName(id: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('rentals')
    .select('name')
    .eq('id', id)
    .single()
  return data?.name || 'Unknown Rental'
}

export async function bulkFeatureRentals(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'rentals',
    ids,
    'is_featured',
    true,
    'rental',
    'feature',
    getRentalName
  )
}

export async function bulkUnfeatureRentals(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'rentals',
    ids,
    'is_featured',
    false,
    'rental',
    'unfeature',
    getRentalName
  )
}

export async function bulkShowRentals(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'rentals',
    ids,
    'is_approved',
    true,
    'rental',
    'approve',
    getRentalName
  )
}

export async function bulkHideRentals(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'rentals',
    ids,
    'is_approved',
    false,
    'rental',
    'unapprove',
    getRentalName
  )
}

export async function bulkDismissRentalFlags(ids: string[]): Promise<BulkOperationResult> {
  const supabase = createClient()
  const errors: string[] = []
  let successCount = 0

  for (const id of ids) {
    try {
      // Get current values for logging
      const { data: current, error: fetchError } = await supabase
        .from('rentals')
        .select('is_flagged, flag_count, flag_reasons')
        .eq('id', id)
        .single()

      if (fetchError) {
        errors.push(`Failed to fetch ${id}: ${fetchError.message}`)
        continue
      }

      // Update the rental
      const { error: updateError } = await supabase
        .from('rentals')
        .update({
          is_flagged: false,
          flag_count: 0,
          flag_reasons: []
        })
        .eq('id', id)

      if (updateError) {
        errors.push(`Failed to update ${id}: ${updateError.message}`)
        continue
      }

      // Log the action
      const rentalName = await getRentalName(id)
      await logAdminAction({
        action: 'dismiss_flag',
        entity_type: 'rental',
        entity_id: id,
        entity_name: rentalName,
        before_data: {
          is_flagged: current.is_flagged,
          flag_count: current.flag_count,
          flag_reasons: current.flag_reasons
        },
        after_data: {
          is_flagged: false,
          flag_count: 0,
          flag_reasons: []
        },
      })

      successCount++
    } catch (error) {
      errors.push(`Error processing ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    failedCount: ids.length - successCount,
    errors,
  }
}

export async function bulkDeleteRentals(ids: string[]): Promise<BulkOperationResult> {
  return bulkDelete('rentals', ids, 'rental', getRentalName)
}

// ===================
// Event Bulk Actions
// ===================

async function getEventName(id: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('title')
    .eq('id', id)
    .single()
  return data?.title || 'Unknown Event'
}

export async function bulkFeatureEvents(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'events',
    ids,
    'is_featured',
    true,
    'event',
    'feature',
    getEventName
  )
}

export async function bulkUnfeatureEvents(ids: string[]): Promise<BulkOperationResult> {
  return bulkUpdateField(
    'events',
    ids,
    'is_featured',
    false,
    'event',
    'unfeature',
    getEventName
  )
}

export async function bulkDeleteEvents(ids: string[]): Promise<BulkOperationResult> {
  return bulkDelete('events', ids, 'event', getEventName)
}
