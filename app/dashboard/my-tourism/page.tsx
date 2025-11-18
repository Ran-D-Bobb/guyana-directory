import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, MessageCircle, Star, Phone, Edit, Upload, Calendar, Briefcase } from 'lucide-react'

export default async function MyTourismPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch user's tourism experiences
  const { data: experiences, error: experiencesError } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories (
        name,
        slug
      ),
      regions (
        name,
        slug
      )
    `)
    .eq('operator_id', user.id)
    .order('created_at', { ascending: false })

  if (experiencesError) {
    console.error('Error fetching tourism experiences:', experiencesError)
  }

  // If user doesn't have any tourism experiences, show create experience message
  if (!experiences || experiences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Tourism Operator Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have any tourism experiences listed yet. Would you like to add your first experience to Guyana Directory?
            </p>
            <Link
              href="/dashboard/my-tourism/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Tourism Experience
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate aggregate stats across all experiences
  const totalViews = experiences.reduce((sum, exp) => sum + (exp.view_count || 0), 0)
  const totalInquiries = experiences.reduce((sum, exp) => sum + (exp.booking_inquiry_count || 0), 0)
  const totalReviews = experiences.reduce((sum, exp) => sum + (exp.review_count || 0), 0)
  const avgRating = experiences.length > 0
    ? (experiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / experiences.length).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tourism Operator Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your {experiences.length} tourism {experiences.length === 1 ? 'experience' : 'experiences'}
              </p>
            </div>
            <Link
              href="/dashboard/my-tourism/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Add New Experience
            </Link>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
                <p className="text-sm text-gray-600">Booking Inquiries</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experiences List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Tourism Experiences
          </h2>

          <div className="space-y-4">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {experience.name}
                      </h3>
                      {experience.is_verified && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      {experience.is_featured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          ★ Featured
                        </span>
                      )}
                      {experience.is_tourism_authority_approved && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          TA Approved
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span>{experience.tourism_categories?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{experience.regions?.name || 'Region not set'}</span>
                      {experience.duration && (
                        <>
                          <span>•</span>
                          <span>{experience.duration}</span>
                        </>
                      )}
                      {experience.difficulty_level && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{experience.difficulty_level}</span>
                        </>
                      )}
                    </div>

                    {/* Experience Stats */}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{experience.view_count || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">{experience.booking_inquiry_count || 0} inquiries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-gray-600">
                          {experience.rating || 0} ({experience.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/dashboard/my-tourism/${experience.id}/photos`}
                      className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Photos
                    </Link>
                    <Link
                      href={`/dashboard/my-tourism/${experience.id}/edit`}
                      className="inline-flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <Link
                      href={`/tourism/${experience.slug}`}
                      className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
