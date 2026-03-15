'use client'

import { Building2, CalendarDays } from 'lucide-react'

interface SavedPageTabsProps {
  businessCount: number
  eventCount: number
}

export function SavedPageTabs({ businessCount, eventCount }: SavedPageTabsProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1 py-2">
          <button
            onClick={() => scrollToSection('businesses')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Businesses</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-600 rounded-full">
              {businessCount}
            </span>
          </button>
          <button
            onClick={() => scrollToSection('events')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Events</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-600 rounded-full">
              {eventCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
