'use client'

import { Store, MapPin, Phone } from 'lucide-react'
import { MultiStepFormWrapper } from '@/components/forms/multistep/MultiStepFormWrapper'
import { FormStepConfig } from '@/hooks/useMultiStepForm'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { CategoryLocationStep } from './steps/CategoryLocationStep'
import { ContactInfoStep } from './steps/ContactInfoStep'
import { LocationData } from '@/components/forms/inputs/LocationInput'

interface BusinessFormData {
  name: string
  description: string
  category_id: string
  region_id: string
  location: LocationData | null
  whatsapp_number: string
  phone: string
  email: string
  website: string
}

interface BusinessFormStepsProps {
  userId: string
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
  onSubmit: (data: BusinessFormData) => Promise<void>
  initialData?: Partial<BusinessFormData>
}

export function BusinessFormSteps({
  userId,
  categories,
  regions,
  onSubmit,
  initialData,
}: BusinessFormStepsProps) {
  // Define form steps
  const steps: FormStepConfig[] = [
    {
      id: 'basic-info',
      title: 'Business Basics',
      description: 'Let\'s start with your business name and description',
      icon: <Store className="w-5 h-5" />,
      validate: (data: Partial<BusinessFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.name?.trim()) {
          errors.name = 'Business name is required'
        } else if (data.name.trim().length < 3) {
          errors.name = 'Business name must be at least 3 characters'
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'category-location',
      title: 'Category & Location',
      description: 'Help customers find you by category and region',
      icon: <MapPin className="w-5 h-5" />,
      validate: (data: Partial<BusinessFormData>) => {
        const errors: Record<string, string> = {}

        if (!data.category_id?.trim()) {
          errors.category_id = 'Business category is required'
        }

        if (!data.region_id?.trim()) {
          errors.region_id = 'Region is required'
        }

        if (!data.location) {
          errors.location = 'Business location is required'
        } else {
          // Validate coordinates are within Guyana
          const { latitude, longitude } = data.location
          if (
            latitude < 1.0 ||
            latitude > 8.6 ||
            longitude < -61.4 ||
            longitude > -56.5
          ) {
            errors.location = 'Location must be within Guyana. Please select a valid address.'
          }
        }

        return Object.keys(errors).length > 0 ? errors : null
      },
    },
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'How can customers reach you?',
      icon: <Phone className="w-5 h-5" />,
      validate: (data: Partial<BusinessFormData>) => {
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
  ]

  // Render step content based on step ID
  const renderStep = (
    stepId: string,
    formData: Partial<BusinessFormData>,
    updateFormData: (data: Partial<BusinessFormData>) => void,
    errors: Record<string, string>
  ) => {
    switch (stepId) {
      case 'basic-info':
        return (
          <BasicInfoStep
            data={{
              name: formData.name || '',
              description: formData.description || '',
            }}
            onChange={updateFormData}
            errors={errors}
          />
        )

      case 'category-location':
        return (
          <CategoryLocationStep
            data={{
              category_id: formData.category_id || '',
              region_id: formData.region_id || '',
              location: formData.location || null,
            }}
            onChange={updateFormData}
            errors={errors}
            categories={categories}
            regions={regions}
          />
        )

      case 'contact-info':
        return (
          <ContactInfoStep
            data={{
              whatsapp_number: formData.whatsapp_number || '',
              phone: formData.phone || '',
              email: formData.email || '',
              website: formData.website || '',
            }}
            onChange={updateFormData}
            errors={errors}
          />
        )

      default:
        return null
    }
  }

  return (
    <MultiStepFormWrapper<BusinessFormData>
      steps={steps}
      initialData={initialData}
      onSubmit={onSubmit}
      formType="business"
      userId={userId}
      renderStep={renderStep}
    />
  )
}
