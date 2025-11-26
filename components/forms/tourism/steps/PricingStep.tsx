'use client'

import { TextInput } from '@/components/forms/inputs/TextInput'
import { TextArea } from '@/components/forms/inputs/TextArea'
import { Select } from '@/components/forms/inputs/Select'

interface PricingStepProps {
  formData: {
    price_from: number | null
    price_currency: string
    price_notes: string
    includes: string
    excludes: string
  }
  errors?: Record<string, string>
  onChange: (field: string, value: string | number | null) => void
}

const CURRENCIES = [
  { value: 'GYD', label: 'GYD - Guyanese Dollar' },
  { value: 'USD', label: 'USD - US Dollar' },
]

export function PricingStep({
  formData,
  onChange,
}: PricingStepProps) {
  return (
    <div className="space-y-5">
      {/* Price and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-900">
            Price From
          </label>
          <input
            type="number"
            value={formData.price_from || ''}
            onChange={(e) => onChange('price_from', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-900 transition-all duration-200 min-h-[48px]"
          />
        </div>

        <Select
          label="Currency"
          name="price_currency"
          value={formData.price_currency}
          onChange={(value) => onChange('price_currency', value)}
          options={CURRENCIES}
        />
      </div>

      {/* Price Notes */}
      <TextInput
        label="Price Notes"
        name="price_notes"
        value={formData.price_notes}
        onChange={(value) => onChange('price_notes', value)}
        placeholder="e.g., Per person, Per group, Varies by season"
        helperText="Explain how pricing works"
      />

      {/* What's Included */}
      <TextArea
        label="What's Included"
        name="includes"
        value={formData.includes}
        onChange={(value) => onChange('includes', value)}
        placeholder="e.g., Transportation, Meals, Guide, Equipment, Park entrance fees..."
        helperText="List everything included in the price"
        rows={4}
        maxLength={1000}
      />

      {/* What's Not Included */}
      <TextArea
        label="What's Not Included"
        name="excludes"
        value={formData.excludes}
        onChange={(value) => onChange('excludes', value)}
        placeholder="e.g., Personal expenses, Gratuities, Alcoholic beverages, Travel insurance..."
        helperText="List what tourists need to pay extra for"
        rows={3}
        maxLength={500}
      />

      {/* Pricing Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Pricing Tip</p>
            <p>Be transparent about what&apos;s included. Tourists appreciate knowing exactly what they&apos;re paying for upfront - this builds trust and reduces questions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
