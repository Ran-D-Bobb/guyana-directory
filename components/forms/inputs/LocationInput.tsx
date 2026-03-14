'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, MapPin, Loader2, Navigation, Search, X } from 'lucide-react'
import { InteractiveMapPreview } from './InteractiveMapPreview'

export interface LocationData {
  latitude: number
  longitude: number
  formatted_address: string
}

interface LocationInputProps {
  label: string
  name: string
  value: LocationData | null
  onChange: (value: LocationData | null) => void
  required?: boolean
  error?: string
  helperText?: string
  className?: string
  apiKey: string // Geoapify API key
}

// Geolocation states
type GeoLocationState = 'idle' | 'loading' | 'success' | 'error'

interface GeoapifyFeature {
  properties: {
    formatted: string
    lat: number
    lon: number
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
  }
}

export function LocationInput({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  helperText,
  className,
  apiKey,
}: LocationInputProps) {
  const [isTouched, setIsTouched] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value?.formatted_address || '')
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1)
  const [geoState, setGeoState] = useState<GeoLocationState>('idle')
  const [geoError, setGeoError] = useState<string>('')
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!response.ok) throw new Error('Reverse geocode failed')
      const data = await response.json()
      return data.features?.[0]?.properties?.formatted || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    } catch {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
  }, [apiKey])

  // Handle "Use my current location" button
  const handleUseMyLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Location services not available on this device')
      setGeoState('error')
      return
    }

    setGeoState('loading')
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const address = await reverseGeocode(latitude, longitude)

        onChange({
          latitude,
          longitude,
          formatted_address: address,
        })
        setSearchQuery(address)
        setGeoState('success')
        setIsTouched(true)

        setTimeout(() => setGeoState('idle'), 2000)
      },
      (err) => {
        let errorMessage = 'Unable to get your location'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location in your browser settings.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setGeoError(errorMessage)
        setGeoState('error')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [onChange, reverseGeocode])

  // Handle map click to place marker
  const handleMapLocationChange = useCallback(async (lat: number, lon: number) => {
    const address = await reverseGeocode(lat, lon)
    onChange({
      latitude: lat,
      longitude: lon,
      formatted_address: address,
    })
    setSearchQuery(address)
    setIsTouched(true)
  }, [onChange, reverseGeocode])

  // Fetch suggestions from Geoapify
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${apiKey}&limit=5&filter=countrycode:gy`,
        { signal: AbortSignal.timeout(5000) }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.features || [])
    } catch (err) {
      console.error('Error fetching location suggestions:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (inputValue: string) => {
    setSearchQuery(inputValue)
    setShowSuggestions(true)
    setSelectedSuggestion(-1)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(inputValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (feature: GeoapifyFeature) => {
    const locationData: LocationData = {
      latitude: feature.properties.lat,
      longitude: feature.properties.lon,
      formatted_address: feature.properties.formatted,
    }

    setSearchQuery(feature.properties.formatted)
    onChange(locationData)
    setShowSuggestions(false)
    setSuggestions([])
    setIsTouched(true)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestion(-1)
        break
    }
  }

  const handleBlur = () => {
    setIsTouched(true)
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear button handler
  const handleClear = () => {
    setSearchQuery('')
    onChange(null)
    setSuggestions([])
    setShowSuggestions(false)
    setGeoState('idle')
    setGeoError('')
  }

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-3">
        {/* Method 1: Use my current location button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={geoState === 'loading'}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed',
            'transition-all duration-200',
            'min-h-[48px]',
            geoState === 'loading' && 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] cursor-wait',
            geoState === 'success' && 'bg-emerald-50 border-emerald-400 text-emerald-700',
            geoState === 'error' && 'bg-red-50 border-red-300 text-red-700',
            geoState === 'idle' && 'bg-[hsl(var(--background))] border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'
          )}
        >
          {geoState === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Getting your location...</span>
            </>
          ) : geoState === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              <span className="font-medium">Location found!</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              <span className="font-medium">Use my current location</span>
            </>
          )}
        </button>

        {/* Geolocation error message */}
        {geoState === 'error' && geoError && (
          <p className="text-sm text-red-600 flex items-start gap-1.5 px-1">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {geoError}
          </p>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">or search by address</span>
          </div>
        </div>

        {/* Method 2: Address search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            id={name}
            name={name}
            type="text"
            value={searchQuery}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search for an address..."
            required={required}
            autoComplete="off"
            aria-invalid={showError ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={showError ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full pl-10 pr-10 py-3',
              'border rounded-xl',
              'bg-[hsl(var(--background))]',
              'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'transition-all duration-200',
              'min-h-[48px] md:min-h-[44px]',
              showError &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              showSuccess &&
                'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
              !showError &&
                !showSuccess &&
                'border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-emerald-500/20'
            )}
          />

          {/* Loading/Clear icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[hsl(var(--muted-foreground))] animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                tabIndex={-1}
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((feature, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(feature)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-[hsl(var(--muted))] transition-colors',
                    'border-b border-[hsl(var(--border))] last:border-b-0',
                    'focus:outline-none focus:bg-[hsl(var(--muted))]',
                    'first:rounded-t-xl last:rounded-b-xl',
                    selectedSuggestion === index && 'bg-[hsl(var(--muted))]'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {feature.properties.address_line1 ||
                          feature.properties.formatted}
                      </p>
                      {feature.properties.address_line2 && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                          {feature.properties.address_line2}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {showError && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !showError && (
          <p id={helperId} className="text-sm text-[hsl(var(--muted-foreground))]">{helperText}</p>
        )}

        {/* Divider before map */}
        <div className="relative pt-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">or tap on the map</span>
          </div>
        </div>

        {/* Method 3: Interactive map - always visible */}
        <div className="mt-2">
          <InteractiveMapPreview
            latitude={value?.latitude}
            longitude={value?.longitude}
            draggable={true}
            clickToPlace={true}
            showMarker={!!value}
            onLocationChange={handleMapLocationChange}
            zoom={15}
          />
        </div>

        {/* Selected location display */}
        {value && (
          <div className="text-sm bg-emerald-50 rounded-xl p-3 border border-emerald-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-emerald-900">{value.formatted_address}</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear location"
                className="text-emerald-600 hover:text-emerald-800 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
