'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Type, FileText, Percent } from 'lucide-react'

interface BusinessEventCreateFormProps {
  business: {
    id: string
    name: string
  }
  eventTypes: Array<{
    id: string
    name: string
    icon: string | null
  }>
}

export function BusinessEventCreateForm({ business, eventTypes }: BusinessEventCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    const eventTypeId = formData.get('event_type_id') as string
    const discountAmount = formData.get('discount_amount') as string

    // Validate required fields
    if (!title || !description || !startDate || !startTime || !endDate || !endTime || !eventTypeId) {
      setError('Please fill in all required fields')
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

    // Insert business event
    const { error: insertError } = await supabase
      .from('business_events')
      .insert({
        title,
        slug,
        description,
        start_date: startDateTime,
        end_date: endDateTime,
        event_type_id: eventTypeId,
        business_id: business.id,
        discount_amount: discountAmount ? parseInt(discountAmount) : null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating business event:', insertError)
      setError('Failed to create event. Please try again.')
      setIsSubmitting(false)
      return
    }

    // Redirect to business events page
    router.push('/dashboard/my-business/events')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <span className="font-semibold">Business:</span> {business.name}
        </p>
        <p className="text-xs text-purple-600 mt-1">
          This event will be associated with your business
        </p>
      </div>

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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="e.g., Weekend Flash Sale - 50% Off"
          />
        </div>
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="event_type_id" className="block text-sm font-medium text-gray-700 mb-2">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          id="event_type_id"
          name="event_type_id"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select an event type</option>
          {eventTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            placeholder="Describe your promotional offer, terms & conditions, what's included, etc."
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Maximum 2000 characters</p>
      </div>

      {/* Discount Amount */}
      <div>
        <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-2">
          Discount Percentage (Optional)
        </label>
        <div className="relative">
          <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="number"
            id="discount_amount"
            name="discount_amount"
            min="0"
            max="100"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., 25 for 25% off"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Enter a number between 0-100 if this is a discount offer
        </p>
      </div>

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

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
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
