'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronLeft, Calendar, Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, type LucideIcon } from 'lucide-react'
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
const iconMap: Record<string, LucideIcon> = {
  Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, Calendar
}

export function EventCategorySidebar({ categories, currentCategorySlug }: EventCategorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar - starts below header (h-20 + border) */}
      <aside
        className={`hidden lg:block fixed left-0 top-[81px] h-[calc(100vh-81px)] bg-gradient-to-b from-white to-emerald-50/30 border-r border-emerald-100 shadow-xl shadow-emerald-900/5 z-40 transition-all duration-500 ease-out ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-emerald-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm">
          {!isCollapsed && (
            <Link href="/events" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Calendar className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-semibold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                Event Types
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200 ml-auto border border-transparent hover:border-emerald-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-emerald-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-emerald-600" />
            )}
          </button>
        </div>

        {/* Categories List */}
        <nav className="overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin">
          <div className="p-3">
            {/* All Events Link */}
            <Link
              href="/events"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 mb-2 group ${
                pathname === '/events' && !currentCategorySlug
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-emerald-50 text-gray-700 border border-transparent hover:border-emerald-200'
              }`}
            >
              <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                <div className={`p-2 rounded-lg ${
                  pathname === '/events' && !currentCategorySlug
                    ? 'bg-white/20'
                    : 'bg-emerald-100 group-hover:bg-emerald-200'
                } transition-colors`}>
                  <Calendar
                    className={`h-4 w-4 ${pathname === '/events' && !currentCategorySlug ? 'text-white' : 'text-emerald-600'}`}
                    strokeWidth={2}
                  />
                </div>
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

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent my-3" />

            {/* Category Links */}
            {categories.map((category) => {
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Calendar : Calendar
              const isActive = currentCategorySlug === category.slug

              return (
                <Link
                  key={category.id}
                  href={`/events/category/${category.slug}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1.5 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'hover:bg-emerald-50 text-gray-700 border border-transparent hover:border-emerald-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                    <div className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-emerald-100'
                    } transition-colors`}>
                      <IconComponent
                        className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-600'}`}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.name}</div>
                      {category.event_count !== undefined && (
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {category.event_count} {category.event_count === 1 ? 'event' : 'events'}
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
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-500 ${isCollapsed ? 'w-20' : 'w-72'}`} />
    </>
  )
}
