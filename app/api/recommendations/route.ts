import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecommendations, getFallbackRecommendations } from '@/lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Parse request body
    const body = await request.json()
    const { recentlyViewedCategories = [], limit = 6 } = body

    // Get recommendations
    const result = await getRecommendations(supabase, {
      userId: user?.id,
      recentlyViewedCategories,
      limit,
    })

    // If no activity or no results, get fallback recommendations
    if (!result.hasActivity || result.items.length === 0) {
      const fallback = await getFallbackRecommendations(supabase, limit)
      return NextResponse.json({
        items: fallback,
        basedOn: null,
        hasActivity: false,
        isFallback: true,
      })
    }

    return NextResponse.json({
      ...result,
      isFallback: false,
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
