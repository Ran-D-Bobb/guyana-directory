import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { businessId, deviceType, userAgent } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert click record
    const { error: clickError } = await supabase
      .from('whatsapp_clicks')
      .insert({
        business_id: businessId,
        device_type: deviceType,
        user_agent: userAgent,
      })

    if (clickError) {
      console.error('Error inserting whatsapp click:', clickError)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    // Increment the business's whatsapp_clicks counter
    const { error: updateError } = await supabase.rpc('increment_whatsapp_clicks', {
      business_id: businessId,
    })

    if (updateError) {
      console.error('Error incrementing whatsapp clicks:', updateError)
      // Don't return error here as the click was tracked, just the counter failed
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-whatsapp-click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
