'use client'

import { PhoneInput } from '@/components/forms/inputs/PhoneInput'
import { TextInput } from '@/components/forms/inputs/TextInput'

interface ContactStepProps {
  formData: {
    phone: string
    email: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

export default function ContactStep({
  formData,
  errors,
  onChange
}: ContactStepProps) {
  return (
    <div className="space-y-5">
      {/* Phone Number - REQUIRED */}
      <PhoneInput
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={(value) => onChange('phone', value)}
        required
        error={errors.phone}
        defaultCountryCode="592"
        helperText="Primary contact method - renters will contact you via phone"
      />

      {/* Email - Optional */}
      <TextInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={(value) => onChange('email', value)}
        placeholder="your@email.com"
        error={errors.email}
        helperText="Optional - for email inquiries"
      />

      {/* Next Steps Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">What happens next?</p>
            <p>After submitting, you&apos;ll be redirected to add photos of your property. Great photos can increase inquiries by up to 5x!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
