import { createClient } from '@/lib/supabase/server'
import KioskHomePage from './KioskHomePage'
import type { UnifiedEvent } from '@/types/unified-events'

export const metadata = {
  title: 'Tourism Kiosk - Discover Guyana',
  description: 'Interactive tourism kiosk showcasing the best experiences in Guyana'
}

export default async function KioskPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Run all queries in parallel for faster page load
  const [experiencesResult, categoriesResult, featuredResult, eventsResult] = await Promise.all([
    // Fetch all approved tourism experiences
    supabase
      .from('tourism_experiences')
      .select(`
        id, slug, name, description, price_from, rating, review_count,
        duration, difficulty_level, tourism_category_id,
        video_url, video_thumbnail_url,
        tourism_categories(name),
        tourism_photos(image_url, is_primary)
      `)
      .eq('is_approved', true)
      .order('rating', { ascending: false })
      .limit(50),

    // Fetch tourism categories
    supabase
      .from('tourism_categories')
      .select('id, slug, name, icon, description')
      .order('name'),

    // Fetch featured attractions
    supabase
      .from('tourism_experiences')
      .select(`
        id, slug, name, description, price_from, rating, review_count,
        duration, difficulty_level, tourism_category_id,
        video_url, video_thumbnail_url,
        tourism_categories(name),
        tourism_photos(image_url, is_primary)
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(10),

    // Fetch upcoming + ongoing events from unified view
    supabase
      .from('all_events')
      .select('*')
      .or(`start_date.gt.${now},and(start_date.lte.${now},end_date.gte.${now})`)
      .order('is_featured', { ascending: false })
      .order('start_date', { ascending: true })
      .limit(50),
  ])

  // Fetch annual holiday timeline events (separate query, not in Promise.all due to type cast)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timelineEventsRaw } = await (supabase as any)
    .from('timeline_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const { data: experiences, error } = experiencesResult

  if (error) {
    console.error('Error fetching experiences:', error)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-12"
        style={{ background: 'var(--kiosk-bg-base, #0c1f17)' }}
      >
        <div className="text-center space-y-8 max-w-2xl">
          <div className="w-32 h-32 mx-auto rounded-full bg-emerald-900/50 flex items-center justify-center">
            <svg className="w-16 h-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white">
            We&apos;ll be right back
          </h1>
          <p className="text-2xl text-white/70">
            Our tourism experiences are temporarily unavailable. Please try again in a moment.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <summary className="text-white cursor-pointer font-semibold">Developer Info</summary>
              <pre className="text-white/70 font-mono text-sm mt-4 overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Helper to transform experience data
  const transformExperience = (exp: (typeof experiences)[number]) => {
    const photos = exp.tourism_photos as Array<{image_url: string; is_primary: boolean | null}> | null
    const primaryPhoto = photos?.find((p) => p.is_primary)
    const anyPhoto = photos?.[0]
    const category = exp.tourism_categories as {name: string} | null

    return {
      id: exp.id as string,
      slug: exp.slug as string,
      name: exp.name as string,
      description: exp.description as string,
      image_url: (primaryPhoto?.image_url || anyPhoto?.image_url || null) as string | null,
      video_url: (exp.video_url || null) as string | null,
      video_thumbnail_url: (exp.video_thumbnail_url || null) as string | null,
      rating: exp.rating as number,
      review_count: exp.review_count as number,
      duration: exp.duration as string | null,
      price_from: exp.price_from as number,
      category_name: category?.name || 'Experience',
      difficulty_level: exp.difficulty_level as string | null
    }
  }

  const transformedExperiences = (experiences || []).map(transformExperience)

  // Get category counts from approved experiences in a single query instead of N+1
  const { data: categoryCounts } = await supabase
    .from('tourism_experiences')
    .select('tourism_category_id')
    .eq('is_approved', true)

  const countMap = new Map<string, number>()
  ;(categoryCounts || []).forEach((row) => {
    const catId = row.tourism_category_id as string
    countMap.set(catId, (countMap.get(catId) || 0) + 1)
  })

  const categoriesWithCounts = (categoriesResult.data || []).map((category) => ({
    id: category.id as string,
    slug: category.slug as string,
    name: category.name as string,
    icon: category.icon as string,
    description: category.description as string | null,
    experience_count: countMap.get(category.id as string) || 0
  }))

  const transformedFeatured = (featuredResult.data || []).map(transformExperience)

  // Transform events from unified view
  const rawEvents = (eventsResult.data || []) as UnifiedEvent[]
  const transformedEvents = rawEvents.map(event => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    start_date: event.start_date,
    end_date: event.end_date,
    image_url: event.image_url,
    location: event.location,
    is_featured: event.is_featured,
    view_count: event.view_count,
    interest_count: event.interest_count,
    source_type: event.source_type,
    business_name: event.business_name,
    business_slug: event.business_slug,
    category_name: event.category_name,
    category_icon: event.category_icon,
    event_type_name: event.event_type_name,
  }))

  // Transform timeline events for the kiosk
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedTimeline = (timelineEventsRaw || []).map((evt: any) => ({
    id: evt.id as string,
    title: evt.title as string,
    subtitle: evt.subtitle as string | null,
    description: evt.description as string | null,
    month: evt.month as string,
    month_short: evt.month_short as string,
    day: evt.day as string,
    location: evt.location as string | null,
    media_type: evt.media_type as 'image' | 'video',
    media_url: evt.media_url as string,
    thumbnail_url: evt.thumbnail_url as string | null,
    gradient_colors: evt.gradient_colors as string,
    accent_color: evt.accent_color as string,
    category: evt.category as string,
    highlights: evt.highlights as string[],
    display_order: evt.display_order as number,
  }))

  return (
    <KioskHomePage
      featuredExperiences={transformedFeatured}
      allExperiences={transformedExperiences}
      categories={categoriesWithCounts}
      upcomingEvents={transformedEvents}
      timelineEvents={transformedTimeline}
    />
  )
}
