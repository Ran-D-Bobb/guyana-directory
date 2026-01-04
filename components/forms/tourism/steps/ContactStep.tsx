'use client'

import { PhoneInput } from '@/components/forms/inputs/PhoneInput'
import { TextInput } from '@/components/forms/inputs/TextInput'

interface ContactStepProps {
  formData: {
    phone: string
    email: string
    website: string
    operator_name: string
    operator_license: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

export function ContactStep({
  formData,
  errors,
  onChange,
}: ContactStepProps) {
  return (
    <div className="space-y-5">
      {/* Operator Name */}
      <TextInput
        label="Company/Operator Name"
        name="operator_name"
        value={formData.operator_name}
        onChange={(value) => onChange('operator_name', value)}
        placeholder="Your tour company or guide name"
        helperText="The name tourists will see for your business"
      />

      {/* Phone Number - REQUIRED */}
      <PhoneInput
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={(value) => onChange('phone', value)}
        required
        error={errors.phone}
        defaultCountryCode="592"
        helperText="Primary contact for booking inquiries (with country code)"
      />

      {/* Email */}
      <TextInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={(value) => onChange('email', value)}
        placeholder="contact@yourtours.com"
        error={errors.email}
        helperText="Optional - for email inquiries and bookings"
      />

      {/* Website */}
      <TextInput
        label="Website"
        name="website"
        type="url"
        value={formData.website}
        onChange={(value) => onChange('website', value)}
        placeholder="https://www.yourtours.com"
        error={errors.website}
        helperText="Optional - your tour company website"
      />

      {/* Tourism License */}
      <TextInput
        label="Tourism License Number"
        name="operator_license"
        value={formData.operator_license}
        onChange={(value) => onChange('operator_license', value)}
        placeholder="License number (if applicable)"
        helperText="Helps build trust with international tourists"
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
            <p className="font-medium mb-1">Professional Tip</p>
            <p>Including a tourism license number helps build credibility with international tourists who want to ensure they&apos;re booking with a legitimate operator.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
