import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KioskHomePage from './KioskHomePage'

export const metadata = {
  title: 'Tourism Kiosk - Discover Guyana',
  description: 'Interactive tourism kiosk showcasing the best experiences in Guyana'
}

export default async function KioskPage() {
  const supabase = await createClient()

  // Fetch featured/approved tourism experiences for the attraction loop
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
    .eq('is_approved', true)
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
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-8 py-4 rounded-full transition-all hover:scale-105"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  // Transform data for the component
  const transformedExperiences = (experiences || []).map((exp: any) => {
    const primaryPhoto = exp.tourism_photos?.find((p: any) => p.is_primary)
    const anyPhoto = exp.tourism_photos?.[0]

    return {
      id: exp.id,
      slug: exp.slug,
      name: exp.name,
      description: exp.description,
      image_url: primaryPhoto?.image_url || anyPhoto?.image_url || null,
      rating: exp.rating,
      review_count: exp.review_count,
      duration: exp.duration,
      price_from: exp.price_from,
      category_name: exp.tourism_categories?.name || 'Experience',
      difficulty_level: exp.difficulty_level
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
    (categories || []).map(async (category: any) => {
      const { count } = await supabase
        .from('tourism_experiences')
        .select('*', { count: 'exact', head: true })
        .eq('tourism_category_id', category.id)
        .eq('is_approved', true)

      return {
        ...category,
        experience_count: count || 0
      }
    })
  )

  return (
    <KioskHomePage
      experiences={transformedExperiences}
      categories={categoriesWithCounts}
    />
  )
}
