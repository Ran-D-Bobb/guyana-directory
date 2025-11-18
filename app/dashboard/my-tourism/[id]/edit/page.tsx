import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TourismExperienceEditForm } from '@/components/tourism/TourismExperienceEditForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTourismExperiencePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch the tourism experience
  const { data: experience, error: experienceError } = await supabase
    .from('tourism_experiences')
    .select('*')
    .eq('id', id)
    .eq('operator_id', user.id) // Ensure user owns this experience
    .single()

  if (experienceError || !experience) {
    console.error('Error fetching tourism experience:', experienceError)
    redirect('/dashboard/my-tourism')
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Tourism Experience</h1>
          <p className="text-gray-600 mt-1">
            Update your experience details to keep tourists informed
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TourismExperienceEditForm
            experience={experience}
            categories={categories || []}
            regions={regions || []}
          />
        </div>
      </div>
    </div>
  )
}
