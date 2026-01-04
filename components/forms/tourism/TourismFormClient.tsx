'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TourismFormSteps } from './TourismFormSteps'
import { toast } from 'sonner'

interface TourismFormData {
  name: string
  description: string
  tourism_category_id: string
  experience_type: 'tour' | 'activity' | 'attraction' | 'accommodation' | 'service'
  duration: string
  difficulty_level: 'easy' | 'moderate' | 'challenging' | 'extreme'
  group_size_min: number | null
  group_size_max: number | null
  age_requirement: string
  region_id: string
  location_details: string
  meeting_point: string
  phone: string
  email: string
  website: string
  operator_name: string
  operator_license: string
  price_from: number | null
  price_currency: string
  price_notes: string
  includes: string
  excludes: string
  best_season: string
  booking_required: boolean
  advance_booking_days: number | null
  accessibility_info: string
  safety_requirements: string
  what_to_bring: string[]
  languages: string[]
  tags: string[]
}

interface TourismFormClientProps {
  userId: string
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
}

export function TourismFormClient({
  userId,
  categories,
  regions,
}: TourismFormClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: TourismFormData) => {
    try {
      // Create slug from name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists
      const { data: existingExperience } = await supabase
        .from('tourism_experiences')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingExperience) {
        throw new Error('An experience with this name already exists. Please choose a different name.')
      }

      // Insert the experience
      const { data: experience, error: createError } = await supabase
        .from('tourism_experiences')
        .insert({
          operator_id: userId,
          name: data.name.trim(),
          slug: slug,
          description: data.description.trim(),
          tourism_category_id: data.tourism_category_id || null,
          experience_type: data.experience_type,
          duration: data.duration.trim() || null,
          difficulty_level: data.difficulty_level,
          group_size_min: data.group_size_min,
          group_size_max: data.group_size_max,
          age_requirement: data.age_requirement.trim() || null,
          region_id: data.region_id || null,
          location_details: data.location_details.trim() || null,
          meeting_point: data.meeting_point.trim() || null,
          phone: data.phone.trim() || null,
          email: data.email.trim() || null,
          website: data.website.trim() || null,
          operator_name: data.operator_name.trim() || null,
          operator_license: data.operator_license.trim() || null,
          price_from: data.price_from,
          price_currency: data.price_currency,
          price_notes: data.price_notes.trim() || null,
          includes: data.includes.trim() || null,
          excludes: data.excludes.trim() || null,
          best_season: data.best_season.trim() || null,
          booking_required: data.booking_required,
          advance_booking_days: data.advance_booking_days,
          accessibility_info: data.accessibility_info.trim() || null,
          safety_requirements: data.safety_requirements.trim() || null,
          what_to_bring: data.what_to_bring.length > 0 ? data.what_to_bring : null,
          languages: data.languages.length > 0 ? data.languages : ['English'],
          tags: data.tags.length > 0 ? data.tags : null,
          is_verified: false,
          is_featured: false,
          is_tourism_authority_approved: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating tourism experience:', createError)
        throw new Error(`Failed to create experience: ${createError.message}`)
      }

      // Show success message
      toast.success('Tourism experience created successfully!', {
        description: 'You can now add photos and manage your listing from the dashboard.',
      })

      // Redirect to photos page
      router.push(`/dashboard/my-tourism/${experience.id}/photos`)
      router.refresh()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
      throw error
    }
  }

  return (
    <TourismFormSteps
      userId={userId}
      categories={categories}
      regions={regions}
      onSubmit={handleSubmit}
    />
  )
}
