'use client'

import { NumberStepper } from '@/components/forms/inputs/NumberStepper'
import { TextInput } from '@/components/forms/inputs/TextInput'

interface PropertyDetailsStepProps {
  formData: {
    bedrooms: number
    bathrooms: number
    max_guests: number
    square_feet: number | null
  }
  errors: Record<string, string>
  onChange: (field: string, value: number | null) => void
}

export default function PropertyDetailsStep({
  formData,
  errors,
  onChange
}: PropertyDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Property Details
        </h2>
        <p className="text-base text-gray-600">
          Tell us about the size and capacity of your property
        </p>
      </div>

      {/* Bedrooms */}
      <NumberStepper
        label="Bedrooms"
        name="bedrooms"
        value={formData.bedrooms}
        onChange={(value) => onChange('bedrooms', value)}
        min={0}
        max={10}
        step={1}
        required
        error={errors.bedrooms}
      />

      {/* Bathrooms */}
      <NumberStepper
        label="Bathrooms"
        name="bathrooms"
        value={formData.bathrooms}
        onChange={(value) => onChange('bathrooms', value)}
        min={0.5}
        max={10}
        step={0.5}
        required
        error={errors.bathrooms}
      />

      {/* Max Guests */}
      <NumberStepper
        label="Maximum Guests"
        name="max_guests"
        value={formData.max_guests}
        onChange={(value) => onChange('max_guests', value)}
        min={1}
        max={50}
        step={1}
        required
        error={errors.max_guests}
      />

      {/* Square Feet - Optional */}
      <TextInput
        label="Square Feet"
        name="square_feet"
        type="text"
        value={formData.square_feet?.toString() || ''}
        onChange={(value) => onChange('square_feet', value ? parseInt(value) : null)}
        placeholder="e.g., 1200"
        error={errors.square_feet}
        helperText="Optional, but helps renters understand the size"
      />

      {/* Info box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-emerald-800">
            <p className="font-medium mb-1">Quick tip</p>
            <p>Accurate details help renters find exactly what they&apos;re looking for and reduce unnecessary inquiries.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
