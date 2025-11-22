import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import KioskExperiencePage from './KioskExperiencePage'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: experience } = await supabase
    .from('tourism_experiences')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: experience ? `${experience.name} - Tourism Kiosk` : 'Tourism Kiosk',
    description: experience ? `Learn more about ${experience.name}` : 'Tourism experience details'
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch experience with all related data
  const { data: experience, error } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories(name),
      regions(name),
      tourism_photos(id, image_url, is_primary, photo_type),
      tourism_reviews(
        id,
        overall_rating,
        comment,
        created_at,
        profiles(name)
      )
    `)
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (error || !experience) {
    console.error('Error fetching experience:', error)
    notFound()
  }

  // Transform data for the component
  const transformedExperience = {
    id: experience.id,
    slug: experience.slug,
    name: experience.name,
    description: experience.description,
    category_name: experience.tourism_categories?.name || 'Experience',
    region_name: experience.regions?.name || null,
    location: experience.location_details,
    duration: experience.duration,
    difficulty_level: experience.difficulty_level,
    max_group_size: experience.group_size_max,
    min_age: experience.age_requirement,
    price_from: experience.price_from,
    rating: experience.rating,
    review_count: experience.review_count,
    whatsapp_number: experience.whatsapp_number,
    phone: experience.phone,
    languages_offered: experience.languages,
    what_to_bring: experience.what_to_bring,
    accessibility_info: experience.accessibility_info,
    safety_information: experience.safety_requirements,
    included_items: experience.includes,
    excluded_items: experience.excludes,
    tourism_photos: (experience.tourism_photos || []).map(photo => ({
      id: photo.id,
      image_url: photo.image_url,
      is_primary: photo.is_primary ?? false
    })),
    tourism_reviews: ((experience.tourism_reviews || []) as Array<{id: string; overall_rating: number; comment: string | null; created_at: string; profiles: {name: string} | null}>).map(r => ({...r, rating: r.overall_rating})).slice(0, 5) // Limit to 5 reviews and map overall_rating to rating
  }

  // Fetch featured experiences (marked as featured in the database, excluding current)
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
    .neq('id', experience.id)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(6)

  const featuredExperiences = (featuredExps || []).map((exp) => {
    const photos = exp.tourism_photos as Array<{image_url: string; is_primary: boolean}> | null
    const primaryPhoto = photos?.find(p => p.is_primary)
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
      category_name: category?.name || 'Experience'
    }
  })

  return <KioskExperiencePage experience={transformedExperience} featuredExperiences={featuredExperiences} />
}
