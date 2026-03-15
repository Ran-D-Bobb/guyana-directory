import { createClient } from '@/lib/supabase/server'
import { EventsTimeline } from '@/components/EventsTimeline'

export const metadata = {
  title: 'Annual Events Timeline | Discover Guyana',
  description: 'Journey through Guyana\'s most celebrated festivals and events throughout the year. From Mashramani to Diwali, experience the rhythm and color of our nation.',
}

export default async function EventsTimelinePage() {
  const supabase = await createClient()

  // Fetch active timeline events ordered by display_order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timelineEvents } = await (supabase as any)
    .from('timeline_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return <EventsTimeline events={timelineEvents || []} />
}
