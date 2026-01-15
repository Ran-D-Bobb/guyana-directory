'use client'

import React from 'react'
import { Sparkles, Search } from 'lucide-react'
import { EventCard } from './EventCard'
import { EventCalendar } from './EventCalendar'
import { Database } from '@/types/supabase'

type Event = Database['public']['Tables']['events']['Row'] & {
  event_categories: { name: string; icon: string } | null
  businesses: { name: string; slug: string } | null
  profiles: {
    name: string | null
  } | null
}

interface EventPageClientProps {
  events: Event[]
  searchParams: {
    category?: string
    time?: string
    sort?: string
    q?: string
    region?: string
    view?: string
  }
}

export function EventPageClient({ events, searchParams }: EventPageClientProps) {
  const { q, view = 'grid' } = searchParams
  const featuredCount = events?.filter(e => e.is_featured === true).length || 0

  return (
    <>
      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          {q ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Search className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  Search results for <span className="text-emerald-600 font-semibold">&quot;{q}&quot;</span>
                </p>
                <p className="text-sm text-gray-500">
                  {events.length} {events.length === 1 ? 'event' : 'events'} found
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-gray-900 font-medium text-lg">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </p>
              {featuredCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  {featuredCount} featured
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="animate-fade-in">
          <EventCalendar events={events} />
        </div>
      )}
    </>
  )
}
