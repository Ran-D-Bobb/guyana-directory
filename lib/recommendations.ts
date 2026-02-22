import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import type { FeedItem } from '@/components/home'

interface CategoryWeight {
  categoryId: string
  categoryName: string
  weight: number
  source: 'saved' | 'reviewed' | 'viewed'
}

interface RecommendationInput {
  userId?: string
  recentlyViewedCategories?: { categoryName: string; count: number }[]
  limit?: number
}

interface RecommendationResult {
  items: FeedItem[]
  basedOn: string | null
  hasActivity: boolean
}

/**
 * Get personalized business recommendations based on user activity
 *
 * Algorithm:
 * 1. Saved businesses categories: weight 3 (strongest signal)
 * 2. Reviewed businesses categories: weight 2 (good signal)
 * 3. Recently viewed categories: weight 1 (weak signal)
 *
 * Falls back to featured/popular businesses if no activity data
 */
export async function getRecommendations(
  supabase: SupabaseClient<Database>,
  input: RecommendationInput
): Promise<RecommendationResult> {
  const { userId, recentlyViewedCategories = [], limit = 6 } = input
  const categoryWeights: Map<string, CategoryWeight> = new Map()

  // Fetch saved and reviewed data in parallel to reduce query count
  type BusinessWithCategory = { business_id: string; businesses: { category_id: string | null; categories: { id: string; name: string } | null } }
  let savedBusinesses: BusinessWithCategory[] | null = null
  let reviewsData: BusinessWithCategory[] | null = null

  if (userId) {
    const [savedResult, reviewsResult] = await Promise.all([
      supabase
        .from('saved_businesses')
        .select(`
          business_id,
          businesses!inner (
            category_id,
            categories!inner (id, name)
          )
        `)
        .eq('user_id', userId),
      supabase
        .from('reviews')
        .select(`
          business_id,
          businesses!inner (
            category_id,
            categories!inner (id, name)
          )
        `)
        .eq('user_id', userId),
    ])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedBusinesses = savedResult.data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewsData = reviewsResult.data as any
  }

  // 1. Get categories from saved businesses (weight: 3)
  if (savedBusinesses) {
    for (const saved of savedBusinesses) {
      const business = saved.businesses as {
        category_id: string | null
        categories: { id: string; name: string } | null
      }
      if (business?.categories) {
        const existing = categoryWeights.get(business.categories.id)
        categoryWeights.set(business.categories.id, {
          categoryId: business.categories.id,
          categoryName: business.categories.name,
          weight: (existing?.weight || 0) + 3,
          source: 'saved',
        })
      }
    }
  }

  // 2. Get categories from reviewed businesses (weight: 2)
  if (reviewsData) {
    for (const review of reviewsData) {
      const business = review.businesses as {
        category_id: string | null
        categories: { id: string; name: string } | null
      }
      if (business?.categories) {
        const existing = categoryWeights.get(business.categories.id)
        categoryWeights.set(business.categories.id, {
          categoryId: business.categories.id,
          categoryName: business.categories.name,
          weight: (existing?.weight || 0) + 2,
          source: existing?.source || 'reviewed',
        })
      }
    }
  }

  // 3. Add recently viewed categories (weight: 1 per view)
  // Match category names to get IDs
  if (recentlyViewedCategories.length > 0) {
    const categoryNames = recentlyViewedCategories.map(c => c.categoryName)
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', categoryNames)

    if (categories) {
      for (const category of categories) {
        const viewedData = recentlyViewedCategories.find(
          c => c.categoryName.toLowerCase() === category.name.toLowerCase()
        )
        if (viewedData) {
          const existing = categoryWeights.get(category.id)
          categoryWeights.set(category.id, {
            categoryId: category.id,
            categoryName: category.name,
            weight: (existing?.weight || 0) + viewedData.count,
            source: existing?.source || 'viewed',
          })
        }
      }
    }
  }

  // Sort categories by weight descending
  const sortedCategories = Array.from(categoryWeights.values())
    .sort((a, b) => b.weight - a.weight)

  // If no activity data, return empty with hasActivity: false
  if (sortedCategories.length === 0) {
    return {
      items: [],
      basedOn: null,
      hasActivity: false,
    }
  }

  // Get the top category for display
  const topCategory = sortedCategories[0]

  // Get top 3 category IDs for querying
  const topCategoryIds = sortedCategories.slice(0, 3).map(c => c.categoryId)

  // Reuse already-fetched data for exclusion list (no extra queries needed)
  const excludeBusinessIds: string[] = []

  if (savedBusinesses) {
    excludeBusinessIds.push(...savedBusinesses.map(s => s.business_id))
  }
  if (reviewsData) {
    excludeBusinessIds.push(...reviewsData.map(r => r.business_id))
  }

  // Query businesses from preferred categories
  const query = supabase
    .from('businesses')
    .select(`
      id, name, slug, description, rating, review_count,
      is_featured, is_verified,
      categories:category_id (name),
      regions:region_id (name),
      business_photos (image_url, is_primary)
    `)
    .in('category_id', topCategoryIds)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit * 2) // Fetch more to have buffer after filtering

  // Execute query
  const { data: businesses } = await query

  if (!businesses || businesses.length === 0) {
    return {
      items: [],
      basedOn: topCategory.categoryName,
      hasActivity: true,
    }
  }

  // Filter out excluded businesses and transform to FeedItem format
  const getPrimaryImage = (
    photos: { image_url: string; is_primary: boolean | null }[] | null
  ): string => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
    }
    const primary = photos.find((p) => p.is_primary)
    return primary?.image_url || photos[0]?.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
  }

  const filteredBusinesses = businesses
    .filter(b => !excludeBusinessIds.includes(b.id))
    .slice(0, limit)

  const items: FeedItem[] = filteredBusinesses.map((b) => ({
    id: b.id,
    type: 'business' as const,
    name: b.name,
    slug: b.slug,
    description: b.description,
    image_url: getPrimaryImage(
      b.business_photos as { image_url: string; is_primary: boolean | null }[] | null
    ),
    rating: b.rating,
    review_count: b.review_count || 0,
    category_name: (b.categories as { name: string } | null)?.name || null,
    is_featured: b.is_featured || false,
    is_verified: b.is_verified || false,
    location: (b.regions as { name: string } | null)?.name || null,
  }))

  return {
    items,
    basedOn: topCategory.categoryName,
    hasActivity: true,
  }
}

/**
 * Get fallback recommendations (featured/popular) when no user activity
 */
export async function getFallbackRecommendations(
  supabase: SupabaseClient<Database>,
  limit: number = 6
): Promise<FeedItem[]> {
  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, description, rating, review_count,
      is_featured, is_verified,
      categories:category_id (name),
      regions:region_id (name),
      business_photos (image_url, is_primary)
    `)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (!businesses) return []

  const getPrimaryImage = (
    photos: { image_url: string; is_primary: boolean | null }[] | null
  ): string => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
    }
    const primary = photos.find((p) => p.is_primary)
    return primary?.image_url || photos[0]?.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80'
  }

  return businesses.map((b) => ({
    id: b.id,
    type: 'business' as const,
    name: b.name,
    slug: b.slug,
    description: b.description,
    image_url: getPrimaryImage(
      b.business_photos as { image_url: string; is_primary: boolean | null }[] | null
    ),
    rating: b.rating,
    review_count: b.review_count || 0,
    category_name: (b.categories as { name: string } | null)?.name || null,
    is_featured: b.is_featured || false,
    is_verified: b.is_verified || false,
    location: (b.regions as { name: string } | null)?.name || null,
  }))
}
