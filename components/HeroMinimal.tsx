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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
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

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float delay-1000" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow text */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/90 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Your gateway to Guyana
          </span>
        </div>

        {/* Main headline with staggered animation */}
        <h1 className="mb-6">
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold text-white animate-fade-up delay-100">
            Discover
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold animate-fade-up delay-200">
            <span className="text-gradient-gold animate-text-shimmer bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Guyana
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-white/80 mb-12 font-light max-w-2xl mx-auto animate-fade-up delay-300 leading-relaxed">
          Businesses, experiences, stays & events — <br className="hidden sm:block" />
          all in <span className="text-emerald-400 font-medium">one place</span>
        </p>

        {/* Search bar with glass effect */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-up delay-400">
          <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.02]' : ''}`}>
            {/* Glow effect on focus */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 rounded-2xl blur-lg transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-0'}`} />

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What are you looking for?"
                className="w-full px-6 py-5 pr-16 text-lg glass rounded-2xl border border-white/20 focus:outline-none focus:border-amber-400/50 placeholder:text-gray-500 text-gray-900 transition-all font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3.5 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 btn-shine shadow-lg shadow-emerald-900/30"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Category suggestions with stagger */}
        {suggestions.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up delay-500">
            <span className="text-white/50 text-sm font-medium">Explore:</span>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.href}
                onClick={() => router.push(suggestion.href)}
                className={`px-5 py-2.5 glass-dark hover:bg-white/20 rounded-full transition-all duration-300 text-white/90 hover:text-white text-sm font-medium border border-white/10 hover:border-white/20 hover:scale-105 animate-fade-up`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
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
