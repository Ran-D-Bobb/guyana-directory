'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import { REGION_COOKIE, getRegionDisplayName } from '@/lib/regions'

interface RegionOption {
  slug: string
  name: string
  displayName: string
}

interface RegionSelectorProps {
  currentSlug: string
  regions: RegionOption[]
}

export function RegionSelector({ currentSlug, regions }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentDisplay = currentSlug === 'all'
    ? 'All Guyana'
    : getRegionDisplayName(currentSlug)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (slug: string) => {
    document.cookie = `${REGION_COOKIE}=${slug}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all"
      >
        <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="max-w-[100px] md:max-w-none truncate">{currentDisplay}</span>
        <ChevronDown className={`h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 lg:left-0 lg:right-auto mt-2 w-56 bg-white dark:bg-[hsl(0,0%,14%)] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 py-2 z-[200] animate-in fade-in slide-in-from-top-2 duration-150 max-h-[70vh] overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Select Region
          </div>

          {regions.map((region) => {
            const isActive = currentSlug === region.slug
            return (
              <button
                key={region.slug}
                onClick={() => handleSelect(region.slug)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {isActive && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                <span className={isActive ? '' : 'ml-6'}>{region.displayName}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
