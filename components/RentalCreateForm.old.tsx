'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
}

interface Region {
  id: string
  name: string
  slug: string
}

interface RentalCreateFormProps {
  categories: Category[]
  regions: Region[]
  userId: string
}

// Amenities list
const AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Pool',
  'Kitchen',
  'Washer/Dryer',
  'TV',
  'Hot Water',
  'Furnished',
  'Security',
  'Generator',
  'Garden',
  'Balcony',
  'Gym',
  'Elevator',
  'Pet Friendly',
  'Wheelchair Accessible',
  'Smoke Detector',
  'Fire Extinguisher',
  'First Aid Kit'
]

// Utilities list
const UTILITIES = ['Water', 'Electricity', 'Internet', 'Gas']

// House rules list
const HOUSE_RULES = ['No Smoking', 'No Pets', 'No Parties', 'Quiet Hours']

export default function RentalCreateForm({ categories, regions, userId }: RentalCreateFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Section 1: Property Type & Basics
    property_type: '',
    category_id: '',
    name: '',
    description: '',

    // Section 2: Location
    region_id: '',
    address: '',
    location_details: '',

    // Section 3: Property Details
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 1,
    square_feet: null as number | null,

    // Section 4: Pricing
    price_per_night: null as number | null,
    price_per_week: null as number | null,
    price_per_month: 0,
    security_deposit: null as number | null,

    // Section 5: Amenities & Features
    amenities: [] as string[],
    utilities_included: [] as string[],
    house_rules: [] as string[],

    // Section 6: Contact
    whatsapp_number: '',
    phone: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Generate slug from property name with short random suffix for uniqueness
      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Add short random string instead of timestamp for cleaner URLs
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const slug = `${baseSlug}-${randomSuffix}`

      // Create rental listing
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          landlord_id: userId,
          category_id: formData.category_id,
          name: formData.name,
          slug,
          description: formData.description,
          property_type: formData.property_type,
          region_id: formData.region_id,
          address: formData.address || null,
          location_details: formData.location_details || null,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          max_guests: formData.max_guests,
          square_feet: formData.square_feet,
          price_per_night: formData.price_per_night,
          price_per_week: formData.price_per_week,
          price_per_month: formData.price_per_month,
          security_deposit: formData.security_deposit,
          amenities: formData.amenities,
          utilities_included: formData.utilities_included,
          house_rules: formData.house_rules,
          whatsapp_number: formData.whatsapp_number,
          phone: formData.phone || null,
          email: formData.email || null,
          is_approved: true // Instant publishing (no approval queue)
        })
        .select()
        .single()

      if (rentalError) throw rentalError

      // Redirect to photo upload page
      router.push(`/dashboard/my-rentals/${rental.id}/photos`)
    } catch (err: unknown) {
      console.error('Error creating rental:', err)
      setError(err instanceof Error ? err.message : 'Failed to create listing. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleCheckboxChange = (field: 'amenities' | 'utilities_included' | 'house_rules', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Section 1: Property Type & Basics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Property Type & Basics</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              required
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select property type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="vacation_home">Vacation Home</option>
              <option value="room">Room Rental</option>
              <option value="office">Office Space</option>
              <option value="commercial">Commercial Property</option>
              <option value="shared_housing">Shared Housing</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Modern 2BR Apartment in Georgetown"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description * (500 characters max)
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
              rows={4}
              placeholder="Describe your property, highlight key features..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
          </div>
        </div>
      </div>

      {/* Section 2: Location */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Location</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <select
              required
              value={formData.region_id}
              onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address (Optional)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Main Street"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Details (Optional)
            </label>
            <input
              type="text"
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              placeholder="e.g., Near Stabroek Market"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Property Details */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              required
              min="0"
              max="10"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              required
              min="0.5"
              max="10"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Guests *
            </label>
            <input
              type="number"
              required
              min="1"
              max="50"
              value={formData.max_guests}
              onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Feet (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.square_feet || ''}
              onChange={(e) => setFormData({ ...formData, square_feet: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Pricing */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Pricing (GYD)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Night (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.price_per_night || ''}
              onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="e.g., 15000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Week (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.price_per_week || ''}
              onChange={(e) => setFormData({ ...formData, price_per_week: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="e.g., 90000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Month * (Required)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price_per_month || ''}
              onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value ? parseInt(e.target.value) : 0 })}
              placeholder="e.g., 350000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.security_deposit || ''}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="e.g., 100000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Amenities & Features */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Amenities & Features</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleCheckboxChange('amenities', amenity)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Utilities Included
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {UTILITIES.map((utility) => (
              <label key={utility} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.utilities_included.includes(utility)}
                  onChange={() => handleCheckboxChange('utilities_included', utility)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{utility}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            House Rules
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HOUSE_RULES.map((rule) => (
              <label key={rule} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.house_rules.includes(rule)}
                  onChange={() => handleCheckboxChange('house_rules', rule)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{rule}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: Contact */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number * (e.g., 5926123456)
            </label>
            <input
              type="text"
              required
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="5926123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">Include country code (592 for Guyana)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g., +592-612-3456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Listing...' : 'Create Listing & Add Photos'}
        </button>
      </div>
    </form>
  )
}
