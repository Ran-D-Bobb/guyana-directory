import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import KioskCategoryPage from './KioskCategoryPage'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('tourism_categories')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: category ? `${category.name} - Tourism Kiosk` : 'Tourism Kiosk',
    description: `Explore ${category?.name || 'tourism'} experiences in Guyana`
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('tourism_categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch experiences in this category
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
      location_details,
      group_size_max,
      regions(name),
      tourism_photos(image_url, is_primary)
    `)
    .eq('tourism_category_id', category.id)
    .eq('is_approved', true)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching experiences:', error)
    return <div>Error loading experiences</div>
  }

  if (!experiences || experiences.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-12">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-black text-white">No Experiences Available</h1>
          <p className="text-2xl text-white/70">
            There are no approved experiences in the {category.name} category yet.
          </p>
          <a
            href="/kiosk"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-8 py-4 rounded-full transition-all hover:scale-105"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  // Transform data for the component
  const transformedExperiences = experiences.map((exp: any) => {
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
      group_size_max: exp.group_size_max,
      price_from: exp.price_from,
      difficulty_level: exp.difficulty_level,
      location_details: exp.location_details,
      region_name: exp.regions?.name || null
    }
  })

  // Fetch featured experiences (excluding current category to show variety)
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
      tourism_categories(name),
      tourism_photos(image_url, is_primary)
    `)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(6)

  const featuredExperiences = (featuredExps || []).map((exp: any) => {
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
      category_name: exp.tourism_categories?.name || 'Experience'
    }
  })

  return (
    <KioskCategoryPage
      experiences={transformedExperiences}
      categoryName={category.name}
      featuredExperiences={featuredExperiences}
    />
  )
}
