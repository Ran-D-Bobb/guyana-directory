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
  ] = await Promise.all([
    supabase
      .from('tourism_experiences')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false),
    supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('is_flagged', true),
  ])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        pendingTourism={pendingTourism || 0}
        flaggedRentals={flaggedRentals || 0}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
