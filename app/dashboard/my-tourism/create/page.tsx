import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireBusinessAccount } from '@/lib/account-type'
import { TourismFormClient } from '@/components/forms/tourism/TourismFormClient'

export default async function CreateTourismExperiencePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  await requireBusinessAccount(user.id)

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
    <div className="min-h-screen bg-gray-50">
      <TourismFormClient
        userId={user.id}
        categories={categories || []}
        regions={regions || []}
      />
    </div>
  )
}
