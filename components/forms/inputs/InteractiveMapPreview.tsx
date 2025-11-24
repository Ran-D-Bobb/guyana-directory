'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { MapPin, Maximize2, Info, ZoomIn, ZoomOut } from 'lucide-react'

interface InteractiveMapPreviewProps {
  latitude: number
  longitude: number
  onLocationChange?: (lat: number, lon: number) => void
  className?: string
  draggable?: boolean
  zoom?: number
}

// Dynamic import wrapper component
export function InteractiveMapPreview(props: InteractiveMapPreviewProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={cn('w-full', props.className)}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-700">Location preview</p>
        </div>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return <MapContent {...props} />
}

function MapContent({
  latitude,
  longitude,
  onLocationChange,
  className,
  draggable = true,
  zoom = 15,
}: InteractiveMapPreviewProps) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const [L, setL] = useState<any>(null)
  const mapIdRef = useRef(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`)

  // Load Leaflet dynamically
  useEffect(() => {
    let isMounted = true

    const loadLeaflet = async () => {
      const leaflet = await import('leaflet')

      // Fix for default marker icon issue in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (isMounted) {
        setL(leaflet)
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!L || mapRef.current) return

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
    document.head.appendChild(link)

    // Initialize map
    const map = L.map(mapIdRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: false, // We'll add custom controls
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    })

    // Add tile layer (OpenStreetMap via Geoapify)
    L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=' + process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY, {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create custom red marker icon
    const redIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 42 16 42C16 42 32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#ef4444"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    })

    // Add marker
    const marker = L.marker([latitude, longitude], {
      icon: redIcon,
      draggable: draggable,
    }).addTo(map)

    // Handle marker drag
    if (draggable && onLocationChange) {
      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng()
        onLocationChange(position.lat, position.lng)
      })
    }

    // Handle zoom changes
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom())
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [L, latitude, longitude, draggable, onLocationChange, zoom])

  // Update marker position when props change
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const newLatLng = L.latLng(latitude, longitude)
      markerRef.current.setLatLng(newLatLng)
      mapRef.current.setView(newLatLng, currentZoom)
    }
  }, [L, latitude, longitude, currentZoom])

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  // Open in Google Maps
  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!L) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-700">Location preview</p>
        </div>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    )
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

      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 z-0">
        {/* Map container */}
        <div id={mapIdRef.current} className="w-full h-full relative z-0" />

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="bg-white hover:bg-gray-50 border-2 border-gray-300 rounded p-1.5 shadow-md transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="bg-white hover:bg-gray-50 border-2 border-gray-300 rounded p-1.5 shadow-md transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Current zoom level indicator */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 z-10">
          Zoom: {currentZoom}
        </div>
      </div>

      {/* Draggable hint */}
      {draggable && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            You can zoom, pan, and drag the marker to adjust the exact location.
            Use scroll wheel or pinch to zoom, click and drag to pan the map.
          </p>
        </div>
      )}

      <style jsx global>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }

        .leaflet-container {
          font-family: inherit;
          z-index: 0 !important;
        }

        .leaflet-pane {
          z-index: 1 !important;
        }

        .leaflet-tile-pane {
          z-index: 1 !important;
        }

        .leaflet-overlay-pane {
          z-index: 2 !important;
        }

        .leaflet-shadow-pane {
          z-index: 3 !important;
        }

        .leaflet-marker-pane {
          z-index: 4 !important;
        }

        .leaflet-tooltip-pane {
          z-index: 5 !important;
        }

        .leaflet-popup-pane {
          z-index: 6 !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .leaflet-control-container {
          z-index: 7 !important;
        }
      `}</style>
    </div>
  )
}
