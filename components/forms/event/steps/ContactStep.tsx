'use client'

import { useState } from 'react'
import { MessageCircle, Mail, X, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ContactStepProps {
  formData: {
    whatsapp_number?: string
    email?: string
    image_file?: File | null
  }
  updateFormData: (data: Partial<ContactStepProps['formData']>) => void
  errors: Record<string, string>
}

export function ContactStep({
  formData,
  updateFormData,
  errors,
}: ContactStepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      updateFormData({ image_file: file })

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    updateFormData({ image_file: null })
    setImagePreview(null)
  }

  return (
    <div className="space-y-6">
      {/* Contact Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          <strong>Required:</strong> Please provide at least one contact method so attendees can reach you about this event.
        </p>
      </div>

      {/* WhatsApp Number */}
      <div>
        <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number
        </label>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            id="whatsapp_number"
            value={formData.whatsapp_number || ''}
            onChange={(e) => updateFormData({ whatsapp_number: e.target.value })}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.whatsapp_number ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
            placeholder="e.g., +5926001234"
          />
        </div>
        {errors.whatsapp_number && (
          <p className="text-sm text-red-600 mt-1">{errors.whatsapp_number}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Include country code (e.g., +592 for Guyana). This is the preferred contact method.
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base`}
            placeholder="e.g., contact@example.com"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Alternative contact method for attendees who don&apos;t use WhatsApp
        </p>
      </div>

      {/* Contact Error */}
      {errors.contact && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{errors.contact}</p>
        </div>
      )}

      {/* Event Image */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Image (Optional)
        </label>

        {!imagePreview && !formData.image_file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <label
              htmlFor="image_file"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Event Image
            </label>
            <input
              type="file"
              id="image_file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG or WebP (max 5MB)
            </p>
          </div>
        ) : (
          <div className="relative w-full h-64">
            <Image
              src={imagePreview || ''}
              alt="Event preview"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Add an eye-catching image to make your event stand out. Images with people, activities, or venue photos work best.
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm font-medium text-purple-900 mb-2">Contact Tips</p>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>WhatsApp is the most common way people in Guyana communicate</li>
          <li>Respond promptly to inquiries to build trust</li>
          <li>Consider creating a WhatsApp group for registered attendees</li>
          <li>Include your business email for professional inquiries</li>
        </ul>
      </div>
    </div>
  )
}
