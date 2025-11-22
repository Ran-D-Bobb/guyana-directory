import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KioskHomePage from './KioskHomePage'

export const metadata = {
  title: 'Tourism Kiosk - Discover Guyana',
  description: 'Interactive tourism kiosk showcasing the best experiences in Guyana'
}

export default async function KioskPage() {
  const supabase = await createClient()

  // Fetch tourism experiences for the attraction loop
  // Note: Kiosk mode shows all experiences for demonstration purposes
  const { data: experiences, error } = await supabase
    .from('tourism_experiences')
    .select(`
      id,
      slug,
      name,
      description,
      price_from,
      rating,
      review_count,
      duration,
      difficulty_level,
      tourism_category_id,
      tourism_categories(name),
      tourism_photos(image_url, is_primary)
    `)
    .order('rating', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching experiences:', error)
    // Show a helpful error page for debugging
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-2xl border border-white/20 text-center space-y-6">
          <h1 className="text-5xl font-black text-white">Kiosk Setup Required</h1>
          <p className="text-2xl text-white/80">
            The tourism database needs to be initialized.
          </p>
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-left">
            <p className="text-white font-mono text-sm">
              Error: {JSON.stringify(error, null, 2)}
            </p>
          </div>
          <div className="text-left space-y-3 bg-blue-500/20 border border-blue-500/50 rounded-2xl p-6">
            <p className="text-xl font-bold text-white">Setup Steps:</p>
            <ol className="text-white/90 space-y-2 list-decimal list-inside">
              <li>Ensure Supabase is running: <code className="bg-black/30 px-2 py-1 rounded">supabase start</code></li>
              <li>Run migrations: <code className="bg-black/30 px-2 py-1 rounded">supabase db reset</code></li>
              <li>Verify tourism tables exist in Supabase Studio</li>
              <li>Check that sample tourism data is seeded</li>
            </ol>
          </div>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-8 py-4 rounded-full transition-all hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Transform data for the component
  const transformedExperiences = (experiences || []).map((exp) => {
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
      rating: exp.rating as number,
      review_count: exp.review_count as number,
      duration: exp.duration as string | null,
      price_from: exp.price_from as number,
      category_name: category?.name || 'Experience',
      difficulty_level: exp.difficulty_level as string | null
    }
  })

  // Fetch tourism categories with experience counts
  const { data: categories } = await supabase
    .from('tourism_categories')
    .select(`
      id,
      slug,
      name,
      icon,
      description
    `)
    .order('name')

  // Get experience counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('tourism_experiences')
        .select('*', { count: 'exact', head: true })
        .eq('tourism_category_id', category.id as string)
        .eq('is_approved', true)

      return {
        id: category.id as string,
        slug: category.slug as string,
        name: category.name as string,
        icon: category.icon as string,
        description: category.description as string | null,
        experience_count: count || 0
      }
    })
  )

  // Fetch featured attractions (marked as featured in the database)
  const { data: featuredExps } = await supabase
    .from('tourism_experiences')
    .select(`
      id,
      slug,
      name,
      description,
      price_from,
      rating,
      review_count,
      duration,
      difficulty_level,
      tourism_category_id,
      tourism_categories(name),
      tourism_photos(image_url, is_primary)
    `)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(6)

  const transformedFeatured = (featuredExps || []).map((exp) => {
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
      rating: exp.rating as number,
      review_count: exp.review_count as number,
      duration: exp.duration as string | null,
      price_from: exp.price_from as number,
      category_name: category?.name || 'Experience',
      difficulty_level: exp.difficulty_level as string | null
    }
  })

  return (
    <KioskHomePage
      experiences={transformedExperiences}
      categories={categoriesWithCounts}
      featuredAttractions={transformedFeatured}
    />
  )
}
