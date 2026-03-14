'use client'

import { useState } from 'react'
import { Phone, Mail, X, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ContactStepProps {
  formData: {
    phone?: string
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-900">
          <strong>Required:</strong> Please provide at least one contact method so attendees can reach you about this event.
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="tel"
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'phone-error' : 'phone-helper'}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.phone ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base min-h-[48px] md:min-h-[44px]`}
            placeholder="e.g., +5926001234"
          />
        </div>
        {errors.phone && (
          <p id="phone-error" className="text-sm text-red-600 mt-1">{errors.phone}</p>
        )}
        <p id="phone-helper" className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Include country code (e.g., +592 for Guyana). This is the preferred contact method.
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => updateFormData({ email: e.target.value })}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : 'email-helper'}
            className={`w-full pl-10 pr-4 py-3 border ${
              errors.email ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base min-h-[48px] md:min-h-[44px]`}
            placeholder="e.g., contact@example.com"
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
        <p id="email-helper" className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Alternative contact method for attendees
        </p>
      </div>

      {/* Contact Error */}
      {errors.contact && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{errors.contact}</p>
        </div>
      )}

      {/* Event Image */}
      <div className="border-t border-[hsl(var(--border))] pt-6">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          Event Image (Optional)
        </label>

        {!imagePreview && !formData.image_file ? (
          <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
            <ImageIcon className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <label
              htmlFor="image_file"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors min-h-[44px]"
            >
              <Upload className="w-5 h-5" />
              Upload Event Image
            </label>
            <input
              type="file"
              id="image_file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              PNG, JPG or WebP (max 5MB)
            </p>
          </div>
        ) : (
          <div className="relative w-full h-64">
            <Image
              src={imagePreview || ''}
              alt="Event preview"
              fill
              className="object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
          Add an eye-catching image to make your event stand out. Images with people, activities, or venue photos work best.
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm font-medium text-emerald-900 mb-2">Contact Tips</p>
        <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
          <li>Respond promptly to inquiries to build trust</li>
          <li>Include your business email for professional inquiries</li>
          <li>Make sure your phone number is correct and active</li>
        </ul>
      </div>
    </div>
  )
}
