'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { LucideIcon, Home } from 'lucide-react'

interface RentalCategory {
  id: string
  name: string
  slug: string
  icon: string
  listing_count?: number
}

interface RentalCategorySidebarProps {
  categories: RentalCategory[]
}

export function RentalCategorySidebar({ categories }: RentalCategorySidebarProps) {
  const pathname = usePathname()

  return (
    <div className="hidden lg:block lg:w-64 flex-shrink-0">
      <div className="sticky top-4 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
          <h2 className="text-lg font-bold text-white">Categories</h2>
        </div>

        {/* All Rentals Link */}
        <Link
          href="/rentals"
          className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 transition-colors ${
            pathname === '/rentals'
              ? 'bg-emerald-50 text-emerald-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Home className="h-5 w-5" />
            <span>All Rentals</span>
          </div>
          {categories.reduce((sum, cat) => sum + (cat.listing_count || 0), 0) > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {categories.reduce((sum, cat) => sum + (cat.listing_count || 0), 0)}
            </span>
          )}
        </Link>

        {/* Category List */}
        <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          {categories.map((category) => {
            const IconComponent = (LucideIcons[category.icon as keyof typeof LucideIcons] || Home) as LucideIcon
            const isActive = pathname === `/rentals/category/${category.slug}`

            return (
              <Link
                key={category.id}
                href={`/rentals/category/${category.slug}`}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm">{category.name}</span>
                </div>
                {category.listing_count !== undefined && category.listing_count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.listing_count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Browse {categories.reduce((sum, cat) => sum + (cat.listing_count || 0), 0)} properties across Guyana
          </p>
        </div>
      </div>
    </div>
  )
}
