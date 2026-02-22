import { createClient } from '@/lib/supabase/server'
import { AdminBusinessCreateForm } from '@/components/admin/AdminBusinessCreateForm'

export default async function AdminCreateBusinessPage() {
  const supabase = await createClient()

  // Get categories, regions, users, and tags for form
  const [{ data: categories }, { data: regions }, { data: users }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('regions').select('*').order('name'),
    supabase.from('profiles').select('id, name, email').order('name'),
    supabase.from('category_tags').select('id, name, slug, category_id').order('display_order'),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Business</h1>
        <p className="text-gray-600">Create a new business listing</p>
      </div>

      <AdminBusinessCreateForm
        categories={categories || []}
        regions={regions || []}
        users={users || []}
        tags={tags || []}
      />
    </div>
  )
}
