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
        rating,
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
    location: experience.location,
    duration: experience.duration,
    difficulty_level: experience.difficulty_level,
    max_group_size: experience.max_group_size,
    min_age: experience.min_age,
    price_from: experience.price_from,
    rating: experience.rating,
    review_count: experience.review_count,
    whatsapp_number: experience.whatsapp_number,
    phone: experience.phone,
    languages_offered: experience.languages_offered,
    what_to_bring: experience.what_to_bring,
    accessibility_info: experience.accessibility_info,
    safety_information: experience.safety_information,
    included_items: experience.included_items,
    excluded_items: experience.excluded_items,
    tourism_photos: experience.tourism_photos || [],
    tourism_reviews: (experience.tourism_reviews || []).slice(0, 5) // Limit to 5 reviews
  }

  return <KioskExperiencePage experience={transformedExperience} />
}
