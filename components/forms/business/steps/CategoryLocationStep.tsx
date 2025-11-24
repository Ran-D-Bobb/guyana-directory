'use client'

import { Select, SelectOption } from '@/components/forms/inputs/Select'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

interface CategoryLocationStepProps {
  data: {
    category_id: string
    region_id: string
    location: LocationData | null
  }
  onChange: (data: Partial<CategoryLocationStepProps['data']>) => void
  errors: Record<string, string>
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
}

export function CategoryLocationStep({
  data,
  onChange,
  errors,
  categories,
  regions,
}: CategoryLocationStepProps) {
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }))

  const regionOptions: SelectOption[] = regions.map(reg => ({
    value: reg.id,
    label: reg.name,
  }))

  return (
    <div className="space-y-5">
      <Select
        label="Business Category"
        name="category_id"
        value={data.category_id}
        onChange={value => onChange({ category_id: value })}
        options={categoryOptions}
        placeholder="Select a category"
        helperText="Choose the category that best describes your business"
        required
      />

      <Select
        label="Region"
        name="region_id"
        value={data.region_id}
        onChange={value => onChange({ region_id: value })}
        options={regionOptions}
        placeholder="Select a region"
        helperText="Where is your business located?"
        required
      />

      <LocationInput
        label="Business Address"
        name="location"
        value={data.location}
        onChange={value => onChange({ location: value })}
        apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
        required
        error={errors.location}
        helperText="Start typing your address to see suggestions. You can adjust the marker on the map for precise location."
      />
    </div>
  )
}
