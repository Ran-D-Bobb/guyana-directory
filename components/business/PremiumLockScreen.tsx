'use client'

import { Lock, Check } from 'lucide-react'

export function PremiumLockScreen() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
        {/* Lock icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mx-auto mb-5">
          <Lock className="text-amber-600" size={28} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock Business Analytics
        </h2>
        <p className="text-gray-500 mb-7">
          Get detailed insights into your business performance
        </p>

        {/* Pricing options */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          {/* Monthly */}
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Monthly</p>
            <p className="text-2xl font-bold text-gray-900">G$5,000</p>
            <p className="text-sm text-gray-500">per month</p>
          </div>

          {/* Annual */}
          <div className="border-2 border-amber-400 rounded-xl p-4 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
              Save G$10,000
            </span>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Annual</p>
            <p className="text-2xl font-bold text-gray-900">G$50,000</p>
            <p className="text-sm text-gray-500">per year</p>
          </div>
        </div>

        {/* Feature checklist */}
        <ul className="text-left space-y-2.5 mb-7">
          {[
            'Views & engagement metrics over time',
            'WhatsApp click analytics',
            'Review trends & rating distribution',
            'Customer engagement insights',
            'Export analytics data',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="text-emerald-600" size={12} strokeWidth={3} />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          type="button"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Upgrade to Premium
        </button>

        <p className="text-xs text-gray-400 mt-3">Coming soon</p>
      </div>
    </div>
  )
}
