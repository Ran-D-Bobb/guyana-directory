'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Type, FileText, Building2, MessageCircle } from 'lucide-react'
import { EventPhotoUpload } from './EventPhotoUpload'

interface EventCreateFormProps {
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

export function EventCreateForm({ eventCategories, userBusinesses }: EventCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('start_date') as string
    const startTime = formData.get('start_time') as string
    const endDate = formData.get('end_date') as string
    const endTime = formData.get('end_time') as string
    const location = formData.get('location') as string
    const categoryId = formData.get('category_id') as string
    const businessId = formData.get('business_id') as string
    const whatsappNumber = formData.get('whatsapp_number') as string
    const email = formData.get('email') as string

    // Validate required fields
    if (!title || !description || !startDate || !startTime || !endDate || !endTime || !categoryId) {
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
    const startDateTime = `${startDate}T${startTime}`
    const endDateTime = `${endDate}T${endTime}`

    // Validate end date is after start date
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('End date must be after start date')
      setIsSubmitting(false)
      return
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create an event')
      setIsSubmitting(false)
      return
    }

    // Insert event
    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        title,
        slug,
        description,
        start_date: startDateTime,
        end_date: endDateTime,
        location: location || null,
        category_id: categoryId,
        business_id: businessId || null,
        user_id: user.id,
        whatsapp_number: whatsappNumber || null,
        email: email || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating event:', insertError)
      setError('Failed to create event. Please try again.')
      setIsSubmitting(false)
      return
    }

    // Upload image if one was selected
    if (imageFile && data) {
      try {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${data.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event-photos')
          .getPublicUrl(filePath)

        // Update event with image URL
        await supabase
          .from('events')
          .update({ image_url: publicUrl })
          .eq('id', data.id)
      } catch (err) {
        console.error('Error uploading image:', err)
        // Don't fail the whole operation if image upload fails
      }
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your event, what to expect, who should attend, etc."
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Maximum 2000 characters</p>
      </div>

      {/* Event Image */}
      <EventPhotoUpload
        onImageFileChange={setImageFile}
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
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
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
