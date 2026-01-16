'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row']

interface TourismExperienceEditFormProps {
  experience: TourismExperience
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
}

export function TourismExperienceEditForm({ experience, categories, regions }: TourismExperienceEditFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Helper function to convert array to comma-separated string
  const arrayToString = (arr: string[] | null) => arr ? arr.join(', ') : ''

  const [formData, setFormData] = useState({
    name: experience.name || '',
    description: experience.description || '',
    tourism_category_id: experience.tourism_category_id || '',
    experience_type: experience.experience_type || 'tour',
    duration: experience.duration || '',
    difficulty_level: experience.difficulty_level || 'easy',
    group_size_min: experience.group_size_min?.toString() || '',
    group_size_max: experience.group_size_max?.toString() || '',
    age_requirement: experience.age_requirement || '',
    region_id: experience.region_id || '',
    location_details: experience.location_details || '',
    meeting_point: experience.meeting_point || '',
    phone: experience.phone || '',
    email: experience.email || '',
    website: experience.website || '',
    operator_name: experience.operator_name || '',
    operator_license: experience.operator_license || '',
    price_from: experience.price_from?.toString() || '',
    price_currency: experience.price_currency || 'GYD',
    price_notes: experience.price_notes || '',
    includes: experience.includes || '',
    excludes: experience.excludes || '',
    best_season: experience.best_season || '',
    booking_required: experience.booking_required ?? true,
    advance_booking_days: experience.advance_booking_days?.toString() || '',
    accessibility_info: experience.accessibility_info || '',
    safety_requirements: experience.safety_requirements || '',
    what_to_bring: arrayToString(experience.what_to_bring),
    languages: arrayToString(experience.languages),
    tags: arrayToString(experience.tags),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize location from existing experience data
  const [gpsLocation, setGpsLocation] = useState<LocationData | null>(
    experience.latitude && experience.longitude
      ? {
          latitude: experience.latitude,
          longitude: experience.longitude,
          formatted_address: experience.meeting_point || experience.location_details || '',
        }
      : null
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Experience name is required')
        setIsSubmitting(false)
        return
      }

      if (!formData.description.trim()) {
        setError('Description is required')
        setIsSubmitting(false)
        return
      }

      // At least one contact method required
      if (!formData.phone.trim() && !formData.email.trim()) {
        setError('Please provide at least one contact method (phone or email)')
        setIsSubmitting(false)
        return
      }

      // Create slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists (excluding current experience)
      const { data: existingExperience } = await supabase
        .from('tourism_experiences')
        .select('id')
        .eq('slug', slug)
        .neq('id', experience.id)
        .single()

      if (existingExperience) {
        setError('An experience with this name already exists. Please choose a different name.')
        setIsSubmitting(false)
        return
      }

      // Parse array fields
      const whatToBringArray = formData.what_to_bring
        ? formData.what_to_bring.split(',').map(item => item.trim()).filter(Boolean)
        : []

      const languagesArray = formData.languages
        ? formData.languages.split(',').map(item => item.trim()).filter(Boolean)
        : ['English']

      const tagsArray = formData.tags
        ? formData.tags.split(',').map(item => item.trim()).filter(Boolean)
        : []

      const { error: updateError } = await supabase
        .from('tourism_experiences')
        .update({
          name: formData.name.trim(),
          slug: slug,
          description: formData.description.trim(),
          tourism_category_id: formData.tourism_category_id || null,
          experience_type: formData.experience_type,
          duration: formData.duration.trim() || null,
          difficulty_level: formData.difficulty_level,
          group_size_min: formData.group_size_min ? parseInt(formData.group_size_min) : null,
          group_size_max: formData.group_size_max ? parseInt(formData.group_size_max) : null,
          age_requirement: formData.age_requirement.trim() || null,
          region_id: formData.region_id || null,
          location_details: formData.location_details.trim() || null,
          meeting_point: formData.meeting_point.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          website: formData.website.trim() || null,
          operator_name: formData.operator_name.trim() || null,
          operator_license: formData.operator_license.trim() || null,
          price_from: formData.price_from ? parseFloat(formData.price_from) : null,
          price_currency: formData.price_currency,
          price_notes: formData.price_notes.trim() || null,
          includes: formData.includes.trim() || null,
          excludes: formData.excludes.trim() || null,
          best_season: formData.best_season.trim() || null,
          booking_required: formData.booking_required,
          advance_booking_days: formData.advance_booking_days ? parseInt(formData.advance_booking_days) : null,
          accessibility_info: formData.accessibility_info.trim() || null,
          safety_requirements: formData.safety_requirements.trim() || null,
          what_to_bring: whatToBringArray.length > 0 ? whatToBringArray : null,
          languages: languagesArray,
          tags: tagsArray.length > 0 ? tagsArray : null,
          latitude: gpsLocation?.latitude || null,
          longitude: gpsLocation?.longitude || null,
        })
        .eq('id', experience.id)

      if (updateError) {
        console.error('Error updating tourism experience:', updateError)
        setError(`Failed to update experience: ${updateError.message}`)
      } else {
        // Redirect to dashboard
        router.push('/dashboard/my-tourism')
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Experience Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-500"
            placeholder="e.g., Kaieteur Falls Day Trip"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-500"
            placeholder="Describe the experience in detail - what tourists will see, do, and enjoy..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tourism_category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="tourism_category_id"
              name="tourism_category_id"
              value={formData.tourism_category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="experience_type" className="block text-sm font-medium text-gray-700 mb-2">
              Experience Type
            </label>
            <select
              id="experience_type"
              name="experience_type"
              value={formData.experience_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="tour">Tour</option>
              <option value="activity">Activity</option>
              <option value="attraction">Attraction</option>
              <option value="accommodation">Accommodation</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Full Day, 2 hours, 3 days / 2 nights"
            />
          </div>

          <div>
            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="group_size_min" className="block text-sm font-medium text-gray-700 mb-2">
              Min Group Size
            </label>
            <input
              type="number"
              id="group_size_min"
              name="group_size_min"
              value={formData.group_size_min}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="1"
            />
          </div>

          <div>
            <label htmlFor="group_size_max" className="block text-sm font-medium text-gray-700 mb-2">
              Max Group Size
            </label>
            <input
              type="number"
              id="group_size_max"
              name="group_size_max"
              value={formData.group_size_max}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="10"
            />
          </div>

          <div>
            <label htmlFor="age_requirement" className="block text-sm font-medium text-gray-700 mb-2">
              Age Requirement
            </label>
            <input
              type="text"
              id="age_requirement"
              name="age_requirement"
              value={formData.age_requirement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., All ages, 18+, 12+"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>

        <div>
          <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            id="region_id"
            name="region_id"
            value={formData.region_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location_details" className="block text-sm font-medium text-gray-700 mb-2">
            Location Details
          </label>
          <textarea
            id="location_details"
            name="location_details"
            value={formData.location_details}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Specific location description..."
          />
        </div>

        <div>
          <label htmlFor="meeting_point" className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Point
          </label>
          <input
            type="text"
            id="meeting_point"
            name="meeting_point"
            value={formData.meeting_point}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Where tourists should meet the guide..."
          />
        </div>

        {/* Precise GPS Location */}
        <div className="pt-4 border-t mt-4">
          <LocationInput
            label="Precise Location (GPS)"
            name="gps_location"
            value={gpsLocation}
            onChange={setGpsLocation}
            apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
            helperText="Add GPS coordinates so tourists can navigate to the experience location"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
        <p className="text-sm text-gray-600">Please provide at least one contact method (phone or email)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="+592-123-4567"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="contact@touroperator.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="https://www.yourtouroperator.com"
          />
        </div>
      </div>

      {/* Operator Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operator Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="operator_name" className="block text-sm font-medium text-gray-700 mb-2">
              Company/Operator Name
            </label>
            <input
              type="text"
              id="operator_name"
              name="operator_name"
              value={formData.operator_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Your company or guide name"
            />
          </div>

          <div>
            <label htmlFor="operator_license" className="block text-sm font-medium text-gray-700 mb-2">
              Tourism License Number
            </label>
            <input
              type="text"
              id="operator_license"
              name="operator_license"
              value={formData.operator_license}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="License number (if applicable)"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price_from" className="block text-sm font-medium text-gray-700 mb-2">
              Price From (GYD)
            </label>
            <input
              type="number"
              id="price_from"
              name="price_from"
              value={formData.price_from}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label htmlFor="price_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Price Notes
            </label>
            <input
              type="text"
              id="price_notes"
              name="price_notes"
              value={formData.price_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Per person, Per group, Varies by season"
            />
          </div>
        </div>

        <div>
          <label htmlFor="includes" className="block text-sm font-medium text-gray-700 mb-2">
            What&apos;s Included
          </label>
          <textarea
            id="includes"
            name="includes"
            value={formData.includes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Transportation, Meals, Guide, Equipment..."
          />
        </div>

        <div>
          <label htmlFor="excludes" className="block text-sm font-medium text-gray-700 mb-2">
            What&apos;s Not Included
          </label>
          <textarea
            id="excludes"
            name="excludes"
            value={formData.excludes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Personal expenses, Gratuities..."
          />
        </div>
      </div>

      {/* Availability & Booking */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Availability & Booking</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="best_season" className="block text-sm font-medium text-gray-700 mb-2">
              Best Season
            </label>
            <input
              type="text"
              id="best_season"
              name="best_season"
              value={formData.best_season}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Dry season (Sept-April), Year-round"
            />
          </div>

          <div>
            <label htmlFor="advance_booking_days" className="block text-sm font-medium text-gray-700 mb-2">
              Advance Booking (days)
            </label>
            <input
              type="number"
              id="advance_booking_days"
              name="advance_booking_days"
              value={formData.advance_booking_days}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., 2, 7, 14"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="booking_required"
            name="booking_required"
            checked={formData.booking_required}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="booking_required" className="text-sm font-medium text-gray-700">
            Booking Required
          </label>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>

        <div>
          <label htmlFor="accessibility_info" className="block text-sm font-medium text-gray-700 mb-2">
            Accessibility & Fitness Requirements
          </label>
          <textarea
            id="accessibility_info"
            name="accessibility_info"
            value={formData.accessibility_info}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Wheelchair accessible, Moderate fitness level required..."
          />
        </div>

        <div>
          <label htmlFor="safety_requirements" className="block text-sm font-medium text-gray-700 mb-2">
            Safety Requirements
          </label>
          <textarea
            id="safety_requirements"
            name="safety_requirements"
            value={formData.safety_requirements}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Life jackets provided, Safety briefing before departure..."
          />
        </div>

        <div>
          <label htmlFor="what_to_bring" className="block text-sm font-medium text-gray-700 mb-2">
            What to Bring (comma-separated)
          </label>
          <input
            type="text"
            id="what_to_bring"
            name="what_to_bring"
            value={formData.what_to_bring}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Water, Sunscreen, Camera, Comfortable shoes"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate items with commas
          </p>
        </div>

        <div>
          <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
            Languages Offered (comma-separated)
          </label>
          <input
            type="text"
            id="languages"
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="English, Portuguese, Spanish, Dutch"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate languages with commas
          </p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="family-friendly, romantic, adventure, photography, eco-tourism"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add searchable tags to help tourists find your experience
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Updating...' : 'Update Tourism Experience'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/my-tourism')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
