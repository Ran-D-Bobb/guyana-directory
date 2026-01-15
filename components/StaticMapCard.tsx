'use client'

import { MapPin, ExternalLink } from 'lucide-react'

interface StaticMapCardProps {
  latitude: number
  longitude: number
  address?: string | null
  name?: string
  className?: string
}

export function StaticMapCard({ latitude, longitude, address, name, className = '' }: StaticMapCardProps) {
  // Google Maps link for opening in Maps app/browser
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  // Google Maps embed URL (free, no API key required for basic embeds)
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 bg-white ${className}`}>
      {/* Map Embed */}
      <div className="relative w-full h-48">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={name ? `Map showing ${name}` : 'Location map'}
          className="w-full h-full"
        />
      </div>

      {/* Footer with address and link */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {address && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{address}</p>
          </div>
        )}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}
