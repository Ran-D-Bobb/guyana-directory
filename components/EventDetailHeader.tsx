'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EventShareButton } from './EventShareButton'

interface EventDetailHeaderProps {
  title: string
  slug: string
}

export function EventDetailHeader({ title, slug }: EventDetailHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Events</span>
          </Link>

          {/* Show truncated title when scrolled past hero */}
          <div className={`min-w-0 transition-all duration-300 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="h-6 w-px bg-gray-200 inline-block align-middle mr-3" />
            <span className="text-sm font-semibold text-gray-900 truncate align-middle">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <EventShareButton title={title} slug={slug} variant="compact" />
        </div>
      </div>
    </header>
  )
}
