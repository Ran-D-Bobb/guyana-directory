'use client'

import { PhoneInput } from '@/components/forms/inputs/PhoneInput'
import { TextInput } from '@/components/forms/inputs/TextInput'
import { Phone, Mail, Globe } from 'lucide-react'

interface ContactInfoStepProps {
  data: {
    whatsapp_number: string
    phone: string
    email: string
    website: string
  }
  onChange: (data: Partial<ContactInfoStepProps['data']>) => void
  errors: Record<string, string>
}

export function ContactInfoStep({
  data,
  onChange,
  errors,
}: ContactInfoStepProps) {
  return (
    <div className="space-y-5">
      <PhoneInput
        label="WhatsApp Number"
        name="whatsapp_number"
        value={data.whatsapp_number}
        onChange={value => onChange({ whatsapp_number: value })}
        required
        error={errors.whatsapp_number}
        defaultCountryCode="592"
        helperText="This is the primary way customers will contact you. Include country code (592 for Guyana)"
      />

      <TextInput
        label="Phone Number"
        name="phone"
        value={data.phone}
        onChange={value => onChange({ phone: value })}
        type="tel"
        icon={<Phone className="w-5 h-5" />}
        placeholder="+592-123-4567"
        helperText="Optional alternative phone number"
      />

      <TextInput
        label="Email Address"
        name="email"
        value={data.email}
        onChange={value => onChange({ email: value })}
        type="email"
        icon={<Mail className="w-5 h-5" />}
        placeholder="contact@yourbusiness.com"
        helperText="Business email for customer inquiries"
      />

      <TextInput
        label="Website"
        name="website"
        value={data.website}
        onChange={value => onChange({ website: value })}
        type="url"
        icon={<Globe className="w-5 h-5" />}
        placeholder="https://www.yourbusiness.com"
        helperText="Your business website or social media page"
      />
    </div>
  )
}
