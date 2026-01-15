'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Compass, ArrowRight, RefreshCw } from 'lucide-react'

interface TourismEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function TourismEmptyState({ hasFilters = false, onClearFilters }: TourismEmptyStateProps) {
  return (
    <div className="text-center py-16 lg:py-24 px-4 animate-fade-in">
      {/* Illustration */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        {/* Background circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 rounded-full" />

        {/* Image */}
        <div className="absolute inset-4 rounded-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80"
            alt="Adventure awaits"
            fill
            className="object-cover opacity-80"
          />
        </div>

        {/* Compass Icon Overlay */}
        <div className="absolute -bottom-2 -right-2 p-4 bg-white rounded-2xl shadow-xl">
          <Compass className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
        {hasFilters ? 'No matching experiences' : 'Adventures coming soon'}
      </h3>

      <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
        {hasFilters
          ? 'Try adjusting your filters or explore different categories to discover amazing experiences.'
          : 'We&apos;re curating incredible tourism experiences in Guyana. Check back soon for new adventures!'
        }
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Filters
          </button>
        )}

        <Link
          href="/tourism"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
        >
          Explore All Experiences
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Suggested Categories */}
      {hasFilters && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">Popular categories to explore:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Nature & Wildlife', 'Adventure', 'Waterfalls', 'Eco-Lodges', 'Cultural Tours'].map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
