import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  Star,
  Eye,
  MessageCircle,
  Heart,
  Flag,
  AlertTriangle,
  Home,
  Building2,
  TrendingUp
} from 'lucide-react'
import AdminRentalActions from '@/components/admin/AdminRentalActions'

export const dynamic = 'force-dynamic'

interface RentalWithStats {
  id: string
  name: string
  slug: string
  property_type: string
  category_id: string
  is_featured: boolean
  is_approved: boolean
  is_flagged: boolean
  flag_count: number
  flag_reasons: string[] | null
  view_count: number
  inquiry_count: number
  save_count: number
  rating: number | null
  review_count: number
  rental_categories: {
    name: string
  }
}

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: { category?: string; featured?: string; flagged?: string }
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.email!))) {
    redirect('/admin')
  }

  // Build query
  let query = supabase
    .from('rentals')
    .select(`
      *,
      rental_categories(name)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }
  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (searchParams.featured === 'false') {
    query = query.eq('is_featured', false)
  }
  if (searchParams.flagged === 'true') {
    query = query.eq('is_flagged', true)
  }

  const { data: rentals, error } = await query

  if (error) {
    console.error('Error fetching rentals:', error)
  }

  // Get categories for filter
  const { data: categories } = await supabase
    .from('rental_categories')
    .select('*')
    .order('name')

  // Get flagged rentals count
  const { count: flaggedCount } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)

  // Calculate stats
  const totalRentals = rentals?.length || 0
  const totalViews = rentals?.reduce((sum, r) => sum + r.view_count, 0) || 0
  const totalInquiries = rentals?.reduce((sum, r) => sum + r.inquiry_count, 0) || 0
  const totalSaves = rentals?.reduce((sum, r) => sum + r.save_count, 0) || 0
  const avgRating = rentals?.filter(r => r.rating).length
    ? (rentals.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / rentals.filter(r => r.rating).length).toFixed(1)
    : 'N/A'

  // Separate flagged listings
  const flaggedListings = rentals?.filter(r => r.is_flagged) || []
  const regularListings = rentals?.filter(r => !r.is_flagged) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rental Management</h1>
        <p className="text-gray-600">Manage property listings, review flags, and moderate content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rentals</p>
              <p className="text-2xl font-bold">{totalRentals}</p>
            </div>
            <Home className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Inquiries</p>
              <p className="text-2xl font-bold">{totalInquiries.toLocaleString()}</p>
            </div>
            <MessageCircle className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Saves</p>
              <p className="text-2xl font-bold">{totalSaves.toLocaleString()}</p>
            </div>
            <Heart className="h-10 w-10 text-pink-500" />
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${flaggedCount && flaggedCount > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Flagged</p>
              <p className="text-2xl font-bold text-red-600">{flaggedCount || 0}</p>
            </div>
            <Flag className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Flagged Listings Section */}
      {flaggedListings.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">
              Flagged Listings ({flaggedListings.length})
            </h2>
          </div>
          <p className="text-sm text-red-700 mb-6">
            These listings have been flagged by users and require review. Properties with 5+ flags are auto-hidden.
          </p>

          <div className="space-y-4">
            {flaggedListings.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg p-4 border-2 border-red-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/rentals/${rental.slug}`}
                        target="_blank"
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {rental.name}
                      </Link>
                      {!rental.is_approved && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {rental.rental_categories?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-600">
                          {rental.flag_count} flag{rental.flag_count !== 1 ? 's' : ''}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {rental.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {rental.inquiry_count} inquiries
                      </span>
                    </div>

                    {rental.flag_reasons && rental.flag_reasons.length > 0 && (
                      <div className="bg-red-100 rounded p-2">
                        <p className="text-xs font-semibold text-red-900 mb-1">Flag Reasons:</p>
                        <div className="flex flex-wrap gap-1">
                          {rental.flag_reasons.map((reason, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:ml-4">
                    <AdminRentalActions
                      rentalId={rental.id}
                      rentalName={rental.name}
                      isFeatured={rental.is_featured}
                      isApproved={rental.is_approved}
                      isFlagged={rental.is_flagged}
                      flagCount={rental.flag_count}
                      flagReasons={rental.flag_reasons}
                      onUpdate={() => window.location.reload()}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="border rounded px-3 py-2"
              value={searchParams.category || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.value) {
                  params.set('category', e.target.value)
                } else {
                  params.delete('category')
                }
                window.location.href = `/admin/rentals?${params.toString()}`
              }}
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Featured</label>
            <select
              className="border rounded px-3 py-2"
              value={searchParams.featured || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.value) {
                  params.set('featured', e.target.value)
                } else {
                  params.delete('featured')
                }
                window.location.href = `/admin/rentals?${params.toString()}`
              }}
            >
              <option value="">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          {/* Flagged Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Flagged</label>
            <select
              className="border rounded px-3 py-2"
              value={searchParams.flagged || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.value) {
                  params.set('flagged', e.target.value)
                } else {
                  params.delete('flagged')
                }
                window.location.href = `/admin/rentals?${params.toString()}`
              }}
            >
              <option value="">All</option>
              <option value="true">Flagged Only</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchParams.category || searchParams.featured || searchParams.flagged) && (
            <div className="flex items-end">
              <Link
                href="/admin/rentals"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* All Listings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">All Listings ({regularListings.length})</h2>
        </div>

        {regularListings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No rentals found matching your filters.
          </div>
        ) : (
          <div className="divide-y">
            {regularListings.map((rental) => (
              <div key={rental.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/rentals/${rental.slug}`}
                        target="_blank"
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {rental.name}
                      </Link>
                      {rental.is_featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                      {!rental.is_approved && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {rental.rental_categories?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {rental.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {rental.inquiry_count} inquiries
                      </span>
                      {rental.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {rental.rating.toFixed(1)} ({rental.review_count} reviews)
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {rental.save_count} saves
                      </span>
                    </div>
                  </div>

                  <div className="lg:ml-4">
                    <AdminRentalActions
                      rentalId={rental.id}
                      rentalName={rental.name}
                      isFeatured={rental.is_featured}
                      isApproved={rental.is_approved}
                      isFlagged={rental.is_flagged}
                      flagCount={rental.flag_count}
                      flagReasons={rental.flag_reasons}
                      onUpdate={() => window.location.reload()}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
