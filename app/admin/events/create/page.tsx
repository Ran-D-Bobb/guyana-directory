import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EventFormSteps } from '@/components/forms/event/EventFormSteps'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminCreateEventPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch event categories
  const { data: eventCategories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  // Fetch all businesses (admin can associate event with any business)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Create Event"
        subtitle="Add a new community event"
      />

      <div className="px-4 lg:px-8 py-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <EventFormSteps
            userId={user.id}
            eventCategories={(eventCategories || []).map(cat => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon ?? ''
            }))}
            userBusinesses={businesses || []}
            redirectPath="/admin/events"
          />
        </div>
      </div>
    </div>
  )
}
