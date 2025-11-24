'use client'

/**
 * Example Business Location Form
 *
 * This is a complete working example showing how to use the LocationInput component
 * in a real form. You can use this as a reference for implementing location inputs
 * in your own forms.
 */

import { useState } from 'react'
import { LocationInput, LocationData } from './inputs/LocationInput'
import { TextInput } from './inputs/TextInput'
import { Button } from '@/components/ui/button'

interface BusinessFormData {
  businessName: string
  location: LocationData | null
}

interface BusinessLocationFormProps {
  onSubmit: (data: BusinessFormData) => void | Promise<void>
  initialData?: Partial<BusinessFormData>
  apiKey: string
}

export function BusinessLocationForm({
  onSubmit,
  initialData,
  apiKey,
}: BusinessLocationFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: initialData?.businessName || '',
    location: initialData?.location || null,
  })

  const [errors, setErrors] = useState<{
    businessName?: string
    location?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    // Validate business name
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    } else if (formData.businessName.length < 3) {
      newErrors.businessName = 'Business name must be at least 3 characters'
    }

    // Validate location
    if (!formData.location) {
      newErrors.location = 'Please select a location for your business'
    } else {
      // Optional: Validate coordinates are within Guyana
      const { latitude, longitude } = formData.location
      if (
        latitude < 1.0 ||
        latitude > 8.6 ||
        longitude < -61.4 ||
        longitude > -56.5
      ) {
        newErrors.location =
          'Location must be within Guyana. Please select a valid address.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationChange = (value: LocationData | null) => {
    setFormData({ ...formData, location: value })

    // Clear location error when a valid location is selected
    if (value && errors.location) {
      setErrors({ ...errors, location: undefined })
    }
  }

  const handleBusinessNameChange = (value: string) => {
    setFormData({ ...formData, businessName: value })

    // Clear business name error when user starts typing
    if (value && errors.businessName) {
      setErrors({ ...errors, businessName: undefined })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Location
        </h2>
        <p className="text-sm text-gray-600">
          Help customers find your business by providing your exact location
        </p>
      </div>

      <TextInput
        label="Business Name"
        name="businessName"
        value={formData.businessName}
        onChange={handleBusinessNameChange}
        required
        error={errors.businessName}
        placeholder="e.g., Joe's Restaurant"
        helperText="Enter your business or organization name"
      />

      <LocationInput
        label="Business Address"
        name="location"
        value={formData.location}
        onChange={handleLocationChange}
        apiKey={apiKey}
        required
        error={errors.location}
        helperText="Start typing your address to see suggestions. You can adjust the marker on the map for precise location."
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 md:flex-initial"
        >
          {isSubmitting ? 'Saving...' : 'Save Location'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              businessName: '',
              location: null,
            })
            setErrors({})
          }}
          disabled={isSubmitting}
          className="flex-1 md:flex-initial"
        >
          Clear
        </Button>
      </div>

      {/* Preview of data that will be saved (for demo purposes) */}
      {formData.location && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Data to be saved:
          </p>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(
              {
                businessName: formData.businessName,
                latitude: formData.location.latitude,
                longitude: formData.location.longitude,
                formatted_address: formData.location.formatted_address,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </form>
  )
}

// Example usage in a page:
/*
'use client'

import { BusinessLocationForm } from '@/components/forms/BusinessLocationForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AddBusinessPage() {
  const supabase = createClientComponentClient()

  const handleSubmit = async (data) => {
    const { error } = await supabase
      .from('businesses')
      .insert({
        name: data.businessName,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        formatted_address: data.location.formatted_address,
        // ... other required fields
      })

    if (error) {
      console.error('Error saving business:', error)
      return
    }

    // Success! Redirect or show success message
    console.log('Business saved successfully!')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <BusinessLocationForm
        onSubmit={handleSubmit}
        apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
      />
    </div>
  )
}
*/
