import { createClient } from '@/lib/supabase/server'
import { AdminBusinessEditForm } from '@/components/admin/AdminBusinessEditForm'
import { notFound } from 'next/navigation'

export default async function AdminEditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // Get business data
  const { data: business } = await supabase
    .from('businesses')
    .select(`
      *,
      categories(id, name),
      regions(id, name),
      profiles(id, name, email)
    `)
    .eq('id', id)
    .single()

  if (!business) {
    notFound()
  }

  // Get categories, regions, and users for form
  const [{ data: categories }, { data: regions }, { data: users }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('regions').select('*').order('name'),
    supabase.from('profiles').select('id, name, email').order('name'),
  ])

  // Filter users with valid emails
  const validUsers = (users || []).filter((user): user is { id: string; name: string | null; email: string } =>
    user.email !== null
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Business</h1>
        <p className="text-gray-600">{business.name}</p>
      </div>

      <AdminBusinessEditForm
        business={business}
        categories={categories || []}
        regions={regions || []}
        users={validUsers}
      />
    </div>
  )
}
