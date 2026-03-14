'use client'

import { MapPin, Building2, Info, Globe } from 'lucide-react'
import { LocationInput, type LocationData } from '@/components/forms/inputs/LocationInput'

interface LocationStepProps {
  formData: {
    location?: string
    locationData?: LocationData | null
    business_id?: string
    is_online?: boolean
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
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''
  const isOnline = formData.is_online || false

  return (
    <div className="space-y-6">
      {/* Optional Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">This step is optional</p>
          <p className="text-sm text-blue-800">
            You can skip this step if you prefer, or provide location details to help attendees find your event.
          </p>
        </div>
      </div>

      {/* Online Event Toggle */}
      <div className="flex items-center gap-3 p-4 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]">
        <input
          type="checkbox"
          id="is_online"
          checked={isOnline}
          onChange={(e) => {
            updateFormData({
              is_online: e.target.checked,
              locationData: e.target.checked ? null : formData.locationData,
              location: e.target.checked ? 'Online Event' : ''
            })
          }}
          className="w-5 h-5 rounded border-[hsl(var(--border))] text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="is_online" className="flex items-center gap-2 cursor-pointer">
          <Globe className="w-5 h-5 text-emerald-600" />
          <span className="font-medium text-[hsl(var(--foreground))]">This is an online/virtual event</span>
        </label>
      </div>

      {/* Location Input with Map - only show for in-person events */}
      {!isOnline && (
        <LocationInput
          label="Event Location"
          name="locationData"
          value={formData.locationData || null}
          onChange={(value) => {
            updateFormData({
              locationData: value,
              location: value?.formatted_address || ''
            })
          }}
          error={errors.locationData}
          helperText="Search for the venue address. You can drag the marker to adjust the exact location."
          apiKey={apiKey}
        />
      )}

      {/* Fallback text input for location name */}
      {!isOnline && !formData.locationData && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Or enter location manually
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              id="location"
              value={formData.location || ''}
              onChange={(e) => updateFormData({ location: e.target.value })}
              maxLength={200}
              aria-invalid={errors.location ? true : undefined}
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.location ? 'border-red-500' : 'border-[hsl(var(--border))]'
              } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base min-h-[48px] md:min-h-[44px]`}
              placeholder="e.g., Georgetown City Hall"
            />
          </div>
          {errors.location && (
            <p className="text-sm text-red-600 mt-1">{errors.location}</p>
          )}
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            If you can&apos;t find the address above, enter a venue name or description
          </p>
        </div>
      )}

      {/* Online event info */}
      {isOnline && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Online Event:</span> You can share the meeting link or platform details in the contact section or event description.
          </p>
        </div>
      )}

      {/* Business Association (if user has businesses) */}
      {userBusinesses.length > 0 && (
        <div>
          <label htmlFor="business_id" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Associated Business
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <select
              id="business_id"
              value={formData.business_id || ''}
              onChange={(e) => updateFormData({ business_id: e.target.value })}
              aria-invalid={errors.business_id ? true : undefined}
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.business_id ? 'border-red-500' : 'border-[hsl(var(--border))]'
              } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base appearance-none min-h-[48px] md:min-h-[44px]`}
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
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Link this event to one of your businesses if applicable.
          </p>
        </div>
      )}

      {userBusinesses.length === 0 && (
        <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            You don&apos;t have any businesses yet. If you&apos;d like to link events to a business, you can create one from your dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
