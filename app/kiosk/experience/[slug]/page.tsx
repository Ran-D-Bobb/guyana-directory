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

  // Transform to simplified KioskExperience shape
  const photos = experience.tourism_photos as Array<{image_url: string; is_primary: boolean}> | null
  const primaryPhoto = photos?.find(p => p.is_primary)
  const anyPhoto = photos?.[0]

  const kioskExperience = {
    id: transformedExperience.id,
    slug: transformedExperience.slug,
    name: transformedExperience.name,
    description: transformedExperience.description,
    image_url: (primaryPhoto?.image_url || anyPhoto?.image_url || null) as string | null,
    rating: transformedExperience.rating || 0,
    review_count: transformedExperience.review_count || 0,
    duration: transformedExperience.duration,
    price_from: transformedExperience.price_from || 0,
    category_name: transformedExperience.category_name,
    difficulty_level: transformedExperience.difficulty_level,
  }

  return <KioskExperiencePage experience={kioskExperience} />
}
