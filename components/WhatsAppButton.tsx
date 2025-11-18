'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface WhatsAppButtonProps {
  businessName: string
  whatsappNumber: string
  businessId: string
}

export function WhatsAppButton({ businessName, whatsappNumber, businessId }: WhatsAppButtonProps) {
  const [isTracking, setIsTracking] = useState(false)

  const handleClick = async () => {
    if (isTracking) return

    setIsTracking(true)

    try {
      // Track the click in the database
      await fetch('/api/track-whatsapp-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          deviceType: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      console.error('Failed to track WhatsApp click:', error)
    }

    // Format the WhatsApp number (remove any non-digit characters)
    const cleanNumber = whatsappNumber.replace(/\D/g, '')

    // Pre-filled message
    const message = encodeURIComponent(`Hi! I found you on Guyana Directory and I'm interested in ${businessName}`)

    // Determine which WhatsApp URL to use (mobile app vs web)
    const isMobile = /mobile/i.test(navigator.userAgent)
    const whatsappUrl = isMobile
      ? `https://wa.me/${cleanNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${message}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')

    setIsTracking(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isTracking}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle className="w-5 h-5" />
      Contact via WhatsApp
    </button>
  )
}
