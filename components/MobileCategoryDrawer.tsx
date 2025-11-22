'use client'

import Link from 'next/link'
import { useState } from 'react'
import { X, Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, Home as HomeIcon, Heart, Laptop, GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package, Grid3x3, type LucideIcon } from 'lucide-react'
import { Database } from '@/types/supabase'

type Category = Database['public']['Tables']['categories']['Row'] & {
  business_count?: number
}

interface MobileCategoryDrawerProps {
  categories: Category[]
  currentCategorySlug?: string
}

const iconMap: Record<string, LucideIcon> = {
  Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, HomeIcon, Heart, Laptop,
  GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package
}

export function MobileCategoryDrawer({ categories, currentCategorySlug }: MobileCategoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] left-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open categories"
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
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-600">Browse all categories</p>
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
          {/* All Categories */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
              !currentCategorySlug
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              !currentCategorySlug ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <HomeIcon className={`h-5 w-5 ${!currentCategorySlug ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">All Categories</div>
              <div className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
                Browse everything
              </div>
            </div>
          </Link>

          {/* Category Items */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Store : Store
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={`/businesses/category/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
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
                  {category.business_count !== undefined && (
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.business_count} {category.business_count === 1 ? 'business' : 'businesses'}
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
