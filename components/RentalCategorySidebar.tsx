'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Home, Building, Building2, Hotel, BedDouble, Briefcase, Store, Users, Mountain, Palmtree, Sparkles, type LucideIcon } from 'lucide-react'

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
      {/* Desktop Sidebar - Premium Design */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-[81px] h-[calc(100vh-81px)] bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-40 transition-all duration-500 ease-out ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200/50 flex items-center justify-between px-4 bg-gradient-to-r from-white/50 to-transparent">
          {!isCollapsed && (
            <Link href="/rentals" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all group-hover:scale-105">
                <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-display text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Rentals
                </span>
                <p className="text-xs text-gray-500">{totalListings} properties</p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all ml-auto group"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </button>
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          <div className="px-3 space-y-1">
            {/* All Rentals Link */}
            <Link
              href="/rentals"
              className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300 group relative ${
                pathname === '/rentals'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'hover:bg-gray-100/80 text-gray-700'
              }`}
            >
              {/* Active indicator */}
              {pathname === '/rentals' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}

              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                <div className={`p-2 rounded-lg ${pathname === '/rentals' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-100'} transition-colors`}>
                  <Home
                    className={`h-5 w-5 ${pathname === '/rentals' ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'} transition-colors`}
                    strokeWidth={2}
                  />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">All Rentals</div>
                  <div className={`text-xs ${pathname === '/rentals' ? 'text-white/80' : 'text-gray-500'}`}>
                    Browse everything
                  </div>
                </div>
              )}
              {!isCollapsed && pathname === '/rentals' && (
                <Sparkles className="h-4 w-4 text-white/80 flex-shrink-0" />
              )}
            </Link>

            {/* Divider */}
            {!isCollapsed && (
              <div className="my-4 px-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</p>
              </div>
            )}

            {/* Category Links */}
            {categories.map((category, index) => {
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Home : Home
              const isActive = pathname === `/rentals/category/${category.slug}`
              const count = category.listing_count || category.count || 0

              return (
                <Link
                  key={category.id}
                  href={`/rentals/category/${category.slug}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'hover:bg-gray-100/80 text-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}

                  <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-emerald-100'} transition-colors`}>
                      <IconComponent
                        className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'} transition-colors`}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{category.name}</div>
                      {count > 0 ? (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {count} {count === 1 ? 'property' : 'properties'}
                        </div>
                      ) : (
                        <div className={`text-xs ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                          Coming soon
                        </div>
                      )}
                    </div>
                  )}
                  {!isCollapsed && isActive && (
                    <ChevronRight className="h-4 w-4 text-white/80 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent">
            <Link
              href="/list-rental"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              List Your Property
            </Link>
          </div>
        )}
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-500 ${isCollapsed ? 'w-20' : 'w-72'}`} />
    </>
  )
}
