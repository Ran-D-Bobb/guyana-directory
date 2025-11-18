'use client'

import { Search, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HomeSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (query.trim() !== '') {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-3
          transition-all duration-300 group
          ${isFocused
            ? 'shadow-emerald-500/20 ring-2 ring-emerald-500/50 scale-[1.02]'
            : 'shadow-gray-900/10 hover:shadow-emerald-500/10 hover:scale-[1.01]'
          }
        `}
      >
        {/* Search Icon */}
        <div className={`
          flex items-center justify-center h-12 w-12 rounded-xl
          transition-all duration-300
          ${isFocused
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'
          }
        `}>
          <Search className={`h-5 w-5 transition-transform ${isFocused ? 'scale-110' : ''}`} />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search for restaurants, shops, services..."
          className="flex-1 text-base md:text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent py-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Search Button */}
        <button
          type="submit"
          className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 font-medium group/btn"
        >
          <span>Search</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </button>

        {/* Mobile Search Button */}
        <button
          type="submit"
          className="sm:hidden flex items-center justify-center h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Quick suggestions (optional) */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-emerald-100 font-medium">Popular:</span>
        {['Restaurants', 'Shopping', 'Health'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag)
              router.push(`/search?q=${encodeURIComponent(tag)}`)
            }}
            className="px-3 py-1 text-xs bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  )
}
