'use client'

import { TextArea } from '@/components/forms/inputs/TextArea'
import { TagInput } from '@/components/forms/inputs/TagInput'

interface AdditionalInfoStepProps {
  formData: {
    accessibility_info: string
    safety_requirements: string
    what_to_bring: string[]
    languages: string[]
    tags: string[]
  }
  errors?: Record<string, string>
  onChange: (field: string, value: string | string[]) => void
}

const SUGGESTED_LANGUAGES = [
  'English',
  'Portuguese',
  'Spanish',
  'Dutch',
  'French',
  'Hindi',
]

const SUGGESTED_TAGS = [
  'family-friendly',
  'romantic',
  'adventure',
  'photography',
  'eco-tourism',
  'wildlife',
  'cultural',
  'hiking',
  'water-sports',
  'birdwatching',
]

const SUGGESTED_ITEMS = [
  'Water',
  'Sunscreen',
  'Camera',
  'Comfortable shoes',
  'Hat',
  'Rain jacket',
  'Insect repellent',
  'Snacks',
]

export function AdditionalInfoStep({
  formData,
  onChange,
}: AdditionalInfoStepProps) {
  return (
    <div className="space-y-5">
      {/* Accessibility Info */}
      <TextArea
        label="Accessibility & Fitness Requirements"
        name="accessibility_info"
        value={formData.accessibility_info}
        onChange={(value) => onChange('accessibility_info', value)}
        placeholder="e.g., Wheelchair accessible, Moderate fitness level required, Not suitable for people with back problems..."
        helperText="Any physical requirements or accessibility information"
        rows={3}
        maxLength={500}
      />

      {/* Safety Requirements */}
      <TextArea
        label="Safety Requirements"
        name="safety_requirements"
        value={formData.safety_requirements}
        onChange={(value) => onChange('safety_requirements', value)}
        placeholder="e.g., Life jackets provided, Safety briefing before departure, First aid trained guides..."
        helperText="Important safety information for tourists"
        rows={3}
        maxLength={500}
      />

      {/* What to Bring */}
      <TagInput
        label="What to Bring"
        name="what_to_bring"
        value={formData.what_to_bring}
        onChange={(value) => onChange('what_to_bring', value)}
        suggestions={SUGGESTED_ITEMS}
        placeholder="Add item..."
        helperText="Items tourists should bring for this experience"
      />

      {/* Languages */}
      <TagInput
        label="Languages Offered"
        name="languages"
        value={formData.languages}
        onChange={(value) => onChange('languages', value)}
        suggestions={SUGGESTED_LANGUAGES}
        placeholder="Add language..."
        helperText="What languages can guides/staff communicate in?"
      />

      {/* Tags */}
      <TagInput
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={(value) => onChange('tags', value)}
        suggestions={SUGGESTED_TAGS}
        placeholder="Add tag..."
        helperText="Add searchable tags to help tourists find your experience"
      />

      {/* Completion Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Almost Done!</p>
            <p>After submitting, you&apos;ll be able to add photos of your experience. Great photos can significantly increase tourist interest and bookings!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
