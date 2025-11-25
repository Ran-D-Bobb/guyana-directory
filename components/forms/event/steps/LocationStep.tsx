'use client'

import { MapPin, Building2, Info } from 'lucide-react'

interface LocationStepProps {
  formData: {
    location?: string
    business_id?: string
  }
  updateFormData: (data: Partial<LocationStepProps['formData']>) => void
  errors: Record<string, string>
  userBusinesses: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function LocationStep({
  formData,
  updateFormData,
  errors,
  userBusinesses,
}: LocationStepProps) {
  return (
    <div className="space-y-6">
      {/* Optional Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">This step is optional</p>
          <p className="text-sm text-blue-800">
            You can skip this step if you prefer, or provide location details to help attendees find your event.
          </p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Event Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            id="location"
            value={formData.location || ''}
            onChange={(e) => updateFormData({ location: e.target.value })}
            maxLength={200}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
            placeholder="e.g., Georgetown City Hall or Online"
          />
        </div>
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">{errors.location}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Provide a specific address, venue name, or indicate if it&apos;s an online event
        </p>
      </div>

      {/* Business Association (if user has businesses) */}
      {userBusinesses.length > 0 && (
        <div>
          <label htmlFor="business_id" className="block text-sm font-medium text-gray-700 mb-2">
            Associated Business
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              id="business_id"
              value={formData.business_id || ''}
              onChange={(e) => updateFormData({ business_id: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.business_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base appearance-none bg-white`}
            >
              <option value="">None - Community Event</option>
              {userBusinesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          {errors.business_id && (
            <p className="text-sm text-red-600 mt-1">{errors.business_id}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Link this event to one of your businesses if applicable. This will display the event on your business profile.
          </p>
        </div>
      )}

      {userBusinesses.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            You don&apos;t have any businesses yet. If you&apos;d like to link events to a business, you can create one from your dashboard.
          </p>
        </div>
      )}

      {/* Examples */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm font-medium text-purple-900 mb-2">Location Examples</p>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Georgetown City Hall, Main Street</li>
          <li>National Park, East Coast Demerara</li>
          <li>Virtual Event (Zoom Link in Contact)</li>
          <li>Cultural Center, Linden</li>
          <li>To Be Announced</li>
        </ul>
      </div>
    </div>
  )
}
