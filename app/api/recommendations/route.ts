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
    const rawLimit = body.limit ?? 6
    const limit = Math.min(Math.max(1, Number(rawLimit) || 6), 20)
    const recentlyViewedCategories = (body.recentlyViewedCategories || []).slice(0, 10)

    // Get recommendations
    const result = await getRecommendations(supabase, {
      userId: user?.id,
      recentlyViewedCategories,
      limit,
    })

    // If no activity or no results, get fallback recommendations
    if (!result.hasActivity || result.items.length === 0) {
      const fallback = await getFallbackRecommendations(supabase, limit)
      const response = NextResponse.json({
        items: fallback,
        basedOn: null,
        hasActivity: false,
        isFallback: true,
      })
      // Unauthenticated fallback responses can be cached publicly
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
      return response
    }

    const response = NextResponse.json({
      ...result,
      isFallback: false,
    })
    // Authenticated responses are private with shorter cache
    response.headers.set('Cache-Control', 'private, max-age=30')
    return response
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
