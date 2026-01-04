import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { EventEditForm } from '@/components/EventEditForm'

interface EditEventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the event
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name, icon),
      businesses:business_id (name, slug)
    `)
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  // Check if user owns this event
  if (event.user_id !== user.id) {
    redirect('/dashboard/my-events')
  }

  // Fetch event categories
  const { data: eventCategories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  // Fetch user's businesses (if any)
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
            <h1 className="text-4xl font-bold">Edit Event</h1>
          </div>
          <p className="text-purple-100 text-lg">Update your event details</p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <EventEditForm
            event={{
              id: event.id,
              title: event.title,
              description: event.description ?? '',
              start_date: event.start_date,
              end_date: event.end_date,
              location: event.location,
              category_id: event.category_id ?? '',
              business_id: event.business_id,
              phone: event.whatsapp_number,
              email: event.email,
              image_url: event.image_url
            }}
            eventCategories={(eventCategories || []).map(cat => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon ?? ''
            }))}
            userBusinesses={userBusinesses || []}
          />
        </div>
      </main>
    </div>
  )
}
