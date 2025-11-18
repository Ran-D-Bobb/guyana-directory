import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdminBusinessActions } from '@/components/admin/AdminBusinessActions'
import { Edit, Eye, MessageCircle, Star } from 'lucide-react'

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Get filter parameters
  const categoryFilter = params.category as string | undefined
  const verifiedFilter = params.verified as string | undefined
  const featuredFilter = params.featured as string | undefined

  // Build query
  let query = supabase
    .from('businesses')
    .select(`
      *,
      categories(name),
      regions(name),
      profiles(name, email)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter)
  }
  if (verifiedFilter === 'true') {
    query = query.eq('is_verified', true)
  } else if (verifiedFilter === 'false') {
    query = query.eq('is_verified', false)
  }
  if (featuredFilter === 'true') {
    query = query.eq('is_featured', true)
  } else if (featuredFilter === 'false') {
    query = query.eq('is_featured', false)
  }

  const { data: businesses } = await query

  // Get categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Businesses</h1>
          <p className="text-gray-600">
            {businesses?.length || 0} total businesses
          </p>
        </div>
        <Link
          href="/admin/businesses/create"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add New Business
        </Link>
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
              Verified
            </label>
            <select
              name="verified"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              defaultValue={verifiedFilter || ''}
            >
              <option value="">All</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
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
              href="/admin/businesses"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Business List */}
      <div className="space-y-4">
        {businesses && businesses.length > 0 ? (
          businesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/businesses/${business.slug}`}
                      className="text-xl font-bold text-gray-900 hover:text-emerald-600"
                      target="_blank"
                    >
                      {business.name}
                    </Link>
                    <div className="flex gap-2">
                      {business.is_verified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                      {business.is_featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {business.categories?.name} • {business.regions?.name}
                  </p>
                  {business.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {business.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {business.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {business.whatsapp_clicks || 0} clicks
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {business.rating?.toFixed(1) || '0.0'} ({business.review_count || 0}{' '}
                      reviews)
                    </span>
                  </div>
                  {business.profiles && (
                    <p className="text-sm text-gray-500 mt-2">
                      Owner: {business.profiles.name} ({business.profiles.email})
                    </p>
                  )}
                  {!business.owner_id && (
                    <p className="text-sm text-orange-600 mt-2">
                      No owner (admin-created)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/admin/businesses/${business.id}/edit`}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <AdminBusinessActions
                    businessId={business.id}
                    isVerified={business.is_verified || false}
                    isFeatured={business.is_featured || false}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No businesses found</p>
            <Link
              href="/admin/businesses/create"
              className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Your First Business
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
