'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation'
import { Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { EventCard } from './EventCard'

type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  is_featured: boolean | null
  view_count: number | null
  interest_count: number | null
  event_categories: { name: string; icon: string } | null
  businesses: { name: string; slug: string } | null
  profiles: { name: string | null } | null
  source_type?: 'community' | 'business'
  business_slug?: string | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface EventPageClientProps {
  events: Event[]
  searchParams: {
    category?: string
    time?: string
    sort?: string
    q?: string
    region?: string
  }
  pagination?: PaginationInfo
}

export function EventPageClient({ events, searchParams, pagination }: EventPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const nextSearchParams = useNextSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(nextSearchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }
  const { q } = searchParams
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
                {pagination?.totalItems || events.length} {(pagination?.totalItems || events.length) === 1 ? 'Event' : 'Events'}
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

      {/* Events Grid */}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(page => {
              const { currentPage, totalPages } = pagination
              if (totalPages <= 7) return true
              if (page === 1 || page === totalPages) return true
              if (Math.abs(page - currentPage) <= 1) return true
              if (page === currentPage - 2 || page === currentPage + 2) return true
              return false
            })
            .map((page, index, arr) => {
              const showEllipsis = index > 0 && page - arr[index - 1] > 1
              return (
                <span key={page} className="flex items-center">
                  {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => goToPage(page)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                      pagination.currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-current={pagination.currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </span>
              )
            })}

          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      )}

      {/* Page Info */}
      {pagination && pagination.totalItems > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {((pagination.currentPage - 1) * 24) + 1}-{Math.min(pagination.currentPage * 24, pagination.totalItems)} of {pagination.totalItems} events
        </p>
      )}
    </>
  )
}
