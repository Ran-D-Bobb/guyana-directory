import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from './audit'

/**
 * Flag a photo as inappropriate (for authenticated users)
 */
export async function flagPhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('flag_photo', {
    p_photo_id: photoId
  })

  if (error) {
    console.error('Failed to flag photo:', error)
    return { success: false, error: error.message }
  }

  if (!data.success) {
    return { success: false, error: data.error }
  }

  return { success: true }
}

/**
 * Check if user has already flagged a photo
 */
export async function hasUserFlaggedPhoto(photoId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('photo_flags')
    .select('id')
    .eq('photo_id', photoId)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to check flag status:', error)
  }

  return !!data
}

/**
 * Admin: Dismiss all flags on a photo
 */
export async function dismissPhotoFlags(
  photoId: string,
  photoInfo: { businessName: string; imageUrl: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('dismiss_photo_flags', {
    p_photo_id: photoId
  })

  if (error) {
    console.error('Failed to dismiss photo flags:', error)
    return { success: false, error: error.message }
  }

  if (!data.success) {
    return { success: false, error: data.error }
  }

  // Log the admin action
  await logAdminAction({
    action: 'dismiss_flag',
    entity_type: 'photo',
    entity_id: photoId,
    entity_name: `Photo for ${photoInfo.businessName}`,
    after_data: { image_url: photoInfo.imageUrl, action: 'flags_dismissed' }
  })

  return { success: true }
}

/**
 * Admin: Delete a flagged photo
 */
export async function deletePhoto(
  photoId: string,
  photoInfo: { businessName: string; imageUrl: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // First get the photo details for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: photo } = await (supabase as any)
    .from('business_photos')
    .select('*')
    .eq('id', photoId)
    .single()

  // Delete from database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('business_photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    console.error('Failed to delete photo:', error)
    return { success: false, error: error.message }
  }

  // Try to delete from storage if it's a supabase storage URL
  if (photoInfo.imageUrl.includes('supabase')) {
    try {
      const url = new URL(photoInfo.imageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/business-photos\/(.+)/)
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1])
        await supabase.storage.from('business-photos').remove([storagePath])
      }
    } catch (err) {
      console.error('Failed to delete photo from storage:', err)
      // Continue anyway as the database record is already deleted
    }
  }

  // Log the admin action
  await logAdminAction({
    action: 'delete',
    entity_type: 'photo',
    entity_id: photoId,
    entity_name: `Photo for ${photoInfo.businessName}`,
    before_data: photo || { image_url: photoInfo.imageUrl }
  })

  return { success: true }
}

/**
 * Get flagged photos count for admin sidebar
 */
export async function getFlaggedPhotosCount(): Promise<number> {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('business_photos')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)

  if (error) {
    console.error('Failed to get flagged photos count:', error)
    return 0
  }

  return count || 0
}
