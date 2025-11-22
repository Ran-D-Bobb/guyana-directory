'use client'

import React from 'react'
import { Grid, CalendarDays } from 'lucide-react'
import Link from 'next/link'
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
  const { category, time, sort, q, region, view = 'grid' } = searchParams
  const featuredCount = events?.filter(e => e.is_featured === true).length || 0

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-gray-900 font-medium text-lg">
            {q && (
              <span className="mr-2">
                Search results for <span className="text-purple-600 font-semibold">&quot;{q}&quot;</span>
              </span>
            )}
            {!q && (
              <span className="text-gray-900">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            )}
            {q && (
              <span className="block text-sm text-gray-500 mt-1">
                {events.length} {events.length === 1 ? 'event' : 'events'} found
              </span>
            )}
          </p>
          {featuredCount > 0 && !q && (
            <p className="text-sm text-amber-600 font-medium mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {featuredCount} featured {featuredCount === 1 ? 'event' : 'events'}
            </p>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-sm border border-gray-200">
          <Link
            href={`/events?${new URLSearchParams(
              Object.fromEntries(
                Object.entries({ category, time, sort, q, region, view: 'grid' })
                  .filter(([, v]) => v && v !== 'grid')
                  .map(([k, v]) => [k, String(v)])
              )
            ).toString()}`}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${view === 'grid'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}
            `}
          >
            <Grid className="w-4 h-4" />
            Grid
          </Link>
          <Link
            href={`/events?${new URLSearchParams(
              Object.fromEntries(
                Object.entries({ category, time, sort, q, region, view: 'calendar' })
                  .filter(([, v]) => v)
                  .map(([k, v]) => [k, String(v)])
              )
            ).toString()}`}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${view === 'calendar'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}
            `}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </Link>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
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
