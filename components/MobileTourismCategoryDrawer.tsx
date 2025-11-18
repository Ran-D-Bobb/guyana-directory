'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  X,
  Plane,
  Trees,
  Activity,
  Users,
  Home,
  Map,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Compass,
  Car,
  Grid3x3
} from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismCategory = Database['public']['Tables']['tourism_categories']['Row'] & {
  experience_count?: number
}

interface MobileTourismCategoryDrawerProps {
  categories: TourismCategory[]
  currentCategorySlug?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Trees,
  Activity,
  Users,
  Home,
  Map,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Compass,
  Car,
  Plane
}

export function MobileTourismCategoryDrawer({ categories, currentCategorySlug }: MobileTourismCategoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] right-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open tourism categories"
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
            <h2 className="text-xl font-bold text-gray-900">Tourism Categories</h2>
            <p className="text-sm text-gray-600">Explore Guyana&apos;s experiences</p>
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
          {/* All Experiences */}
          <Link
            href="/tourism"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
              !currentCategorySlug
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              !currentCategorySlug ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <Plane className={`h-5 w-5 ${!currentCategorySlug ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">All Experiences</div>
              <div className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
                Browse everything
              </div>
            </div>
          </Link>

          {/* Category Items */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Plane : Plane
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={`/tourism/category/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{category.name}</div>
                  {category.experience_count !== undefined && (
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.experience_count} {category.experience_count === 1 ? 'experience' : 'experiences'}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
