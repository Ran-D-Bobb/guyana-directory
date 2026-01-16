import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/')
  }

  // Get counts for sidebar badges
  const [
    { count: pendingTourism },
    { count: flaggedRentals },
    { count: flaggedPhotos },
  ] = await Promise.all([
    supabase
      .from('tourism_experiences')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false),
    supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('is_flagged', true),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('business_photos')
      .select('*', { count: 'exact', head: true })
      .eq('is_flagged', true),
  ])

  return (
    <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-74px)] lg:h-[calc(100vh-74px)] bg-slate-50 lg:flex lg:overflow-hidden">
      <AdminSidebar
        pendingTourism={pendingTourism || 0}
        flaggedRentals={flaggedRentals || 0}
        flaggedPhotos={flaggedPhotos || 0}
      />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 lg:overflow-y-auto pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
