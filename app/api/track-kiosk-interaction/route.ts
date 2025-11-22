import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      experience_id,
      interaction_type, // 'view' | 'qr_scan' | 'whatsapp_click' | 'category_view'
      session_id,
      metadata
    } = body

    // Validate required fields
    if (!interaction_type || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For experience-specific interactions
    if (experience_id) {
      // Track tourism inquiry click (for WhatsApp clicks)
      if (interaction_type === 'whatsapp_click') {
        const { error: inquiryError } = await supabase
          .from('tourism_inquiry_clicks')
          .insert({
            experience_id,
            device_type: 'kiosk',
            session_id,
            user_agent: request.headers.get('user-agent') || 'kiosk'
          })

        if (inquiryError) {
          console.error('Error tracking inquiry click:', inquiryError)
        }

        // Increment inquiry count using the database function
        const { error: incrementError } = await supabase
          .rpc('increment_tourism_inquiry' as 'increment_tourism_view_count', { experience_id })

        if (incrementError) {
          console.error('Error incrementing inquiry count:', incrementError)
        }
      }

      // Track experience view
      if (interaction_type === 'view') {
        const { error: viewError } = await supabase
          .rpc('increment_tourism_view_count', { experience_id })

        if (viewError) {
          console.error('Error incrementing view count:', viewError)
        }
      }
    }

    // Log all kiosk interactions for analytics (optional - you could create a separate table)
    // This is useful for understanding kiosk usage patterns
    console.log('Kiosk interaction:', {
      type: interaction_type,
      experience_id,
      session_id,
      metadata,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking kiosk interaction:', error)
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    )
  }
}
