import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { ChevronLeft, Calendar, Star } from 'lucide-react'
import { AdminEventActions } from '@/components/AdminEventActions'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/')
  }

  // Fetch all general events
  const { data: generalEvents } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name),
      businesses!business_id (name)
    `)
    .order('created_at', { ascending: false })

  // Fetch all business events
  const { data: businessEvents } = await supabase
    .from('business_events')
    .select(`
      *,
      business_event_types!event_type_id (name),
      businesses!business_id (name)
    `)
    .order('created_at', { ascending: false })

  // Calculate stats
  const now = new Date().toISOString()
  const upcomingGeneralEvents = generalEvents?.filter(e => e.start_date > now).length || 0
  const upcomingBusinessEvents = businessEvents?.filter(e => e.start_date > now).length || 0
  const featuredGeneralEvents = generalEvents?.filter(e => e.is_featured).length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Events Management</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Manage community events and business promotional offers
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {generalEvents?.length || 0}
              </div>
              <div className="text-sm text-gray-600">General Events</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {businessEvents?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Business Events</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {upcomingGeneralEvents + upcomingBusinessEvents}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">
                {featuredGeneralEvents}
              </div>
              <div className="text-sm text-gray-600">Featured Events</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* General Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            General Events ({generalEvents?.length || 0})
          </h2>

          {generalEvents && generalEvents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generalEvents.map((event) => {
                    const startDate = new Date(event.start_date)
                    const endDate = new Date(event.end_date)
                    const isUpcoming = startDate > new Date()
                    const isPast = endDate < new Date()

                    return (
                      <tr key={event.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              {event.event_categories && (
                                <div className="text-sm text-gray-500">
                                  {event.event_categories.name}
                                </div>
                              )}
                            </div>
                            {event.is_featured && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            User Event
                          </div>
                          {event.businesses && (
                            <div className="text-sm text-gray-500">
                              {event.businesses.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {startDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {isUpcoming && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Upcoming
                            </span>
                          )}
                          {isPast && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Past
                            </span>
                          )}
                          {!isUpcoming && !isPast && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Ongoing
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <AdminEventActions
                            eventId={event.id}
                            isFeatured={event.is_featured ?? false}
                            eventType="general"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No general events found</p>
            </div>
          )}
        </div>

        {/* Business Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Business Events ({businessEvents?.length || 0})
          </h2>

          {businessEvents && businessEvents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businessEvents.map((event) => {
                    const startDate = new Date(event.start_date)
                    const endDate = new Date(event.end_date)
                    const isUpcoming = startDate > new Date()
                    const isPast = endDate < new Date()

                    return (
                      <tr key={event.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              {event.business_event_types && (
                                <div className="text-sm text-gray-500">
                                  {event.business_event_types.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {event.businesses?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {startDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {isUpcoming && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Upcoming
                            </span>
                          )}
                          {isPast && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Past
                            </span>
                          )}
                          {!isUpcoming && !isPast && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Ongoing
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <AdminEventActions
                            eventId={event.id}
                            isFeatured={false}
                            eventType="business"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No business events found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
