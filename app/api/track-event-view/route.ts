import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId || !UUID_RE.test(eventId)) {
      return NextResponse.json(
        { error: 'Valid Event ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Increment the event's view_count
    const { error } = await supabase.rpc('increment_event_views', {
      event_id: eventId,
    })

    if (error) {
      console.error('Error incrementing event view count:', error)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-event-view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
