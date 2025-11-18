import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { EventCreateForm } from '@/components/EventCreateForm'

export default async function CreateEventPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch event categories
  const { data: eventCategories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  // Fetch user's businesses (if any) - optional association
  const { data: userBusinesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('owner_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/my-events"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Events
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Create Event</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Share a community event, workshop, festival, or gathering
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <EventCreateForm
            eventCategories={eventCategories || []}
            userBusinesses={userBusinesses || []}
          />
        </div>
      </main>
    </div>
  )
}
