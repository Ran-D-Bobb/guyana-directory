import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PhotoUpload } from '@/components/PhotoUpload'
import { requireBusinessAccount } from '@/lib/account-type'

export default async function BusinessPhotosPage() {
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
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (businessError || !business) {
    console.error('Error fetching business:', businessError)
    redirect('/dashboard/my-business')
  }

  // Fetch business photos
  const { data: photos } = await supabase
    .from('business_photos')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Business Photos</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage photos for {business.name}
          </p>
        </div>

        {/* Photo Upload Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <PhotoUpload
            businessId={business.id}
            existingPhotos={(photos || []).map(p => ({
              id: p.id,
              image_url: p.image_url,
              display_order: p.display_order ?? 0,
              is_primary: p.is_primary ?? false
            }))}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Tips for great photos:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use high-quality, well-lit images</li>
            <li>The primary photo will be shown first on your business page</li>
            <li>Show your products, services, or storefront</li>
            <li>Avoid blurry or dark images</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
