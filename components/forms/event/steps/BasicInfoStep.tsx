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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Event Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => updateFormData({ title: e.target.value })}
            maxLength={200}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
            placeholder="e.g., Community Art Workshop"
          />
        </div>
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.title?.length || 0}/200 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => updateFormData({ category_id: e.target.value })}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.category_id ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base appearance-none bg-white`}
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
          <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Choose the category that best describes your event
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={8}
            maxLength={2000}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base resize-none`}
            placeholder="Describe your event, what to expect, who should attend, etc."
          />
        </div>
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.description?.length || 0}/2000 characters
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>Tip:</strong> A clear, detailed description helps people understand what your
          event is about and encourages more attendance.
        </p>
      </div>
    </div>
  )
}
