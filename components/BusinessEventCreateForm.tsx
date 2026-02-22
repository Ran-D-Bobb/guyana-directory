'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Type, FileText, Percent, Upload, X, Image as ImageIcon, Repeat, CalendarDays } from 'lucide-react'
import Image from 'next/image'

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<string>('')
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const objectUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setImageFile(file)
    setImagePreview(url)
    setError(null)
  }

  const removeImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
    const recurrenceEndDate = formData.get('recurrence_end_date') as string

    // Validate required fields
    if (!title || !description || !startDate || !startTime || !endDate || !endTime || !eventTypeId) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    // Validate recurring fields
    if (isRecurring && !recurrencePattern) {
      setError('Please select a recurrence pattern')
      setIsSubmitting(false)
      return
    }
    if (isRecurring && recurrencePattern === 'weekly' && recurrenceDays.length === 0) {
      setError('Please select at least one day for weekly recurrence')
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

    // Upload image if selected
    let imageUrl: string | null = null
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `business-events/${business.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        setError('Failed to upload image. Please try again.')
        setIsSubmitting(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-photos')
        .getPublicUrl(filePath)

      imageUrl = publicUrl
    }

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
        image_url: imageUrl,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_days: isRecurring && recurrencePattern === 'weekly' ? recurrenceDays : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
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
    setIsSubmitting(false)
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
          This promotion will be associated with your business
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Promotion Title <span className="text-red-500">*</span>
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
          Promotion Type <span className="text-red-500">*</span>
        </label>
        <select
          id="event_type_id"
          name="event_type_id"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select a promotion type</option>
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

      {/* Event Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Promotion Image (Optional)
        </label>
        {imagePreview ? (
          <div className="relative">
            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden relative">
              <Image src={imagePreview} alt="Event preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors block">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                {isSubmitting ? (
                  <Upload className="w-6 h-6 text-purple-600 animate-bounce" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">Click to upload promotion image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </label>
        )}
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

      {/* Event Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Event Frequency <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setIsRecurring(false)
              setRecurrencePattern('')
              setRecurrenceDays([])
            }}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              !isRecurring
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <CalendarDays className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="font-medium text-sm">One-time</p>
              <p className="text-xs opacity-75">Happens once</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsRecurring(true)}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              isRecurring
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Repeat className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="font-medium text-sm">Recurring</p>
              <p className="text-xs opacity-75">Repeats on schedule</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recurrence Settings */}
      {isRecurring && (
        <div className="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div>
            <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700 mb-2">
              Repeats <span className="text-red-500">*</span>
            </label>
            <select
              id="recurrence_pattern"
              value={recurrencePattern}
              onChange={(e) => {
                setRecurrencePattern(e.target.value)
                if (e.target.value !== 'weekly') setRecurrenceDays([])
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {recurrencePattern === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On these days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setRecurrenceDays(prev =>
                        prev.includes(index)
                          ? prev.filter(d => d !== index)
                          : [...prev, index].sort()
                      )
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      recurrenceDays.includes(index)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="recurrence_end_date" className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence End Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="recurrence_end_date"
                name="recurrence_end_date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave blank for no end date</p>
          </div>
        </div>
      )}

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            {isRecurring ? 'First Occurrence Date' : 'Start Date'} <span className="text-red-500">*</span>
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
            {isRecurring ? 'First Occurrence End Date' : 'End Date'} <span className="text-red-500">*</span>
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
          {isSubmitting ? 'Creating Promotion...' : 'Create Promotion'}
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
