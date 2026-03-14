'use client'

import { useEffect, useState } from 'react'
import { Phone, ArrowRight } from 'lucide-react'

interface TourismStickyCTAProps {
  priceFrom: number | null
  priceNotes: string | null
  phone: string | null
  email: string | null
}

export function TourismStickyCTA({ priceFrom, priceNotes, phone, email }: TourismStickyCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('tourism-hero-sentinel')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  if (!phone && !email) return null

  const contactHref = phone ? `tel:${phone}` : `mailto:${email}`

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            {priceFrom ? (
              <div>
                <span className="text-lg font-bold text-gray-900">
                  ${priceFrom.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {priceNotes || 'per person'}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Contact for pricing</span>
            )}
          </div>

          <a
            href={contactHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            {phone ? (
              <>
                <Phone className="w-4 h-4" />
                Call Now
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Contact
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  )
}
