'use client'

import Link from 'next/link'
import { useState } from 'react'
import { X, Calendar, Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, Grid3x3, type LucideIcon } from 'lucide-react'
import { Database } from '@/types/supabase'

type EventCategory = Database['public']['Tables']['event_categories']['Row'] & {
  event_count?: number
}

interface MobileEventCategoryDrawerProps {
  categories: EventCategory[]
  currentCategorySlug?: string
}

const iconMap: Record<string, LucideIcon> = {
  Music, GraduationCap, Users, PartyPopper, Trophy, Briefcase, Utensils, Palette, Heart, Calendar
}

export function MobileEventCategoryDrawer({ categories, currentCategorySlug }: MobileEventCategoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button - positioned on left to avoid conflict with filter button on right */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-[5.5rem] left-4 z-[60] h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open event categories"
      >
        <Grid3x3 className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-white to-emerald-50/30 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-emerald-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900">Event Categories</h2>
            <p className="text-sm text-gray-600">Browse all event types</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {/* All Events */}
          <Link
            href="/events"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
              !currentCategorySlug
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'hover:bg-emerald-50 text-gray-700 border border-transparent hover:border-emerald-200'
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              !currentCategorySlug ? 'bg-white/20' : 'bg-emerald-100'
            }`}>
              <Calendar className={`h-5 w-5 ${!currentCategorySlug ? 'text-white' : 'text-emerald-600'}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">All Events</div>
              <div className={`text-xs ${!currentCategorySlug ? 'text-white/80' : 'text-gray-500'}`}>
                Browse everything
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent my-3" />

          {/* Category Items */}
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Calendar : Calendar
            const isActive = currentCategorySlug === category.slug

            return (
              <Link
                key={category.id}
                href={`/events/category/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'hover:bg-emerald-50 text-gray-700 border border-transparent hover:border-emerald-200'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{category.name}</div>
                  {category.event_count !== undefined && (
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.event_count} {category.event_count === 1 ? 'event' : 'events'}
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
