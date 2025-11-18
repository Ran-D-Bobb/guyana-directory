import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdminTourismActions } from '@/components/admin/AdminTourismActions'
import { Eye, MessageCircle, Star, MapPin } from 'lucide-react'

export default async function AdminTourismPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Get filter parameters
  const categoryFilter = params.category as string | undefined
  const approvedFilter = params.approved as string | undefined
  const featuredFilter = params.featured as string | undefined

  // Build query
  let query = supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories(name),
      regions(name),
      profiles(name, email)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (categoryFilter) {
    query = query.eq('tourism_category_id', categoryFilter)
  }
  if (approvedFilter === 'true') {
    query = query.eq('is_approved', true)
  } else if (approvedFilter === 'false') {
    query = query.eq('is_approved', false)
  }
  if (featuredFilter === 'true') {
    query = query.eq('is_featured', true)
  } else if (featuredFilter === 'false') {
    query = query.eq('is_featured', false)
  }

  const { data: experiences } = await query

  // Get categories for filter
  const { data: categories } = await supabase
    .from('tourism_categories')
    .select('*')
    .order('name')

  // Count pending approvals
  const { count: pendingCount } = await supabase
    .from('tourism_experiences')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Tourism Experiences</h1>
          <p className="text-gray-600">
            {experiences?.length || 0} total experiences
            {pendingCount && pendingCount > 0 && (
              <span className="ml-2 text-orange-600 font-semibold">
                • {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              defaultValue={categoryFilter || ''}
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approved"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              defaultValue={approvedFilter || ''}
            >
              <option value="">All</option>
              <option value="true">Approved Only</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured
            </label>
            <select
              name="featured"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              defaultValue={featuredFilter || ''}
            >
              <option value="">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/tourism"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      {pendingCount && pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                Pending Approvals
              </h3>
              <p className="text-sm text-orange-700">
                {pendingCount} experience{pendingCount !== 1 ? 's' : ''} waiting for approval
              </p>
            </div>
            <Link
              href="/admin/tourism?approved=false"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Review Pending
            </Link>
          </div>
        </div>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {experiences && experiences.length > 0 ? (
          experiences.map((experience) => (
            <div
              key={experience.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/tourism/${experience.slug}`}
                      className="text-xl font-bold text-gray-900 hover:text-emerald-600"
                      target="_blank"
                    >
                      {experience.name}
                    </Link>
                    <div className="flex gap-2">
                      {!experience.is_approved && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">
                          Pending
                        </span>
                      )}
                      {experience.is_approved && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                      {experience.is_featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                      {experience.is_verified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{experience.tourism_categories?.name}</span>
                    {experience.regions?.name && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {experience.regions.name}
                        </span>
                      </>
                    )}
                    {experience.difficulty_level && (
                      <>
                        <span>•</span>
                        <span className={`font-medium ${
                          experience.difficulty_level === 'easy' ? 'text-green-600' :
                          experience.difficulty_level === 'moderate' ? 'text-yellow-600' :
                          experience.difficulty_level === 'challenging' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {experience.difficulty_level.charAt(0).toUpperCase() + experience.difficulty_level.slice(1)}
                        </span>
                      </>
                    )}
                  </div>
                  {experience.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {experience.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {experience.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {experience.booking_inquiry_count || 0} inquiries
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {experience.rating?.toFixed(1) || '0.0'} ({experience.review_count || 0}{' '}
                      reviews)
                    </span>
                  </div>
                  {experience.price_from && (
                    <p className="text-sm text-gray-500 mt-2">
                      From GYD {experience.price_from.toLocaleString()} per person
                    </p>
                  )}
                  {experience.profiles && (
                    <p className="text-sm text-gray-500 mt-2">
                      Operator: {experience.profiles.name} ({experience.profiles.email})
                    </p>
                  )}
                  {!experience.operator_id && (
                    <p className="text-sm text-orange-600 mt-2">
                      No operator (admin-created)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <AdminTourismActions
                    experienceId={experience.id}
                    isApproved={experience.is_approved || false}
                    isFeatured={experience.is_featured || false}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No tourism experiences found</p>
            <p className="text-sm text-gray-400">
              Tourism experiences are created by operators via their dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
