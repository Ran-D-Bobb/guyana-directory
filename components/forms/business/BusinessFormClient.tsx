'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BusinessFormSteps } from './BusinessFormSteps'
import { toast } from 'sonner'
import { LocationData } from '@/components/forms/inputs/LocationInput'

interface BusinessFormData {
  name: string
  description: string
  category_id: string
  region_id: string
  location: LocationData | null
  phone: string
  email: string
  website: string
}

interface BusinessFormClientProps {
  userId: string
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
}

export function BusinessFormClient({
  userId,
  categories,
  regions,
}: BusinessFormClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: BusinessFormData) => {
    try {
      // Create slug from name
      const slug = (data.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingBusiness) {
        throw new Error('A business with this name already exists. Please choose a different name.')
      }

      // Insert the business
      const { error: createError } = await supabase
        .from('businesses')
        .insert({
          owner_id: userId,
          name: (data.name || '').trim(),
          slug: slug,
          description: (data.description || '').trim() || null,
          phone: (data.phone || '').trim() || null,
          email: (data.email || '').trim() || null,
          website: (data.website || '').trim() || null,
          // Location data
          latitude: data.location?.latitude || null,
          longitude: data.location?.longitude || null,
          formatted_address: data.location?.formatted_address || null,
          category_id: data.category_id || null,
          region_id: data.region_id || null,
          is_verified: false,
          is_featured: false,
        })
        .select()

      if (createError) {
        console.error('Error creating business:', createError)
        throw new Error(`Failed to create business: ${createError.message}`)
      }

      // Show success message
      toast.success('Business listing created successfully!', {
        description: 'You can now add photos and manage your listing from the dashboard.',
      })

      // Redirect to dashboard
      router.push('/dashboard/my-business')
      router.refresh()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
      throw error // Re-throw to keep form in submitting state if needed
    }
  }

  return (
    <BusinessFormSteps
      userId={userId}
      categories={categories}
      regions={regions}
      onSubmit={handleSubmit}
    />
  )
}
