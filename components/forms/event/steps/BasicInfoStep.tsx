'use client'

import { Type, FileText, Tag } from 'lucide-react'

interface BasicInfoStepProps {
  formData: {
    title?: string
    description?: string
    category_id?: string
  }
  updateFormData: (data: Partial<BasicInfoStepProps['formData']>) => void
  errors: Record<string, string>
  eventCategories: Array<{
    id: string
    name: string
    icon: string
  }>
}

export function BasicInfoStep({
  formData,
  updateFormData,
  errors,
  eventCategories,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Event Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Event Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => updateFormData({ title: e.target.value })}
            maxLength={200}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'title-error' : 'title-helper'}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.title ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base min-h-[48px] md:min-h-[44px]`}
            placeholder="e.g., Community Art Workshop"
          />
        </div>
        {errors.title && (
          <p id="title-error" className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
        <p id="title-helper" className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {formData.title?.length || 0}/200 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => updateFormData({ category_id: e.target.value })}
            aria-invalid={errors.category_id ? true : undefined}
            aria-describedby={errors.category_id ? 'category-error' : 'category-helper'}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.category_id ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base appearance-none min-h-[48px] md:min-h-[44px]`}
          >
            <option value="">Select a category</option>
            {eventCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {errors.category_id && (
          <p id="category-error" className="text-sm text-red-600 mt-1">{errors.category_id}</p>
        )}
        <p id="category-helper" className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Choose the category that best describes your event
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={8}
            maxLength={2000}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'description-error' : 'description-helper'}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.description ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base resize-none`}
            placeholder="Describe your event, what to expect, who should attend, etc."
          />
        </div>
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
        <p id="description-helper" className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {formData.description?.length || 0}/2000 characters
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm text-emerald-800">
          <strong>Tip:</strong> A clear, detailed description helps people understand what your
          event is about and encourages more attendance.
        </p>
      </div>
    </div>
  )
}
