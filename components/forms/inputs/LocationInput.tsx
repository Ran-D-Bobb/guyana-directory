'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, MapPin, Loader2 } from 'lucide-react'
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
  const [isFocused, setIsFocused] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value?.formatted_address || '')
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

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

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
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
    setIsFocused(false)
    setIsTouched(true)
    // Delay to allow click on suggestion
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
    inputRef.current?.focus()
  }

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={searchQuery}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Start typing an address..."
          required={required}
          autoComplete="off"
          className={cn(
            'w-full pl-10 pr-10 py-2.5 md:py-2',
            'border rounded-lg',
            'text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[44px] md:min-h-[40px]',
            showError &&
              'border-red-300 focus:border-red-500 focus:ring-red-500/20',
            showSuccess &&
              'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20',
            !showError &&
              !showSuccess &&
              'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20',
            isFocused && 'ring-2'
          )}
        />

        {/* Loading/Success/Error/Clear icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : showSuccess ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : showError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "text-gray-400 hover:text-gray-600 transition-colors",
                !searchQuery && "invisible"
              )}
              tabIndex={-1}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((feature, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(feature)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                  'border-b border-gray-100 last:border-b-0',
                  'focus:outline-none focus:bg-gray-50',
                  selectedSuggestion === index && 'bg-gray-50'
                )}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {feature.properties.address_line1 ||
                        feature.properties.formatted}
                    </p>
                    {feature.properties.address_line2 && (
                      <p className="text-xs text-gray-500 truncate">
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
      {showError ? (
        <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      ) : (
        helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}

      {/* Interactive map with draggable marker, zoom, and pan */}
      {value && (
        <div className="mt-4">
          <InteractiveMapPreview
            latitude={value.latitude}
            longitude={value.longitude}
            draggable={true}
            onLocationChange={(lat, lon) => {
              // Update location when marker is dragged
              onChange({
                latitude: lat,
                longitude: lon,
                formatted_address: value.formatted_address, // Keep the same address text
              })
            }}
            zoom={15}
          />
          <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{value.formatted_address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
