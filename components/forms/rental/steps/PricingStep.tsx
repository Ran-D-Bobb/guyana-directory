'use client'

interface PricingStepProps {
  formData: {
    price_per_night: number | null
    price_per_week: number | null
    price_per_month: number
    security_deposit: number | null
  }
  errors: Record<string, string>
  onChange: (field: string, value: number | null) => void
}

export default function PricingStep({
  formData,
  errors,
  onChange
}: PricingStepProps) {
  const formatCurrency = (value: number | null): string => {
    if (value === null || value === 0) return ''
    return value.toLocaleString('en-US')
  }

  const handleCurrencyChange = (field: string, value: string) => {
    // Remove commas and parse
    const numericValue = value.replace(/,/g, '')
    if (numericValue === '') {
      onChange(field, field === 'price_per_month' ? 0 : null)
    } else {
      const parsed = parseInt(numericValue)
      if (!isNaN(parsed)) {
        onChange(field, parsed)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Pricing
        </h2>
        <p className="text-base text-gray-600">
          Set your rental rates in GYD (Guyanese Dollars)
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="space-y-4">
        {/* Price per Night */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Night
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              GYD
            </span>
            <input
              type="text"
              value={formatCurrency(formData.price_per_night)}
              onChange={(e) => handleCurrencyChange('price_per_night', e.target.value)}
              placeholder="15,000"
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional - for short-term rentals</p>
        </div>

        {/* Price per Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Week
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              GYD
            </span>
            <input
              type="text"
              value={formatCurrency(formData.price_per_week)}
              onChange={(e) => handleCurrencyChange('price_per_week', e.target.value)}
              placeholder="90,000"
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional - offer weekly rates</p>
        </div>

        {/* Price per Month - REQUIRED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Month *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              GYD
            </span>
            <input
              type="text"
              required
              value={formatCurrency(formData.price_per_month)}
              onChange={(e) => handleCurrencyChange('price_per_month', e.target.value)}
              placeholder="350,000"
              className={`w-full pl-14 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                errors.price_per_month ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.price_per_month ? (
            <p className="text-sm text-red-600 mt-1">{errors.price_per_month}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Required - monthly rental rate</p>
          )}
        </div>

        {/* Security Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Deposit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              GYD
            </span>
            <input
              type="text"
              value={formatCurrency(formData.security_deposit)}
              onChange={(e) => handleCurrencyChange('security_deposit', e.target.value)}
              placeholder="100,000"
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional - refundable security deposit</p>
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Pricing tips</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Research similar properties in your area</li>
              <li>Consider offering weekly/monthly discounts</li>
              <li>Security deposits are typically 1-2 months rent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
