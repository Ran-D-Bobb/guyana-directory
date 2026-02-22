import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json()

    if (!businessId || !UUID_RE.test(businessId)) {
      return NextResponse.json(
        { error: 'Valid Business ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Increment the business's view_count
    const { error } = await supabase.rpc('increment_view_count', {
      business_id: businessId,
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-page-view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
