'use client'

import { TextInput } from '@/components/forms/inputs/TextInput'
import { TextArea } from '@/components/forms/inputs/TextArea'

interface BasicInfoStepProps {
  data: {
    name: string
    description: string
  }
  onChange: (data: Partial<BasicInfoStepProps['data']>) => void
  errors: Record<string, string>
}

export function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  return (
    <div className="space-y-5">
      <TextInput
        label="Business Name"
        name="name"
        value={data.name}
        onChange={value => onChange({ name: value })}
        required
        error={errors.name}
        placeholder="Enter your business name"
        maxLength={100}
        helperText="This will be the main name displayed to customers"
      />

      <TextArea
        label="Business Description"
        name="description"
        value={data.description}
        onChange={value => onChange({ description: value })}
        placeholder="Describe your business, products, or services..."
        maxLength={500}
        rows={5}
        helperText="Tell customers what makes your business special"
        showCharCount
      />
    </div>
  )
}
