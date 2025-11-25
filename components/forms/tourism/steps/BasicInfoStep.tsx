'use client'

import { TextInput } from '@/components/forms/inputs/TextInput'
import { TextArea } from '@/components/forms/inputs/TextArea'
import { Select } from '@/components/forms/inputs/Select'

interface BasicInfoStepProps {
  formData: {
    name: string
    description: string
    tourism_category_id: string
    experience_type: 'tour' | 'activity' | 'attraction' | 'accommodation' | 'service'
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
  categories: Array<{ id: string; name: string; slug: string }>
}

const EXPERIENCE_TYPES = [
  { value: 'tour', label: 'Tour' },
  { value: 'activity', label: 'Activity' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'service', label: 'Service' },
]

export function BasicInfoStep({
  formData,
  errors,
  onChange,
  categories,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-base text-gray-600">
          Tell tourists about your experience
        </p>
      </div>

      {/* Experience Name */}
      <TextInput
        label="Experience Name"
        name="name"
        value={formData.name}
        onChange={(value) => onChange('name', value)}
        required
        error={errors.name}
        placeholder="e.g., Kaieteur Falls Day Trip"
        helperText="Give your experience a catchy, descriptive name"
        maxLength={100}
      />

      {/* Description */}
      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={(value) => onChange('description', value)}
        required
        error={errors.description}
        placeholder="Describe what tourists will see, do, and experience..."
        helperText="Highlight what makes your experience unique and exciting"
        maxLength={2000}
        rows={6}
      />

      {/* Experience Type */}
      <Select
        label="Experience Type"
        name="experience_type"
        value={formData.experience_type}
        onChange={(value) => onChange('experience_type', value)}
        options={EXPERIENCE_TYPES}
        required
        error={errors.experience_type}
        helperText="What type of tourism experience is this?"
      />

      {/* Category */}
      <Select
        label="Category"
        name="tourism_category_id"
        value={formData.tourism_category_id}
        onChange={(value) => onChange('tourism_category_id', value)}
        options={categories.map(cat => ({
          value: cat.id,
          label: cat.name,
        }))}
        placeholder="Select a category"
        helperText="Help tourists find your experience by category"
      />
    </div>
  )
}
