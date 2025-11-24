import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventFormSteps } from '@/components/forms/event/EventFormSteps'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EventFormSteps
        userId={user.id}
        eventCategories={(eventCategories || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon ?? ''
        }))}
        userBusinesses={userBusinesses || []}
      />
    </div>
  )
}
