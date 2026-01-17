import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { TourismVideosAdminClient } from '@/components/admin/TourismVideosAdminClient'

export default async function AdminTourismVideosPage() {
  const supabase = await createClient()

  // Fetch all tourism hero videos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: heroVideos } = await (supabase as any)
    .from('tourism_hero_videos')
    .select('*')
    .order('display_order', { ascending: true })

  // Calculate stats
  const totalVideos = heroVideos?.length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeVideos = heroVideos?.filter((v: any) => v.is_active).length || 0

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Tourism Hero Videos"
        subtitle="Manage videos displayed in the tourism page hero section"
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Videos"
            value={totalVideos}
            icon="Video"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Active"
            value={activeVideos}
            icon="Eye"
            color="emerald"
            size="sm"
          />
        </div>

        {/* Tourism Videos Management */}
        <TourismVideosAdminClient initialVideos={heroVideos || []} />
      </div>
    </div>
  )
}
