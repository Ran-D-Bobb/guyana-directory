'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
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
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative min-h-[65dvh] md:min-h-[80dvh] flex items-center justify-center overflow-hidden supports-[min-height:100dvh]:min-h-[65dvh]">
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=85"
          alt="Kaieteur Falls, Guyana"
          fill
          className="object-cover animate-ken-burns-slow"
          priority
          quality={90}
          sizes="100vw"
        />

        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-transparent to-emerald-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-amber-900/20" />

        {/* Grain texture overlay */}
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* Decorative elements - smaller on mobile */}
      <div className="absolute top-20 left-5 md:left-10 w-32 md:w-64 h-32 md:h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-5 md:right-10 w-40 md:w-96 h-40 md:h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float delay-1000" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 md:py-0">
        {/* Eyebrow text */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-dark text-white/90 text-xs md:text-sm font-medium mb-4 md:mb-8">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
            Your gateway to Guyana
          </span>
        </div>

        {/* Main headline with staggered animation - scaled for mobile */}
        <h1 className="mb-4 md:mb-6">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-white animate-fade-up delay-100">
            Discover
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold animate-fade-up delay-200">
            <span className="text-gradient-gold animate-text-shimmer bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Guyana
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg lg:text-xl text-white/80 mb-6 md:mb-10 font-light max-w-2xl mx-auto animate-fade-up delay-300 leading-relaxed px-2">
          Businesses, experiences, stays & events — <br className="hidden sm:block" />
          all in <span className="text-emerald-400 font-medium">one place</span>
        </p>

        {/* Search bar with glass effect - more compact on mobile */}
        <form onSubmit={handleSearch} className="max-w-xl md:max-w-2xl mx-auto animate-fade-up delay-400">
          <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.02]' : ''}`}>
            {/* Glow effect on focus */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 rounded-xl md:rounded-2xl blur-lg transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-0'}`} />

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What are you looking for?"
                className="w-full px-4 md:px-6 py-4 md:py-5 pr-16 md:pr-18 text-base md:text-lg glass rounded-xl md:rounded-2xl border border-white/20 focus:outline-none focus:border-amber-400/50 placeholder:text-gray-500 text-gray-900 transition-colors font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 md:p-3.5 min-w-[44px] min-h-[44px] bg-gradient-to-br from-emerald-600 to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white rounded-lg md:rounded-xl transition-colors btn-shine shadow-lg shadow-emerald-900/30"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Category suggestions with stagger - smaller on mobile */}
        {suggestions.length > 0 && (
          <div className="mt-6 md:mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3 animate-fade-up delay-500">
            <span className="text-white/50 text-xs md:text-sm font-medium">Explore:</span>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.href}
                onClick={() => router.push(suggestion.href)}
                className={`px-3 md:px-5 py-2 md:py-2.5 glass-dark hover:bg-white/20 rounded-full transition-all duration-300 text-white/90 hover:text-white text-xs md:text-sm font-medium border border-white/10 hover:border-white/20 hover:scale-105 animate-fade-up`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicator - mobile only */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
