import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BusinessCreateForm } from '@/components/BusinessCreateForm'

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
          <h1 className="text-2xl font-bold text-gray-900">Create Your Business Listing</h1>
          <p className="text-gray-600 mt-1">
            Fill out the form below to add your business to Guyana Directory
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <BusinessCreateForm
            userId={user.id}
            categories={categories || []}
            regions={regions || []}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Your business will be listed immediately on Guyana Directory</li>
            <li>Customers can find you through search and category browsing</li>
            <li>They can contact you directly via WhatsApp</li>
            <li>You can manage your listing, add photos, and track analytics from your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
