import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { rentalId } = await request.json()

    if (!rentalId || !UUID_RE.test(rentalId)) {
      return NextResponse.json(
        { error: 'Valid Rental ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // @ts-expect-error — RPC exists but generated types are stale
    const { error } = await supabase.rpc('increment_rental_view_count', {
      rental_id: rentalId,
    })

    if (error) {
      console.error('Error incrementing rental view count:', error)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-rental-view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
