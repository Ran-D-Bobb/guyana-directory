import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RentalDetailClient } from './RentalDetailClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  const { data: rental } = await supabase
    .from('rentals')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!rental) {
    return {
      title: 'Property Not Found - Guyana Directory',
    }
  }

  return {
    title: `${rental.name} - Rentals - Guyana Directory`,
    description: rental.description || `Rent ${rental.name} in Guyana`,
  }
}

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // Get rental details
  const { data: rental, error } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug, icon),
      regions(name, slug),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (error || !rental) {
    notFound()
  }

  // Get reviews with ratings breakdown
  const { data: reviews } = await supabase
    .from('rental_reviews')
    .select(`*`)
    .eq('rental_id', rental.id)
    .order('created_at', { ascending: false })

  // Get similar properties (same property type, different property)
  const { data: similarRentals } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name, slug),
      regions(name),
      rental_photos(image_url, is_primary, display_order)
    `)
    .eq('property_type', rental.property_type)
    .eq('is_approved', true)
    .neq('id', rental.id)
    .limit(4)

  // Sort photos (primary first, then by display_order)
  interface RentalPhoto {
    image_url: string
    is_primary: boolean | null
    display_order: number | null
  }

  const photos = rental.rental_photos?.sort((a: RentalPhoto, b: RentalPhoto) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  }) || []

  // Default image if no photos
  const defaultImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'

  return (
    <RentalDetailClient
      rental={rental}
      photos={photos}
      defaultImage={defaultImage}
      reviews={reviews || []}
      similarRentals={similarRentals || []}
    />
  )
}
