import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TourismFormClient } from '@/components/forms/tourism/TourismFormClient'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminCreateTourismPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all tourism categories
  const { data: categories } = await supabase
    .from('tourism_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Fetch all regions
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Create Tourism Experience"
        subtitle="Add a new tourism experience or attraction"
      />

      <div className="px-4 lg:px-8 py-6">
        <Link
          href="/admin/tourism"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tourism
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <TourismFormClient
            userId={user.id}
            categories={categories || []}
            regions={regions || []}
            redirectPath="/admin/tourism"
          />
        </div>
      </div>
    </div>
  )
}
