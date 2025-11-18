import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Plus, Eye, MessageCircle, ChevronLeft, Pencil } from 'lucide-react'
import { BusinessEventDeleteButton } from '@/components/BusinessEventDeleteButton'

export default async function BusinessEventsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard/my-business')
  }

  // Fetch business events
  const { data: events } = await supabase
    .from('business_events')
    .select(`
      *,
      business_event_types:event_type_id (name, icon)
    `)
    .eq('business_id', business.id)
    .order('start_date', { ascending: false })

  // Calculate stats
  const now = new Date().toISOString()
  const upcomingEvents = events?.filter(e => e.start_date > now) || []
  const totalViews = events?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/my-business"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8" />
                <h1 className="text-4xl font-bold">Business Events</h1>
              </div>
              <p className="text-purple-100 text-lg">
                Manage promotional events and offers for {business.name}
              </p>
            </div>
            <Link
              href="/dashboard/my-business/events/create"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {totalViews}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
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

                        {event.business_event_types && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">
                              {event.business_event_types.name}
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
                        </div>

                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{event.view_count || 0} views</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/dashboard/my-business/events/${event.id}/edit`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                        <BusinessEventDeleteButton eventId={event.id} />
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
              Create promotional events like sales, discounts, happy hours, and special offers
            </p>
            <Link
              href="/dashboard/my-business/events/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
