'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';

export function CompactBanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative overflow-hidden">
      {/* Gradient Background - Deep jungle to teal */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(158,64%,8%)] via-[hsl(160,55%,15%)] to-[hsl(170,45%,20%)]" />

      {/* Decorative Gradient Orbs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 leaf-pattern opacity-30" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Content */}
      <div className="relative z-10 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-3 animate-fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Discover Guyana
            </span>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="animate-fade-up delay-100">
            <div
              className={`relative transition-all duration-300 ${
                isFocused ? 'scale-[1.02]' : ''
              }`}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 rounded-xl blur-lg transition-opacity duration-500 ${
                  isFocused ? 'opacity-30' : 'opacity-0'
                }`}
              />

              {/* Input Container */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search businesses, events, stays..."
                  className="w-full pl-4 pr-14 py-3.5 sm:py-4 text-sm sm:text-base glass rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-500 text-gray-900 font-medium transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 text-white rounded-lg transition-all shadow-lg shadow-emerald-900/30"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[hsl(160,35%,97%)] to-transparent" />
    </header>
  );
}
