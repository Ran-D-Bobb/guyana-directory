'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type SearchSuggestion = {
  label: string
  href: string
}

interface HeroMinimalProps {
  suggestions?: SearchSuggestion[]
}

export function HeroMinimal({ suggestions = [] }: HeroMinimalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Single stunning background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=85"
          alt="Kaieteur Falls, Guyana"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Content - centered, minimal */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
          Discover Guyana
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 font-light max-w-2xl mx-auto">
          Businesses, experiences, stays, and events — all connected via WhatsApp
        </p>

        {/* Search bar - the single CTA */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full px-6 py-5 pr-14 text-lg bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 placeholder:text-gray-400 text-gray-900 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Dynamic category hints - only shown if suggestions exist */}
        {suggestions.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
            <span>Try:</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.href}
                onClick={() => router.push(suggestion.href)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>

    </section>
  )
}
