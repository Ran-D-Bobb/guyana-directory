'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

interface BusinessHours {
  [day: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

interface BusinessEditFormProps {
  business: {
    id: string
    name: string
    slug: string
    description: string | null
    phone: string | null
    email: string | null
    website: string | null
    address: string | null
    category_id: string | null
    region_id: string | null
    hours: BusinessHours | null
    latitude: number | null
    longitude: number | null
    formatted_address: string | null
  }
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
  tags?: Array<{ id: string; name: string; slug: string; category_id: string }>
  currentTagIds?: string[]
}

export function BusinessEditForm({ business, categories, regions, tags = [], currentTagIds = [] }: BusinessEditFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    address: business.address || '',
    category_id: business.category_id || '',
    region_id: business.region_id || '',
  })

  // Initialize location from existing business data
  const [location, setLocation] = useState<LocationData | null>(
    business.latitude && business.longitude
      ? {
          latitude: business.latitude,
          longitude: business.longitude,
          formatted_address: business.formatted_address || business.address || '',
        }
      : null
  )

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTagIds)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Filter tags for the selected category
  const filteredTags = formData.category_id
    ? tags.filter(tag => tag.category_id === formData.category_id)
    : []

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear tags when category changes
    if (name === 'category_id') {
      setSelectedTagIds([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Business name is required')
        setIsSubmitting(false)
        return
      }

      // At least one contact method required
      if (!formData.phone.trim() && !formData.email.trim()) {
        setError('Please provide at least one contact method (phone or email)')
        setIsSubmitting(false)
        return
      }

      // Only regenerate slug if name changed
      const slug = formData.name !== business.name
        ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : business.slug

      // Check slug uniqueness if it changed
      if (slug !== business.slug) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', slug)
          .neq('id', business.id)
          .single()

        if (existingBusiness) {
          setError('A business with this name already exists. Please choose a different name.')
          setIsSubmitting(false)
          return
        }
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: formData.name.trim(),
          slug: slug,
          description: formData.description.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          website: formData.website.trim() || null,
          address: formData.address.trim() || null,
          category_id: formData.category_id || null,
          region_id: formData.region_id || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          formatted_address: location?.formatted_address || null,
        })
        .eq('id', business.id)

      if (updateError) {
        console.error('Error updating business:', updateError)
        setError(`Failed to update business: ${updateError.message}`)
      } else {
        // Sync business tags: delete existing and insert new
        await supabase
          .from('business_tags')
          .delete()
          .eq('business_id', business.id)

        if (selectedTagIds.length > 0) {
          const { error: tagError } = await supabase
            .from('business_tags')
            .insert(
              selectedTagIds.map(tagId => ({
                business_id: business.id,
                tag_id: tagId,
              }))
            )
          if (tagError) {
            console.error('Error syncing tags:', tagError)
          }
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/my-business')
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-lg p-6 text-center">
        <p className="text-emerald-700 font-medium">
          Business updated successfully! Redirecting...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Business Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Business Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
          placeholder="Describe your business..."
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      {filteredTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Select tags that describe your business</p>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region */}
      <div>
        <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          id="region_id"
          name="region_id"
          value={formData.region_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
        >
          <option value="">Select a location</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <p className="text-sm text-gray-600 mb-4">Please provide at least one contact method (phone or email)</p>

        {/* Phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            placeholder="+592-123-4567"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            placeholder="contact@yourbusiness.com"
          />
        </div>

        {/* Website */}
        <div className="mb-4">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            placeholder="www.yourbusiness.com"
          />
        </div>

        {/* Address - Text input for legacy compatibility */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address (Text)
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            placeholder="123 Main Street, Georgetown"
          />
          <p className="mt-1 text-xs text-gray-500">
            This is the display address. Use the location picker below for precise GPS coordinates.
          </p>
        </div>
      </div>

      {/* Geolocation Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Precise Location</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add GPS coordinates so customers can find you easily. Choose from three methods: use your current location, search for an address, or tap on the map.
        </p>

        <LocationInput
          label="Business Location"
          name="location"
          value={location}
          onChange={setLocation}
          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
          helperText="This helps customers navigate to your business"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/my-business')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
