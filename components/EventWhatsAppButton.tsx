'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface EventWhatsAppButtonProps {
  eventTitle: string
  businessName: string
  whatsappNumber: string
  eventId: string
}

export function EventWhatsAppButton({ eventTitle, whatsappNumber, eventId }: EventWhatsAppButtonProps) {
  const [isTracking, setIsTracking] = useState(false)

  const handleClick = async () => {
    if (isTracking) return

    setIsTracking(true)

    try {
      // Track the click in the database
      await fetch('/api/track-event-whatsapp-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
        }),
      })
    } catch (error) {
      console.error('Failed to track event WhatsApp click:', error)
    }

    // Format the WhatsApp number (remove any non-digit characters)
    const cleanNumber = whatsappNumber.replace(/\D/g, '')

    // Pre-filled message for event
    const message = encodeURIComponent(`Hi! I found your event "${eventTitle}" on Guyana Directory and I'm interested in learning more.`)

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
      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl transform hover:-translate-y-0.5 group"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      <span>Contact Organizer on WhatsApp</span>
    </button>
  )
}
