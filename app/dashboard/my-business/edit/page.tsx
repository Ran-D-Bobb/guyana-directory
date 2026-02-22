import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BusinessEditForm } from '@/components/BusinessEditForm'
import { requireBusinessAccount } from '@/lib/account-type'

export default async function EditBusinessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  await requireBusinessAccount(user.id)

  // Fetch user's business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (businessError || !business) {
    console.error('Error fetching business:', businessError)
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

  // Fetch all category tags
  const { data: tags } = await supabase
    .from('category_tags')
    .select('id, name, slug, category_id')
    .order('display_order', { ascending: true })

  // Fetch business's current tags
  const { data: businessTags } = await supabase
    .from('business_tags')
    .select('tag_id')
    .eq('business_id', business.id)

  const currentTagIds = businessTags?.map(bt => bt.tag_id) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/dashboard/my-business"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Business Information</h1>
          <p className="text-gray-600 mt-1">
            Update your business details to help customers find you
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <BusinessEditForm
            business={{
              ...business,
              hours: business.hours as { [day: string]: { open?: string; close?: string; closed?: boolean } } | null
            }}
            categories={categories || []}
            regions={regions || []}
            tags={tags || []}
            currentTagIds={currentTagIds}
          />
        </div>
      </div>
    </div>
  )
}
