import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireBusinessAccount } from '@/lib/account-type'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, MessageCircle, Star, Edit, Upload, Calendar } from 'lucide-react'

export default async function MyBusinessPage() {
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
    .select(`
      *,
      categories (
        name,
        slug
      ),
      regions (
        name,
        slug
      )
    `)
    .eq('owner_id', user.id)
    .single()

  if (businessError && businessError.code !== 'PGRST116') {
    console.error('Error fetching business:', businessError)
  }

  // If user doesn't have a business, show create listing prompt
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              You don&apos;t have a business listing yet
            </h1>
            <p className="text-gray-600 mb-6">
              Would you like to add your business to Waypoint?
            </p>
            <Link
              href="/dashboard/my-business/create"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create Business Listing
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch business photos
  const { data: photos } = await supabase
    .from('business_photos')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        name
      )
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {business.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>{business.categories?.name}</span>
                <span>•</span>
                <span>{business.regions?.name}</span>
                {business.is_verified && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">✓ Verified</span>
                  </>
                )}
                {business.is_featured && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">★ Featured</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/my-business/events`}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Promotions
              </Link>
              <Link
                href={`/dashboard/my-business/edit`}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Business
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.view_count || 0}
                </p>
                <p className="text-sm text-gray-600">Page Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.rating || 0}
                </p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.review_count || 0}
                </p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Photos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Business Photos ({photos?.length || 0}/3)
              </h2>
              <Link
                href={`/dashboard/my-business/photos`}
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <Upload className="w-4 h-4" />
                Manage Photos
              </Link>
            </div>

            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={photo.image_url}
                      alt="Business"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 150px"
                    />
                    {photo.is_primary && (
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>No photos uploaded yet.</p>
                <Link
                  href={`/dashboard/my-business/photos`}
                  className="text-emerald-600 hover:text-emerald-700 mt-2 inline-block"
                >
                  Upload your first photo
                </Link>
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Reviews
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {review.profiles?.name || 'Anonymous'}
                      </p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {review.created_at && new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No reviews yet.
              </p>
            )}
          </div>
        </div>

        {/* View Public Page Link */}
        <div className="mt-6 text-center">
          <Link
            href={`/businesses/${business.slug}`}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            View Public Business Page →
          </Link>
        </div>
      </div>
    </div>
  )
}
