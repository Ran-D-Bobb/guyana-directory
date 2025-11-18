'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronLeft, Calendar, Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart } from 'lucide-react'
import { useState } from 'react'
import { Database } from '@/types/supabase'

type EventCategory = Database['public']['Tables']['event_categories']['Row'] & {
  event_count?: number
}

interface EventCategorySidebarProps {
  categories: EventCategory[]
  currentCategorySlug?: string
}

// Map icon names to actual Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, Calendar
}

export function EventCategorySidebar({ categories, currentCategorySlug }: EventCategorySidebarProps) {
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
            <Link href="/events" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                Event Types
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
            {/* All Events Link */}
            <Link
              href="/events"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                pathname === '/events' && !currentCategorySlug
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                <Calendar
                  className={`h-5 w-5 ${pathname === '/events' && !currentCategorySlug ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'}`}
                  strokeWidth={2}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">All Events</div>
                  <div className={`text-xs ${pathname === '/events' && !currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
                    Browse everything
                  </div>
                </div>
              )}
            </Link>

            {/* Category Links */}
            {categories.map((category) => {
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Calendar : Calendar
              const isActive = currentCategorySlug === category.slug

              return (
                <Link
                  key={category.id}
                  href={`/events/category/${category.slug}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                    <IconComponent
                      className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'}`}
                      strokeWidth={2}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{category.name}</div>
                      {category.event_count !== undefined && (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {category.event_count} {category.event_count === 1 ? 'event' : 'events'}
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
