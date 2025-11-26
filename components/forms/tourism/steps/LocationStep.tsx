'use client'

import { TextInput } from '@/components/forms/inputs/TextInput'
import { TextArea } from '@/components/forms/inputs/TextArea'
import { Select } from '@/components/forms/inputs/Select'

interface LocationStepProps {
  formData: {
    region_id: string
    location_details: string
    meeting_point: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
  regions: Array<{ id: string; name: string; slug: string }>
}

export function LocationStep({
  formData,
  errors,
  onChange,
  regions,
}: LocationStepProps) {
  return (
    <div className="space-y-5">
      {/* Region */}
      <Select
        label="Region"
        name="region_id"
        value={formData.region_id}
        onChange={(value) => onChange('region_id', value)}
        options={regions.map(region => ({
          value: region.id,
          label: region.name,
        }))}
        required
        error={errors.region_id}
        placeholder="Select a region"
        helperText="Which region of Guyana is this experience in?"
      />

      {/* Location Details */}
      <TextArea
        label="Location Details"
        name="location_details"
        value={formData.location_details}
        onChange={(value) => onChange('location_details', value)}
        placeholder="Describe the specific location, landmarks, how to get there..."
        helperText="Help tourists understand exactly where the experience takes place"
        rows={3}
        maxLength={500}
      />

      {/* Meeting Point */}
      <TextInput
        label="Meeting Point"
        name="meeting_point"
        value={formData.meeting_point}
        onChange={(value) => onChange('meeting_point', value)}
        placeholder="e.g., Hotel pickup, Ogle Airport, Georgetown seawall"
        helperText="Where should tourists meet you or your guide?"
      />

      {/* Location Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Location Tip</p>
            <p>Clear location details help tourists plan their trip. Include information about transportation options, parking, or airport proximity if relevant.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
