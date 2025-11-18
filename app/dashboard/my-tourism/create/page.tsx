import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TourismExperienceCreateForm } from '@/components/tourism/TourismExperienceCreateForm'

export default async function CreateTourismExperiencePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/dashboard/my-tourism"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Tourism Experience</h1>
          <p className="text-gray-600 mt-1">
            Add your tourism experience to Guyana Directory and connect with international visitors
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TourismExperienceCreateForm
            userId={user.id}
            categories={categories || []}
            regions={regions || []}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Your tourism experience will be listed on Guyana Directory</li>
            <li>International tourists can discover your experience through search and category browsing</li>
            <li>They can contact you directly via WhatsApp for booking inquiries</li>
            <li>You can manage your listing, add photos, and track analytics from your operator dashboard</li>
            <li>Build your reputation with tourist reviews and ratings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
