import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const RPC_MAP: Record<string, { rpc: string; param: string }> = {
  business: { rpc: 'increment_view_count', param: 'business_id' },
  event: { rpc: 'increment_event_views', param: 'event_id' },
  tourism: { rpc: 'increment_tourism_view_count', param: 'experience_id' },
  rental: { rpc: 'increment_rental_view_count', param: 'rental_id' },
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!rateLimit(ip).success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { type, id } = await request.json()

    const config = RPC_MAP[type]
    if (!config || !id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = await createClient()

    // @ts-expect-error — RPC names are dynamic, types may be stale
    const { error } = await supabase.rpc(config.rpc, { [config.param]: id })

    if (error) {
      console.error(`Error tracking ${type} view:`, error)
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
