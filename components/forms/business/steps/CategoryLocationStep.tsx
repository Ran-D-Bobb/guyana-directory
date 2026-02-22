'use client'

import { Select, SelectOption } from '@/components/forms/inputs/Select'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

interface CategoryLocationStepProps {
  data: {
    category_id: string
    region_id: string
    location: LocationData | null
    tag_ids?: string[]
  }
  onChange: (data: Partial<CategoryLocationStepProps['data']>) => void
  errors: Record<string, string>
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
  tags?: Array<{ id: string; name: string; slug: string; category_id: string }>
}

export function CategoryLocationStep({
  data,
  onChange,
  errors,
  categories,
  regions,
  tags = [],
}: CategoryLocationStepProps) {
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }))

  const regionOptions: SelectOption[] = regions.map(reg => ({
    value: reg.id,
    label: reg.name,
  }))

  // Filter tags for the selected category
  const filteredTags = data.category_id
    ? tags.filter(tag => tag.category_id === data.category_id)
    : []

  const selectedTagIds = data.tag_ids || []

  const toggleTag = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]
    onChange({ tag_ids: newTagIds })
  }

  const handleCategoryChange = (value: string) => {
    // Clear tags when category changes since they're category-specific
    onChange({ category_id: value, tag_ids: [] })
  }

  return (
    <div className="space-y-5">
      <Select
        label="Business Category"
        name="category_id"
        value={data.category_id}
        onChange={handleCategoryChange}
        options={categoryOptions}
        placeholder="Select a category"
        helperText="Choose the category that best describes your business"
        required
      />

      {/* Tags - shown after category selection */}
      {filteredTags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tags <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500">Select tags that describe your business</p>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-[hsl(var(--jungle-500))] text-white shadow-sm shadow-[hsl(var(--jungle-500))]/20'
                    : 'bg-[hsl(var(--jungle-50))] text-[hsl(var(--jungle-700))] hover:bg-[hsl(var(--jungle-100))] border border-[hsl(var(--border))]'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
