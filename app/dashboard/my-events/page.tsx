import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Plus, Eye, MessageCircle, ChevronLeft, Pencil, Star } from 'lucide-react'
import { EventDeleteButton } from '@/components/EventDeleteButton'

export default async function MyEventsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's events
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug)
    `)
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  // Fetch events user is interested in
  const { data: interestedEventsData } = await supabase
    .from('event_interests')
    .select(`
      event_id,
      events:event_id (
        *,
        event_categories:category_id (name, icon),
        businesses:business_id (name, slug),
        profiles:user_id (name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const interestedEvents = interestedEventsData?.map(ei => ei.events).filter(Boolean) || []

  // Calculate stats
  const now = new Date().toISOString()
  const upcomingEvents = events?.filter(e => e.start_date > now) || []
  const totalViews = events?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
  const totalClicks = events?.reduce((sum, e) => sum + (e.whatsapp_clicks || 0), 0) || 0
  const totalInterest = events?.reduce((sum, e) => sum + (e.interest_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8" />
                <h1 className="text-4xl font-bold">My Events</h1>
              </div>
              <p className="text-purple-100 text-lg">
                Manage your community events and gatherings
              </p>
            </div>
            <Link
              href="/dashboard/my-events/create"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {events?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {upcomingEvents.length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">
                {totalInterest}
              </div>
              <div className="text-sm text-gray-600">Total Interest</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {totalViews}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {totalClicks}
              </div>
              <div className="text-sm text-gray-600">WhatsApp Clicks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => {
              const startDate = new Date(event.start_date)
              const endDate = new Date(event.end_date)
              const isUpcoming = startDate > new Date()
              const isPast = endDate < new Date()
              const isOngoing = !isUpcoming && !isPast

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          {event.is_featured && (
                            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              Upcoming
                            </span>
                          )}
                          {isOngoing && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              Ongoing
                            </span>
                          )}
                          {isPast && (
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              Past
                            </span>
                          )}
                        </div>

                        {event.event_categories && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">
                              {event.event_categories.name}
                            </span>
                          </div>
                        )}

                        {event.businesses && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">
                              Organized by:{' '}
                              <Link
                                href={`/businesses/${event.businesses.slug}`}
                                className="text-purple-600 hover:underline"
                              >
                                {event.businesses.name}
                              </Link>
                            </span>
                          </div>
                        )}

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Start:</span>{' '}
                            {startDate.toLocaleDateString()} at{' '}
                            {startDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div>
                            <span className="font-medium">End:</span>{' '}
                            {endDate.toLocaleDateString()} at{' '}
                            {endDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {event.location && (
                            <div>
                              <span className="font-medium">Location:</span>{' '}
                              {event.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-purple-600" />
                            <span>{event.interest_count || 0} interested</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{event.view_count || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{event.whatsapp_clicks || 0} contacts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/dashboard/my-events/${event.id}/edit`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <EventDeleteButton eventId={event.id} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start sharing community events and gatherings with your neighbors
            </p>
            <Link
              href="/dashboard/my-events/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        )}

        {/* Interested Events Section */}
        {interestedEvents && interestedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-600" />
              Events You&apos;re Interested In ({interestedEvents.length})
            </h2>
            <div className="space-y-4">
              {interestedEvents.map((event) => {
                const startDate = new Date(event.start_date)
                const endDate = new Date(event.end_date)
                const isUpcoming = startDate > new Date()
                const isPast = endDate < new Date()
                const isOngoing = !isUpcoming && !isPast

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            {event.is_featured && (
                              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Upcoming
                              </span>
                            )}
                            {isOngoing && (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Ongoing
                              </span>
                            )}
                            {isPast && (
                              <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Past
                              </span>
                            )}
                          </div>

                          {event.event_categories && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">
                                {event.event_categories.name}
                              </span>
                            </div>
                          )}

                          {event.profiles && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">
                                Organized by: {event.profiles.name}
                              </span>
                            </div>
                          )}

                          {event.businesses && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">
                                Organized by:{' '}
                                <Link
                                  href={`/businesses/${event.businesses.slug}`}
                                  className="text-purple-600 hover:underline"
                                >
                                  {event.businesses.name}
                                </Link>
                              </span>
                            </div>
                          )}

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Start:</span>{' '}
                              {startDate.toLocaleDateString()} at{' '}
                              {startDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div>
                              <span className="font-medium">End:</span>{' '}
                              {endDate.toLocaleDateString()} at{' '}
                              {endDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            {event.location && (
                              <div>
                                <span className="font-medium">Location:</span>{' '}
                                {event.location}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-purple-600" />
                              <span>{event.interest_count || 0} interested</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{event.view_count || 0} views</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/events/${event.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View Event
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
