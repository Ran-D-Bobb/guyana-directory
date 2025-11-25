'use client'

import { Compass, MapPin, DollarSign, Phone, Info, Clock } from 'lucide-react'
import { MultiStepFormWrapper } from '@/components/forms/multistep/MultiStepFormWrapper'
import { FormStepConfig } from '@/hooks/useMultiStepForm'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { ExperienceDetailsStep } from './steps/ExperienceDetailsStep'
import { LocationStep } from './steps/LocationStep'
import { PricingStep } from './steps/PricingStep'
import { ContactStep } from './steps/ContactStep'
import { AdditionalInfoStep } from './steps/AdditionalInfoStep'

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
  whatsapp_number: string
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

interface TourismFormStepsProps {
  userId: string
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
  onSubmit: (data: TourismFormData) => Promise<void>
  initialData?: Partial<TourismFormData>
}

const INITIAL_DATA: TourismFormData = {
  name: '',
  description: '',
  tourism_category_id: '',
  experience_type: 'tour',
  duration: '',
  difficulty_level: 'easy',
  group_size_min: null,
  group_size_max: null,
  age_requirement: '',
  region_id: '',
  location_details: '',
  meeting_point: '',
  whatsapp_number: '',
  phone: '',
  email: '',
  website: '',
  operator_name: '',
  operator_license: '',
  price_from: null,
  price_currency: 'GYD',
  price_notes: '',
  includes: '',
  excludes: '',
  best_season: '',
  booking_required: true,
  advance_booking_days: null,
  accessibility_info: '',
  safety_requirements: '',
  what_to_bring: [],
  languages: [],
  tags: [],
}

export function TourismFormSteps({
  userId,
  categories,
  regions,
  onSubmit,
  initialData,
}: TourismFormStepsProps) {
  // Define form steps
  const steps: FormStepConfig[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us about your tourism experience',
      icon: <Compass className="w-5 h-5" />,
      validate: (data: Partial<TourismFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.name?.trim()) {
          errors.name = 'Experience name is required'
        } else if (data.name.trim().length < 3) {
          errors.name = 'Name must be at least 3 characters'
        }

        if (!data.description?.trim()) {
          errors.description = 'Description is required'
        } else if (data.description.trim().length < 20) {
          errors.description = 'Description must be at least 20 characters'
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'experience-details',
      title: 'Experience Details',
      description: 'Duration, difficulty, and group information',
      icon: <Clock className="w-5 h-5" />,
      canSkip: true,
      validate: () => null,
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Where does the experience take place?',
      icon: <MapPin className="w-5 h-5" />,
      validate: (data: Partial<TourismFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.region_id?.trim()) {
          errors.region_id = 'Region is required'
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Set your pricing and what\'s included',
      icon: <DollarSign className="w-5 h-5" />,
      canSkip: true,
      validate: () => null,
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'How can tourists reach you?',
      icon: <Phone className="w-5 h-5" />,
      validate: (data: Partial<TourismFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.whatsapp_number?.trim()) {
          errors.whatsapp_number = 'WhatsApp number is required'
        } else if (data.whatsapp_number.trim().length < 10) {
          errors.whatsapp_number = 'Please enter a valid WhatsApp number with country code'
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = 'Please enter a valid email address'
        }

        if (data.website && !/^https?:\/\/.+/.test(data.website)) {
          errors.website = 'Website must start with http:// or https://'
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'additional-info',
      title: 'Additional Info',
      description: 'Safety, accessibility, and tags',
      icon: <Info className="w-5 h-5" />,
      canSkip: true,
      validate: () => null,
    },
  ]

  // Render step content based on step ID
  const renderStep = (
    stepId: string,
    formData: Partial<TourismFormData>,
    updateFormData: (data: Partial<TourismFormData>) => void,
    errors: Record<string, string>
  ) => {
    const handleChange = (field: string, value: string | number | boolean | string[] | null) => {
      updateFormData({ [field]: value } as Partial<TourismFormData>)
    }

    switch (stepId) {
      case 'basic-info':
        return (
          <BasicInfoStep
            formData={{
              name: formData.name || '',
              description: formData.description || '',
              tourism_category_id: formData.tourism_category_id || '',
              experience_type: formData.experience_type || 'tour',
            }}
            errors={errors}
            onChange={handleChange}
            categories={categories}
          />
        )

      case 'experience-details':
        return (
          <ExperienceDetailsStep
            formData={{
              duration: formData.duration || '',
              difficulty_level: formData.difficulty_level || 'easy',
              group_size_min: formData.group_size_min ?? null,
              group_size_max: formData.group_size_max ?? null,
              age_requirement: formData.age_requirement || '',
              best_season: formData.best_season || '',
              booking_required: formData.booking_required ?? true,
              advance_booking_days: formData.advance_booking_days ?? null,
            }}
            errors={errors}
            onChange={handleChange}
          />
        )

      case 'location':
        return (
          <LocationStep
            formData={{
              region_id: formData.region_id || '',
              location_details: formData.location_details || '',
              meeting_point: formData.meeting_point || '',
            }}
            errors={errors}
            onChange={handleChange}
            regions={regions}
          />
        )

      case 'pricing':
        return (
          <PricingStep
            formData={{
              price_from: formData.price_from ?? null,
              price_currency: formData.price_currency || 'GYD',
              price_notes: formData.price_notes || '',
              includes: formData.includes || '',
              excludes: formData.excludes || '',
            }}
            errors={errors}
            onChange={handleChange}
          />
        )

      case 'contact':
        return (
          <ContactStep
            formData={{
              whatsapp_number: formData.whatsapp_number || '',
              phone: formData.phone || '',
              email: formData.email || '',
              website: formData.website || '',
              operator_name: formData.operator_name || '',
              operator_license: formData.operator_license || '',
            }}
            errors={errors}
            onChange={handleChange}
          />
        )

      case 'additional-info':
        return (
          <AdditionalInfoStep
            formData={{
              accessibility_info: formData.accessibility_info || '',
              safety_requirements: formData.safety_requirements || '',
              what_to_bring: formData.what_to_bring || [],
              languages: formData.languages || [],
              tags: formData.tags || [],
            }}
            errors={errors}
            onChange={handleChange}
          />
        )

      default:
        return null
    }
  }

  return (
    <MultiStepFormWrapper<TourismFormData>
      steps={steps}
      initialData={initialData || INITIAL_DATA}
      onSubmit={onSubmit}
      formType="tourism"
      userId={userId}
      renderStep={renderStep}
    />
  )
}
