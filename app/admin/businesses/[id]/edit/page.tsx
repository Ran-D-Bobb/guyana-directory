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

  // Get categories, regions, users, and tags for form
  const [{ data: categories }, { data: regions }, { data: users }, { data: tags }, { data: businessTags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('regions').select('*').order('name'),
    supabase.from('profiles').select('id, name, email').order('name'),
    supabase.from('category_tags').select('id, name, slug, category_id').order('display_order'),
    supabase.from('business_tags').select('tag_id').eq('business_id', id),
  ])

  const currentTagIds = businessTags?.map(bt => bt.tag_id) || []

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
        tags={tags || []}
        currentTagIds={currentTagIds}
      />
    </div>
  )
}
