'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MapPin, Maximize2, Info } from 'lucide-react'
import Image from 'next/image'

interface MapPreviewProps {
  latitude: number
  longitude: number
  onLocationChange?: (lat: number, lon: number) => void
  apiKey: string
  className?: string
  draggable?: boolean
  zoom?: number
}

export function MapPreview({
  latitude,
  longitude,
  onLocationChange,
  apiKey,
  className,
  draggable = true,
  zoom = 15,
}: MapPreviewProps) {
  const [mapImageUrl, setMapImageUrl] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [markerPosition, setMarkerPosition] = useState({ x: 50, y: 50 }) // Percentage
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate static map image URL
  useEffect(() => {
    const width = 600
    const height = 300
    const style = 'osm-carto' // OpenStreetMap style

    const url = `https://maps.geoapify.com/v1/staticmap?style=${style}&width=${width}&height=${height}&center=lonlat:${longitude},${latitude}&zoom=${zoom}&marker=lonlat:${longitude},${latitude};color:%23ef4444;size:medium&apiKey=${apiKey}`

    setMapImageUrl(url)
  }, [latitude, longitude, zoom, apiKey])

  // Handle marker drag start
  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return
    e.preventDefault()
    setIsDragging(true)
  }

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e: MouseEvent) => {
        if (!containerRef.current || !draggable) return

        const container = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - container.left) / container.width) * 100
        const y = ((e.clientY - container.top) / container.height) * 100

        // Constrain within bounds
        const clampedX = Math.max(0, Math.min(100, x))
        const clampedY = Math.max(0, Math.min(100, y))

        setMarkerPosition({ x: clampedX, y: clampedY })
      }

      const upHandler = () => {
        setIsDragging(false)

        // Calculate new lat/lon based on marker position
        if (containerRef.current && onLocationChange) {
          const deltaX = (markerPosition.x - 50) / 50
          const deltaY = (50 - markerPosition.y) / 50

          const metersPerPixel = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom)
          const containerWidth = containerRef.current.offsetWidth
          const degreesPerPixel = metersPerPixel / 111320

          const pixelDeltaX = (deltaX * containerWidth) / 2
          const pixelDeltaY = (deltaY * containerRef.current.offsetHeight) / 2

          const newLon = longitude + pixelDeltaX * degreesPerPixel
          const newLat = latitude + pixelDeltaY * degreesPerPixel

          onLocationChange(newLat, newLon)
        }
      }

      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', upHandler)

      return () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
      }
    }
  }, [isDragging, markerPosition, draggable, latitude, longitude, zoom, onLocationChange])

  // Open in Google Maps
  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-700">Location preview</p>
        <button
          type="button"
          onClick={handleOpenInGoogleMaps}
          className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
          Open in Google Maps
        </button>
      </div>

      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200',
          isDragging && 'cursor-grabbing'
        )}
      >
        {/* Map image */}
        {mapImageUrl ? (
          <Image
            src={mapImageUrl}
            alt="Location map"
            fill
            className="object-cover"
            draggable={false}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}

        {/* Draggable marker overlay */}
        {draggable && mapImageUrl && (
          <div
            className={cn(
              'absolute -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing',
              'transition-all duration-150',
              isDragging && 'scale-110'
            )}
            style={{
              left: `${markerPosition.x}%`,
              top: `${markerPosition.y}%`,
            }}
            onMouseDown={handleMarkerMouseDown}
          >
            <div className="relative">
              {/* Marker pin */}
              <svg
                width="32"
                height="42"
                viewBox="0 0 32 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 42 16 42C16 42 32 24.837 32 16C32 7.163 24.837 0 16 0Z"
                  fill="#ef4444"
                />
                <circle cx="16" cy="16" r="6" fill="white" />
              </svg>
              {/* Pulse animation */}
              {!isDragging && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full opacity-30 animate-ping" />
              )}
            </div>
          </div>
        )}

        {/* Non-draggable marker */}
        {!draggable && mapImageUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
            <svg
              width="32"
              height="42"
              viewBox="0 0 32 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 42 16 42C16 42 32 24.837 32 16C32 7.163 24.837 0 16 0Z"
                fill="#ef4444"
              />
              <circle cx="16" cy="16" r="6" fill="white" />
            </svg>
          </div>
        )}
      </div>

      {/* Draggable hint */}
      {draggable && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>Drag the marker to adjust the exact location if needed</p>
        </div>
      )}
    </div>
  )
}
