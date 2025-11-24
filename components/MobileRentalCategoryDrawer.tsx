'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  X,
  Home,
  Building2,
  TreePine,
  BedDouble,
  Briefcase,
  Store,
  Users,
  MapPin,
  Grid3x3,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type RentalCategory = Database['public']['Tables']['rental_categories']['Row'] & {
  listing_count?: number
}

interface MobileRentalCategoryDrawerProps {
  categories: RentalCategory[]
  currentCategorySlug?: string
}

const iconMap: Record<string, LucideIcon> = {
  Home,
  Building2,
  TreePine,
  BedDouble,
  Briefcase,
  Store,
  Users,
  MapPin
}

export function MobileRentalCategoryDrawer({ categories, currentCategorySlug }: MobileRentalCategoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button - positioned on left to avoid conflict with filter button on right */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] left-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open rental categories"
      >
        <Grid3x3 className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rental Categories</h2>
            <p className="text-sm text-gray-600">Find your ideal place in Guyana</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {/* All Rentals - Always at top */}
          <Link
            href="/rentals"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all mb-2 ${
              !currentCategorySlug
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${!currentCategorySlug ? 'bg-white/20' : 'bg-white'}`}>
                <MapPin className={`h-5 w-5 ${!currentCategorySlug ? 'text-white' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`font-bold ${!currentCategorySlug ? 'text-white' : 'text-gray-900'}`}>
                  All Rentals
                </p>
                <p className={`text-sm ${!currentCategorySlug ? 'text-white/90' : 'text-gray-600'}`}>
                  {categories.reduce((sum, cat) => sum + (cat.listing_count || 0), 0)} total
                </p>
              </div>
            </div>
          </Link>

          {/* Individual Categories */}
          {categories.map((category) => {
            const Icon = iconMap[category.icon || 'Home'] || Home
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={`/rentals/category/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all mb-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </p>
                    {category.description && (
                      <p className={`text-sm line-clamp-1 ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {category.listing_count || 0}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    listings
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
