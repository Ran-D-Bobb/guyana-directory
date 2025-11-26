'use client'

import { TextInput } from '@/components/forms/inputs/TextInput'
import { Select } from '@/components/forms/inputs/Select'
import { NumberStepper } from '@/components/forms/inputs/NumberStepper'
import { cn } from '@/lib/utils'

interface ExperienceDetailsStepProps {
  formData: {
    duration: string
    difficulty_level: 'easy' | 'moderate' | 'challenging' | 'extreme'
    group_size_min: number | null
    group_size_max: number | null
    age_requirement: string
    best_season: string
    booking_required: boolean
    advance_booking_days: number | null
  }
  errors?: Record<string, string>
  onChange: (field: string, value: string | number | boolean | null) => void
}

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy - Suitable for all fitness levels' },
  { value: 'moderate', label: 'Moderate - Some physical activity required' },
  { value: 'challenging', label: 'Challenging - Good fitness required' },
  { value: 'extreme', label: 'Extreme - Experienced adventurers only' },
]

export function ExperienceDetailsStep({
  formData,
  onChange,
}: ExperienceDetailsStepProps) {
  return (
    <div className="space-y-5">
      {/* Duration */}
      <TextInput
        label="Duration"
        name="duration"
        value={formData.duration}
        onChange={(value) => onChange('duration', value)}
        placeholder="e.g., Full Day, 2 hours, 3 days / 2 nights"
        helperText="How long does the experience last?"
      />

      {/* Difficulty Level */}
      <Select
        label="Difficulty Level"
        name="difficulty_level"
        value={formData.difficulty_level}
        onChange={(value) => onChange('difficulty_level', value)}
        options={DIFFICULTY_LEVELS}
        helperText="What fitness level is required?"
      />

      {/* Group Size */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-900">
          Group Size
        </label>
        <div className="grid grid-cols-2 gap-4">
          <NumberStepper
            label="Minimum"
            name="group_size_min"
            value={formData.group_size_min || 1}
            onChange={(value) => onChange('group_size_min', value)}
            min={1}
            max={100}
          />
          <NumberStepper
            label="Maximum"
            name="group_size_max"
            value={formData.group_size_max || 10}
            onChange={(value) => onChange('group_size_max', value)}
            min={1}
            max={100}
          />
        </div>
        <p className="text-sm text-gray-500">
          What&apos;s the min/max number of people per group?
        </p>
      </div>

      {/* Age Requirement */}
      <TextInput
        label="Age Requirement"
        name="age_requirement"
        value={formData.age_requirement}
        onChange={(value) => onChange('age_requirement', value)}
        placeholder="e.g., All ages, 18+, 12+"
        helperText="Any age restrictions for this experience?"
      />

      {/* Best Season */}
      <TextInput
        label="Best Season"
        name="best_season"
        value={formData.best_season}
        onChange={(value) => onChange('best_season', value)}
        placeholder="e.g., Dry season (Sept-April), Year-round"
        helperText="When is the best time to visit?"
      />

      {/* Booking Required */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Booking Required?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange('booking_required', true)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all',
              formData.booking_required
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            )}
          >
            Yes, advance booking required
          </button>
          <button
            type="button"
            onClick={() => onChange('booking_required', false)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all',
              !formData.booking_required
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            )}
          >
            No, walk-ins welcome
          </button>
        </div>
      </div>

      {/* Advance Booking Days */}
      {formData.booking_required && (
        <NumberStepper
          label="Advance Booking (days)"
          name="advance_booking_days"
          value={formData.advance_booking_days || 1}
          onChange={(value) => onChange('advance_booking_days', value)}
          min={0}
          max={90}
          helperText="How many days in advance should tourists book?"
        />
      )}
    </div>
  )
}
