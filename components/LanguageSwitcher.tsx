'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
}

const LOCALE_SHORT: Record<string, string> = {
  en: 'EN',
  es: 'ES',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (newLocale: string) => {
    setIsOpen(false)
    router.replace(pathname, { locale: newLocale as (typeof routing.locales)[number] })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 md:px-2.5 md:py-2 rounded-full text-xs md:text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/15 hover:bg-gray-200 dark:hover:bg-white/15 transition-all min-h-[36px] min-w-[36px] justify-center"
        aria-label={`Language: ${LOCALE_LABELS[locale]}`}
      >
        <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="hidden sm:inline">{LOCALE_SHORT[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[hsl(0,0%,14%)] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 py-1.5 z-[200] animate-in fade-in slide-in-from-top-2 duration-150">
          {routing.locales.map((loc) => {
            const isActive = locale === loc
            return (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span>{LOCALE_LABELS[loc]}</span>
                {isActive && (
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs">&#10003;</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
