'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

interface AdminBusinessCreateFormProps {
  categories: Array<{ id: string; name: string; slug: string }>
  regions: Array<{ id: string; name: string; slug: string }>
  users: Array<{ id: string; name: string | null; email: string | null }>
}

export function AdminBusinessCreateForm({
  categories,
  regions,
  users,
}: AdminBusinessCreateFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    category_id: '',
    region_id: '',
    owner_id: '',
    is_verified: false,
    is_featured: false,
  })

  const [location, setLocation] = useState<LocationData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
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

      // Create slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingBusiness) {
        setError('A business with this name already exists. Please choose a different name.')
        setIsSubmitting(false)
        return
      }

      const { error: createError } = await supabase.from('businesses').insert({
        owner_id: formData.owner_id || null,
        name: formData.name.trim(),
        slug: slug,
        description: formData.description.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        address: formData.address.trim() || null,
        category_id: formData.category_id || null,
        region_id: formData.region_id || null,
        is_verified: formData.is_verified,
        is_featured: formData.is_featured,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        formatted_address: location?.formatted_address || null,
      })

      if (createError) {
        console.error('Error creating business:', createError)
        setError(`Failed to create business: ${createError.message}`)
      } else {
        // Redirect to admin businesses page
        router.push('/admin/businesses')
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Admin Settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h3>

        {/* Owner Selection */}
        <div className="mb-4">
          <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-2">
            Business Owner (optional)
          </label>
          <select
            id="owner_id"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
          >
            <option value="">No owner (admin-managed)</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || 'Unknown'} {user.email ? `(${user.email})` : ''}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to create an admin-managed business with no owner
          </p>
        </div>

        {/* Verified Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Mark as Verified</span>
          </label>
        </div>

        {/* Featured Checkbox */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
          </label>
        </div>
      </div>

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
          placeholder="Enter business name"
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
          placeholder="Describe the business, products, or services..."
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
            placeholder="contact@business.com"
          />
        </div>

        {/* Website */}
        <div className="mb-4">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            placeholder="https://www.business.com"
          />
        </div>

        {/* Address */}
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
            placeholder="123 Main Street, Georgetown, Guyana"
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
          Add GPS coordinates so customers can find this business easily. Choose from three methods: use current location, search for an address, or tap on the map.
        </p>

        <LocationInput
          label="Business Location"
          name="location"
          value={location}
          onChange={setLocation}
          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
          helperText="This helps customers navigate to the business"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Creating...' : 'Create Business'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/businesses')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
