import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TourismPhotoUpload } from '@/components/tourism/TourismPhotoUpload'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TourismPhotosPage({ params }: PageProps) {
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
    .select('id, name')
    .eq('id', id)
    .eq('operator_id', user.id) // Ensure user owns this experience
    .single()

  if (experienceError || !experience) {
    console.error('Error fetching tourism experience:', experienceError)
    redirect('/dashboard/my-tourism')
  }

  // Fetch tourism photos
  const { data: photos } = await supabase
    .from('tourism_photos')
    .select('*')
    .eq('experience_id', experience.id)
    .order('display_order', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Experience Photos</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage photos for {experience.name}
          </p>
        </div>

        {/* Photo Upload Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TourismPhotoUpload experienceId={experience.id} existingPhotos={photos || []} />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">Tips for great tourism photos:</h3>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Use high-quality, vibrant images that showcase your experience</li>
            <li>The primary photo will be shown first on your experience page and in search results</li>
            <li>Include photos of scenery, activities, wildlife, or cultural experiences</li>
            <li>Show tourists what they can expect to see and do</li>
            <li>Use natural lighting and avoid blurry or overly edited images</li>
            <li>Upload up to 10 photos to give visitors a comprehensive view</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
