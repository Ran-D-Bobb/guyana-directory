'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, MapPin, MessageCircle } from 'lucide-react'
import type { LocationData } from '@/components/forms/inputs/LocationInput'
import { MultiStepFormWrapper } from '../multistep/MultiStepFormWrapper'
import { FormStepConfig } from '@/hooks/useMultiStepForm'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { LocationStep } from './steps/LocationStep'
import { ContactStep } from './steps/ContactStep'

interface EventFormData {
  title: string
  description: string
  category_id: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  locationData?: LocationData | null
  is_online?: boolean
  business_id?: string
  phone: string
  email: string
  image_file?: File | null
}

interface EventFormStepsProps {
  userId: string
  eventCategories: Array<{
    id: string
    name: string
    icon: string
  }>
  userBusinesses: Array<{
    id: string
    name: string
    slug: string
  }>
  initialData?: Partial<EventFormData>
  redirectPath?: string
}

export function EventFormSteps({
  userId,
  eventCategories,
  userBusinesses,
  initialData = {},
  redirectPath = '/dashboard/my-events',
}: EventFormStepsProps) {
  const router = useRouter()

  // Define form steps (4 steps for events)
  const steps: FormStepConfig[] = [
    {
      id: 'basic-info',
      title: 'Event Basics',
      description: 'Tell us about your event',
      icon: <FileText className="w-6 h-6" />,
      validate: (data: Partial<EventFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.title || data.title.trim().length < 3) {
          errors.title = 'Event title must be at least 3 characters'
        }
        if (data.title && data.title.length > 200) {
          errors.title = 'Event title must be less than 200 characters'
        }
        if (!data.description || data.description.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters'
        }
        if (data.description && data.description.length > 2000) {
          errors.description = 'Description must be less than 2000 characters'
        }
        if (!data.category_id) {
          errors.category_id = 'Please select a category'
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'datetime',
      title: 'Schedule',
      description: 'When will your event take place?',
      icon: <Calendar className="w-6 h-6" />,
      validate: (data: Partial<EventFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.start_date) {
          errors.start_date = 'Start date is required'
        }
        if (!data.start_time) {
          errors.start_time = 'Start time is required'
        }
        if (!data.end_date) {
          errors.end_date = 'End date is required'
        }
        if (!data.end_time) {
          errors.end_time = 'End time is required'
        }

        // Validate end is after start
        if (data.start_date && data.start_time && data.end_date && data.end_time) {
          const startDateTime = new Date(`${data.start_date}T${data.start_time}`)
          const endDateTime = new Date(`${data.end_date}T${data.end_time}`)

          if (endDateTime <= startDateTime) {
            errors.end_date = 'End date/time must be after start date/time'
          }

          // Check if start date is in the past
          const now = new Date()
          if (startDateTime < now) {
            errors.start_date = 'Event cannot start in the past'
          }
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'location',
      title: 'Location & Association',
      description: 'Where will your event take place?',
      icon: <MapPin className="w-6 h-6" />,
      canSkip: true, // Optional step
    },
    {
      id: 'contact',
      title: 'Contact & Photo',
      description: 'How can people reach you?',
      icon: <MessageCircle className="w-6 h-6" />,
      validate: (data: Partial<EventFormData>) => {
        const errors: Record<string, string> = {}

        // At least one contact method required
        if (!data.phone && !data.email) {
          errors.contact = 'Please provide at least one contact method (phone or email)'
        }

        // Validate email format if provided
        if (data.email && data.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(data.email)) {
            errors.email = 'Please enter a valid email address'
          }
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
  ]

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: EventFormData) => {
      const supabase = createClient()

      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36)

      // Combine date and time for start and end
      const startDateTime = `${data.start_date}T${data.start_time}`
      const endDateTime = `${data.end_date}T${data.end_time}`

      // Insert event
      const { data: eventData, error: insertError } = await supabase
        .from('events')
        .insert({
          title: data.title,
          slug,
          description: data.description,
          start_date: startDateTime,
          end_date: endDateTime,
          location: data.locationData?.formatted_address || data.location || null,
          latitude: data.locationData?.latitude || null,
          longitude: data.locationData?.longitude || null,
          category_id: data.category_id,
          business_id: data.business_id || null,
          user_id: userId,
          phone: data.phone || null,
          email: data.email || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating event:', insertError)
        throw new Error('Failed to create event. Please try again.')
      }

      // Upload image if one was selected
      if (data.image_file && eventData) {
        try {
          const fileExt = data.image_file.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `${eventData.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('event-photos')
            .upload(filePath, data.image_file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('event-photos').getPublicUrl(filePath)

          // Update event with image URL
          await supabase
            .from('events')
            .update({ image_url: publicUrl })
            .eq('id', eventData.id)
        } catch (err) {
          console.error('Error uploading image:', err)
          // Don't fail the whole operation if image upload fails
        }
      }

      // Redirect to specified path
      router.push(redirectPath)
      router.refresh()
    },
    [userId, router, redirectPath]
  )

  // Render steps
  const renderStep = useCallback(
    (stepId: string, formData: Partial<EventFormData>, updateFormData: (data: Partial<EventFormData>) => void, errors: Record<string, string>) => {
      switch (stepId) {
        case 'basic-info':
          return (
            <BasicInfoStep
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              eventCategories={eventCategories}
            />
          )
        case 'datetime':
          return (
            <DateTimeStep
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )
        case 'location':
          return (
            <LocationStep
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              userBusinesses={userBusinesses}
            />
          )
        case 'contact':
          return (
            <ContactStep
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )
        default:
          return null
      }
    },
    [eventCategories, userBusinesses]
  )

  return (
    <MultiStepFormWrapper<EventFormData>
      steps={steps}
      initialData={initialData}
      formType="event"
      userId={userId}
      onSubmit={handleSubmit}
      renderStep={renderStep}
    />
  )
}
