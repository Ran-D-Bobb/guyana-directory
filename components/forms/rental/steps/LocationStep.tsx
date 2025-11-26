'use client'

import { Select } from '@/components/forms/inputs/Select'
import { TextInput } from '@/components/forms/inputs/TextInput'

interface LocationStepProps {
  formData: {
    region_id: string
    address: string
    location_details: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
  regions: Array<{ id: string; name: string; slug: string }>
}

export default function LocationStep({
  formData,
  errors,
  onChange,
  regions
}: LocationStepProps) {
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

      {/* Address */}
      <TextInput
        label="Street Address"
        name="address"
        value={formData.address}
        onChange={(value) => onChange('address', value)}
        placeholder="e.g., 123 Main Street, Georgetown"
        error={errors.address}
        helperText="Optional, but helps renters know the exact location"
      />

      {/* Location Details */}
      <TextInput
        label="Location Details"
        name="location_details"
        value={formData.location_details}
        onChange={(value) => onChange('location_details', value)}
        placeholder="e.g., Near Stabroek Market, next to Republic Bank"
        error={errors.location_details}
        helperText="Nearby landmarks or helpful directions"
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
            <p>Your exact address will only be shared with confirmed renters. The general area will be shown on the listing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
