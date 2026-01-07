'use client'

import { Building2, Home, Palmtree, DoorOpen, Briefcase, Store, Users, TreePine } from 'lucide-react'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { TextArea } from '@/components/forms/inputs/TextArea'

interface PropertyTypeStepProps {
  formData: {
    property_type: string
    name: string
    description: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: Building2, description: 'Multi-unit residential building' },
  { value: 'house', label: 'House', icon: Home, description: 'Standalone residential home' },
  { value: 'vacation_home', label: 'Vacation Home', icon: Palmtree, description: 'Short-term holiday rental' },
  { value: 'room', label: 'Room Rental', icon: DoorOpen, description: 'Single room in shared property' },
  { value: 'office', label: 'Office Space', icon: Briefcase, description: 'Commercial office rental' },
  { value: 'commercial', label: 'Commercial Property', icon: Store, description: 'Retail or business space' },
  { value: 'shared_housing', label: 'Shared Housing', icon: Users, description: 'Co-living arrangement' },
  { value: 'land', label: 'Land', icon: TreePine, description: 'Undeveloped or agricultural land' }
]

export default function PropertyTypeStep({
  formData,
  errors,
  onChange
}: PropertyTypeStepProps) {
  return (
    <div className="space-y-5">
      {/* Property Type Selection - Card Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Property Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PROPERTY_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.property_type === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onChange('property_type', type.value)}
                className={`
                  relative p-4 rounded-xl border bg-white text-left transition-all
                  ${isSelected
                    ? 'border-gray-900 ring-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-start gap-2">
                  <Icon
                    className={`w-6 h-6 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}
                  />
                  <div>
                    <div className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {errors.property_type && (
          <p className="text-sm text-red-500 mt-2">{errors.property_type}</p>
        )}
      </div>

      {/* Property Name */}
      <TextInput
        label="Property Name"
        name="name"
        value={formData.name}
        onChange={(value) => onChange('name', value)}
        placeholder="e.g., Modern 2BR Apartment in Georgetown"
        required
        error={errors.name}
        helperText="Give your property a clear, descriptive name"
      />

      {/* Description */}
      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={(value) => onChange('description', value)}
        placeholder="Describe your property, highlight key features, nearby attractions..."
        required
        error={errors.description}
        rows={5}
        maxLength={500}
        showCharCount
        helperText="Help potential renters understand what makes your property special"
      />
    </div>
  )
}
