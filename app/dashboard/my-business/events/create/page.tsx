import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { BusinessEventCreateForm } from '@/components/BusinessEventCreateForm'

export default async function CreateBusinessEventPage() {
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

  // Fetch business event types
  const { data: eventTypes } = await supabase
    .from('business_event_types')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/my-business/events"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Create Business Event</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Promote a sale, discount, happy hour, or special offer
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <BusinessEventCreateForm
            business={business}
            eventTypes={eventTypes || []}
          />
        </div>
      </main>
    </div>
  )
}
