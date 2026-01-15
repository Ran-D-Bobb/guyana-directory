'use client'

import { Select } from '@/components/forms/inputs/Select'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { LocationInput, type LocationData } from '@/components/forms/inputs/LocationInput'

interface LocationStepProps {
  formData: {
    region_id: string
    address: string
    location_details: string
    location?: LocationData | null
  }
  errors: Record<string, string>
  onChange: (field: string, value: string | LocationData | null) => void
  regions: Array<{ id: string; name: string; slug: string }>
}

export default function LocationStep({
  formData,
  errors,
  onChange,
  regions
}: LocationStepProps) {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''

  return (
    <div className="space-y-5">
      {/* Region Selection */}
      <Select
        label="Region"
        name="region_id"
        value={formData.region_id}
        onChange={(value) => onChange('region_id', value)}
        options={regions.map(region => ({ value: region.id, label: region.name }))}
        required
        error={errors.region_id}
      />

      {/* Location Input with Map - three input methods: GPS, search, tap on map */}
      <LocationInput
        label="Property Location"
        name="location"
        value={formData.location || null}
        onChange={(value) => onChange('location', value)}
        required
        error={errors.location}
        apiKey={apiKey}
      />

      {/* Location Details */}
      <TextInput
        label="Additional Location Details"
        name="location_details"
        value={formData.location_details}
        onChange={(value) => onChange('location_details', value)}
        placeholder="e.g., Near Stabroek Market, next to Republic Bank"
        error={errors.location_details}
        helperText="Nearby landmarks or helpful directions for renters (optional)"
      />

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Privacy tip</p>
            <p>Your exact coordinates help renters find your property. The precise location will only be shared with confirmed renters.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
