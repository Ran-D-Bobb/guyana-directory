'use client'

import { Calendar, Clock } from 'lucide-react'

interface DateTimeStepProps {
  formData: {
    start_date?: string
    start_time?: string
    end_date?: string
    end_time?: string
  }
  updateFormData: (data: any) => void
  errors: Record<string, string>
}

export function DateTimeStep({
  formData,
  updateFormData,
  errors,
}: DateTimeStepProps) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Start Date & Time */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Start Date & Time</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                id="start_date"
                value={formData.start_date || ''}
                onChange={(e) => updateFormData({ start_date: e.target.value })}
                min={today}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
              />
            </div>
            {errors.start_date && (
              <p className="text-sm text-red-600 mt-1">{errors.start_date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="time"
                id="start_time"
                value={formData.start_time || ''}
                onChange={(e) => updateFormData({ start_time: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.start_time ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
              />
            </div>
            {errors.start_time && (
              <p className="text-sm text-red-600 mt-1">{errors.start_time}</p>
            )}
          </div>
        </div>
      </div>

      {/* End Date & Time */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">End Date & Time</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                id="end_date"
                value={formData.end_date || ''}
                onChange={(e) => updateFormData({ end_date: e.target.value })}
                min={formData.start_date || today}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
              />
            </div>
            {errors.end_date && (
              <p className="text-sm text-red-600 mt-1">{errors.end_date}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="time"
                id="end_time"
                value={formData.end_time || ''}
                onChange={(e) => updateFormData({ end_time: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
              />
            </div>
            {errors.end_time && (
              <p className="text-sm text-red-600 mt-1">{errors.end_time}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {formData.start_date && formData.start_time && formData.end_date && formData.end_time && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-2">Event Schedule Preview</p>
          <div className="text-sm text-purple-800 space-y-1">
            <p>
              <strong>Starts:</strong> {new Date(`${formData.start_date}T${formData.start_time}`).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
            <p>
              <strong>Ends:</strong> {new Date(`${formData.end_date}T${formData.end_time}`).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Make sure to set the correct date and time. Attendees rely on this information to plan their schedules.
        </p>
      </div>
    </div>
  )
}
