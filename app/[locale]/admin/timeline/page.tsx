import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { TimelineAdminClient } from '@/components/admin/TimelineAdminClient'

export default async function AdminTimelinePage() {
  const supabase = await createClient()

  // Fetch all timeline events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timelineEvents } = await (supabase as any)
    .from('timeline_events')
    .select('*')
    .order('display_order', { ascending: true })

  // Calculate stats
  const totalEvents = timelineEvents?.length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeEvents = timelineEvents?.filter((e: any) => e.is_active).length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoEvents = timelineEvents?.filter((e: any) => e.media_type === 'video').length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageEvents = timelineEvents?.filter((e: any) => e.media_type === 'image').length || 0

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Events Timeline"
        subtitle="Manage the annual events timeline carousel"
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Events"
            value={totalEvents}
            icon="Calendar"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Active"
            value={activeEvents}
            icon="Eye"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="With Video"
            value={videoEvents}
            icon="Video"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="With Image"
            value={imageEvents}
            icon="Image"
            color="yellow"
            size="sm"
          />
        </div>

        {/* Timeline Events Management */}
        <TimelineAdminClient initialEvents={timelineEvents || []} />
      </div>
    </div>
  )
}
