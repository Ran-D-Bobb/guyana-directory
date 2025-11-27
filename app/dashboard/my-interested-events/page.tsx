import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, ChevronLeft, Eye, Calendar, Clock } from 'lucide-react'
import { EventCard } from '@/components/EventCard'

export const metadata = {
  title: 'My Interested Events - Waypoint',
  description: 'View all events you have marked as interested in',
}

export default async function MyInterestedEventsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch events user is interested in
  const { data: interestedEventsData, error } = await supabase
    .from('event_interests')
    .select(`
      event_id,
      created_at,
      events:event_id (
        *,
        event_categories:category_id (name, slug, icon),
        businesses:business_id (name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching interested events:', error)
  }

  const interestedEvents = interestedEventsData?.map(ei => ei.events).filter(Boolean) || []

  // Separate into upcoming and past events
  const now = new Date()
  const upcomingEvents = interestedEvents.filter(e => new Date(e.start_date) >= now)
  const pastEvents = interestedEvents.filter(e => new Date(e.start_date) < now)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
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
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Interested Events</h1>
              <p className="text-purple-100">
                {interestedEvents.length} event{interestedEvents.length !== 1 ? 's' : ''} you&apos;re interested in
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {interestedEvents.length > 0 ? (
          <div className="space-y-10">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Past Events ({pastEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-6">
              <Star className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No interested events yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Browse events and click &quot;Interested&quot; to save them here. You&apos;ll be able to quickly find all your saved events in one place.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Browse Events
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <Calendar className="w-4 h-4" />
            Browse All Events
          </Link>
          <Link
            href="/dashboard/my-events"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <Star className="w-4 h-4" />
            Manage My Events
          </Link>
        </div>
      </main>
    </div>
  )
}
