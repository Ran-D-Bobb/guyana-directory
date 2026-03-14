import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin'
import { logAdminAction } from '@/lib/audit'

/**
 * DELETE /api/admin/photo-audit
 * Removes a business photo (admin only). Uses service role to bypass RLS.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId, businessName, imageUrl } = await request.json()

    if (!photoId) {
      return NextResponse.json({ error: 'photoId is required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get photo details before deleting
    const { data: photo } = await serviceClient
      .from('business_photos')
      .select('*')
      .eq('id', photoId)
      .single()

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from database
    const { error } = await serviceClient
      .from('business_photos')
      .delete()
      .eq('id', photoId)

    if (error) {
      console.error('Failed to delete photo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Try to delete from storage
    const photoUrl = imageUrl || photo.image_url
    if (photoUrl?.includes('supabase')) {
      try {
        const url = new URL(photoUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/business-photos\/(.+)/)
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1])
          await serviceClient.storage.from('business-photos').remove([storagePath])
        }
      } catch (err) {
        console.error('Failed to delete from storage (continuing):', err)
      }
    }

    // Log admin action
    await logAdminAction({
      action: 'delete',
      entity_type: 'photo',
      entity_id: photoId,
      entity_name: `Photo for ${businessName || 'unknown business'}`,
      before_data: photo,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Photo audit DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
