import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { experienceId } = await request.json()

    if (!experienceId || !UUID_RE.test(experienceId)) {
      return NextResponse.json(
        { error: 'Valid Experience ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_tourism_view_count', {
      experience_id: experienceId,
    })

    if (error) {
      console.error('Error incrementing tourism view count:', error)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-tourism-view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
