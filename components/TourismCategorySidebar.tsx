'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  ChevronLeft,
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
  Car
} from 'lucide-react'
import { useState } from 'react'
import { Database } from '@/types/supabase'

type TourismCategory = Database['public']['Tables']['tourism_categories']['Row'] & {
  experience_count?: number
}

interface TourismCategorySidebarProps {
  categories: TourismCategory[]
  currentCategorySlug?: string
}

// Map icon names to actual Lucide components
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

export function TourismCategorySidebar({ categories, currentCategorySlug }: TourismCategorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {!isCollapsed && (
            <Link href="/tourism" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Plane className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                Explore Guyana
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
        <nav className="overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="p-2">
            {/* All Experiences Link */}
            <Link
              href="/tourism"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                pathname === '/tourism' && !currentCategorySlug
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                <Plane
                  className={`h-5 w-5 ${pathname === '/tourism' && !currentCategorySlug ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`}
                  strokeWidth={2}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">All Experiences</div>
                  <div className={`text-xs ${pathname === '/tourism' && !currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
                    Browse everything
                  </div>
                </div>
              )}
            </Link>

            {/* Category Links */}
            {categories.map((category) => {
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Plane : Plane
              const isActive = currentCategorySlug === category.slug

              return (
                <Link
                  key={category.id}
                  href={`/tourism/category/${category.slug}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
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
                      {category.experience_count !== undefined && (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {category.experience_count} {category.experience_count === 1 ? 'experience' : 'experiences'}
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
