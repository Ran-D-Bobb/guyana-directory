'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Type, FileText, Building2, MessageCircle } from 'lucide-react'
import { EventPhotoUpload } from './EventPhotoUpload'

interface EventEditFormProps {
  event: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    location: string | null
    category_id: string
    business_id: string | null
    whatsapp_number: string | null
    email: string | null
    image_url: string | null
  }
  eventCategories: Array<{
    id: string
    name: string
    icon: string
  }>
  userBusinesses: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function EventEditForm({ event, eventCategories, userBusinesses }: EventEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse start and end dates
  const startDateTime = new Date(event.start_date)
  const endDateTime = new Date(event.end_date)

  const startDate = startDateTime.toISOString().split('T')[0]
  const startTime = startDateTime.toTimeString().slice(0, 5)
  const endDate = endDateTime.toISOString().split('T')[0]
  const endTime = endDateTime.toTimeString().slice(0, 5)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDateValue = formData.get('start_date') as string
    const startTimeValue = formData.get('start_time') as string
    const endDateValue = formData.get('end_date') as string
    const endTimeValue = formData.get('end_time') as string
    const location = formData.get('location') as string
    const categoryId = formData.get('category_id') as string
    const businessId = formData.get('business_id') as string
    const whatsappNumber = formData.get('whatsapp_number') as string
    const email = formData.get('email') as string

    // Validate required fields
    if (!title || !description || !startDateValue || !startTimeValue || !endDateValue || !endTimeValue || !categoryId) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    // Validate at least one contact method
    if (!whatsappNumber && !email) {
      setError('Please provide at least one contact method (WhatsApp or email)')
      setIsSubmitting(false)
      return
    }

    // Combine date and time
    const startDateTime = `${startDateValue}T${startTimeValue}`
    const endDateTime = `${endDateValue}T${endTimeValue}`

    // Validate end date is after start date
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('End date must be after start date')
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    // Update event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description,
        start_date: startDateTime,
        end_date: endDateTime,
        location: location || null,
        category_id: categoryId,
        business_id: businessId || null,
        whatsapp_number: whatsappNumber || null,
        email: email || null,
      })
      .eq('id', event.id)

    if (updateError) {
      console.error('Error updating event:', updateError)
      setError('Failed to update event. Please try again.')
      setIsSubmitting(false)
      return
    }

    // Redirect to my events page
    router.push('/dashboard/my-events')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Event Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={event.title}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Community Art Workshop"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={event.category_id}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          {eventCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
            name="description"
            required
            rows={6}
            maxLength={2000}
            defaultValue={event.description}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your event, what to expect, who should attend, etc."
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Maximum 2000 characters</p>
      </div>

      {/* Event Image */}
      <EventPhotoUpload
        eventId={event.id}
        currentImageUrl={event.image_url}
        disabled={isSubmitting}
      />

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="start_date"
              name="start_date"
              required
              defaultValue={startDate}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            required
            defaultValue={startTime}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* End Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              id="end_date"
              name="end_date"
              required
              defaultValue={endDate}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="end_time"
            name="end_time"
            required
            defaultValue={endTime}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            id="location"
            name="location"
            maxLength={200}
            defaultValue={event.location || ''}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Georgetown City Hall or Online"
          />
        </div>
      </div>

      {/* Optional Business Association */}
      {userBusinesses.length > 0 && (
        <div>
          <label htmlFor="business_id" className="block text-sm font-medium text-gray-700 mb-2">
            Associated Business (Optional)
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              id="business_id"
              name="business_id"
              defaultValue={event.business_id || ''}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">None - Community Event</option>
              {userBusinesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Link this event to one of your businesses if applicable
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide at least one way for people to contact you about this event
        </p>

        <div className="space-y-4">
          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="whatsapp_number"
                name="whatsapp_number"
                defaultValue={event.whatsapp_number || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., +5926001234"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Include country code (e.g., +592 for Guyana)
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={event.email || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., contact@example.com"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
