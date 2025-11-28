'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Home, Building, Building2, Hotel, BedDouble, Briefcase, Store, Users, Mountain, Palmtree, type LucideIcon } from 'lucide-react'

interface RentalCategory {
  id: string
  name: string
  slug: string
  icon: string
  listing_count?: number
  count?: number
}

interface RentalCategorySidebarProps {
  categories: RentalCategory[]
}

// Map icon names to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  Home,
  Building,
  Building2,
  Hotel,
  BedDouble,
  Briefcase,
  Store,
  Users,
  Mountain,
  Palmtree
}

export function RentalCategorySidebar({ categories }: RentalCategorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const totalListings = categories.reduce((sum, cat) => sum + (cat.listing_count || cat.count || 0), 0)

  return (
    <>
      {/* Desktop Sidebar - starts below header (h-20 + border) */}
      <aside
        className={`hidden lg:block fixed left-0 top-[81px] h-[calc(100vh-81px)] bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {!isCollapsed && (
            <Link href="/rentals" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                Rentals
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Categories List */}
        <nav className="overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="p-2">
            {/* All Rentals Link */}
            <Link
              href="/rentals"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                pathname === '/rentals'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                <Home
                  className={`h-5 w-5 ${pathname === '/rentals' ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`}
                  strokeWidth={2}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">All Rentals</div>
                  <div className={`text-xs ${pathname === '/rentals' ? 'text-white/80' : 'text-gray-500'}`}>
                    {totalListings} {totalListings === 1 ? 'property' : 'properties'}
                  </div>
                </div>
              )}
            </Link>

            {/* Category Links */}
            {categories.map((category) => {
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Home : Home
              const isActive = pathname === `/rentals/category/${category.slug}`
              const count = category.listing_count || category.count || 0

              return (
                <Link
                  key={category.id}
                  href={`/rentals/category/${category.slug}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                    <IconComponent
                      className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`}
                      strokeWidth={2}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{category.name}</div>
                      {count > 0 && (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {count} {count === 1 ? 'property' : 'properties'}
                        </div>
                      )}
                      {count === 0 && (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          No properties yet
                        </div>
                      )}
                    </div>
                  )}
                  {!isCollapsed && isActive && (
                    <ChevronRight className="h-4 w-4 text-white flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`} />
    </>
  )
}
