'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

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

interface Rental {
  id: string
  property_type: string | null
  category_id: string
  name: string
  description: string | null
  region_id: string | null
  address: string | null
  location_details: string | null
  bedrooms: number | null
  bathrooms: number | null
  max_guests: number | null
  square_feet: number | null
  price_per_night: number | null
  price_per_week: number | null
  price_per_month: number | null
  security_deposit: number | null
  amenities: unknown
  utilities_included: unknown
  house_rules: unknown
  phone: string | null
  email: string | null
}

interface RentalEditFormProps {
  rental: Rental
  categories: Category[]
  regions: Region[]
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

export default function RentalEditForm({ rental, categories, regions }: RentalEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    property_type: rental.property_type || '',
    category_id: rental.category_id || '',
    name: rental.name || '',
    description: rental.description || '',
    region_id: rental.region_id || '',
    address: rental.address || '',
    location_details: rental.location_details || '',
    bedrooms: rental.bedrooms || 1,
    bathrooms: rental.bathrooms || 1,
    max_guests: rental.max_guests || 1,
    square_feet: rental.square_feet || null,
    price_per_night: rental.price_per_night || null,
    price_per_week: rental.price_per_week || null,
    price_per_month: rental.price_per_month || 0,
    security_deposit: rental.security_deposit || null,
    amenities: Array.isArray(rental.amenities) ? rental.amenities as string[] : [],
    utilities_included: Array.isArray(rental.utilities_included) ? rental.utilities_included as string[] : [],
    house_rules: Array.isArray(rental.house_rules) ? rental.house_rules as string[] : [],
    phone: rental.phone || '',
    email: rental.email || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Update rental listing
      const { error: updateError } = await supabase
        .from('rentals')
        .update({
          category_id: formData.category_id,
          name: formData.name,
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
          amenities: JSON.parse(JSON.stringify(formData.amenities)),
          utilities_included: JSON.parse(JSON.stringify(formData.utilities_included)),
          house_rules: JSON.parse(JSON.stringify(formData.house_rules)),
          phone: formData.phone || null,
          email: formData.email || null
        })
        .eq('id', rental.id)

      if (updateError) throw updateError

      // Redirect to dashboard
      router.push('/dashboard/my-rentals')
    } catch (err: unknown) {
      console.error('Error updating rental:', err)
      setError(err instanceof Error ? err.message : 'Failed to update listing. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property listing? This action cannot be undone. All photos and reviews will also be deleted.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      // Delete all photos from storage first
      const { data: photos } = await supabase
        .from('rental_photos')
        .select('image_url')
        .eq('rental_id', rental.id)

      if (photos && photos.length > 0) {
        const filePaths = photos.map(photo => {
          const url = new URL(photo.image_url)
          return url.pathname.split('/').slice(-1)[0]
        })

        await supabase.storage
          .from('rental-photos')
          .remove(filePaths)
      }

      // Delete the rental (cascade will delete photos, reviews, etc.)
      const { error: deleteError } = await supabase
        .from('rentals')
        .delete()
        .eq('id', rental.id)

      if (deleteError) throw deleteError

      // Redirect to dashboard
      router.push('/dashboard/my-rentals')
    } catch (err: unknown) {
      console.error('Error deleting rental:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete listing. Please try again.')
      setIsDeleting(false)
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
              value={formData.price_per_month}
              onChange={(e) => setFormData({ ...formData, price_per_month: parseInt(e.target.value) })}
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
        <p className="text-sm text-gray-600 mb-4">Please provide at least one contact method (phone or email)</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
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
              Email
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
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
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete Listing'}
        </button>
      </div>
    </form>
  )
}
