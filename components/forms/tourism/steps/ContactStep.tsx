'use client'

import { PhoneInput } from '@/components/forms/inputs/PhoneInput'
import { TextInput } from '@/components/forms/inputs/TextInput'

interface ContactStepProps {
  formData: {
    whatsapp_number: string
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-base text-gray-600">
          How can international tourists reach you?
        </p>
      </div>

      {/* Operator Name */}
      <TextInput
        label="Company/Operator Name"
        name="operator_name"
        value={formData.operator_name}
        onChange={(value) => onChange('operator_name', value)}
        placeholder="Your tour company or guide name"
        helperText="The name tourists will see for your business"
      />

      {/* WhatsApp Number - REQUIRED */}
      <PhoneInput
        label="WhatsApp Number"
        name="whatsapp_number"
        value={formData.whatsapp_number}
        onChange={(value) => onChange('whatsapp_number', value)}
        required
        error={errors.whatsapp_number}
        defaultCountryCode="592"
        helperText="Primary contact for booking inquiries (with country code)"
      />

      {/* Phone Number - Optional */}
      <PhoneInput
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={(value) => onChange('phone', value)}
        error={errors.phone}
        defaultCountryCode="592"
        helperText="Optional - additional contact number"
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

      {/* WhatsApp Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Why WhatsApp?</p>
            <p>WhatsApp is the preferred communication method for international tourists. It allows them to easily message you from anywhere in the world without international calling fees.</p>
          </div>
        </div>
      </div>

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
