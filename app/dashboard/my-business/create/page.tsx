import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessFormClient } from '@/components/forms/business/BusinessFormClient'

export default async function CreateBusinessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existingBusiness) {
    // User already has a business, redirect to dashboard
    redirect('/dashboard/my-business')
  }

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  // Fetch all regions
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BusinessFormClient
        userId={user.id}
        categories={categories || []}
        regions={regions || []}
      />
    </div>
  )
}
