import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Filter,
  Eye,
  Star,
  Edit,
  ExternalLink,
  Search,
  MapPin,
  User,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { BusinessActions } from '@/components/admin/AdminActionButtons'

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
  const searchQuery = params.q as string | undefined

  // Build query
  let query = supabase
    .from('businesses')
    .select(`
      *,
      categories(name, icon),
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

  // Apply search filter client-side
  const filteredBusinesses = searchQuery
    ? businesses?.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : businesses

  // Calculate stats
  const totalBusinesses = businesses?.length || 0
  const verifiedCount = businesses?.filter(b => b.is_verified).length || 0
  const featuredCount = businesses?.filter(b => b.is_featured).length || 0
  const totalViews = businesses?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0

  // Check if any filter is active
  const hasActiveFilters = categoryFilter || verifiedFilter || featuredFilter || searchQuery

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Businesses"
        subtitle={`Manage your ${totalBusinesses} business listings`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Businesses"
            value={totalBusinesses}
            icon="Building2"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Verified"
            value={verifiedCount}
            icon="CheckCircle"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Featured"
            value={featuredCount}
            icon="Sparkles"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Total Views"
            value={totalViews}
            icon="Eye"
            color="purple"
            size="sm"
          />
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search businesses..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <select
                name="category"
                defaultValue={categoryFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all min-w-[180px]"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Verified Filter */}
              <select
                name="verified"
                defaultValue={verifiedFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>

              {/* Featured Filter */}
              <select
                name="featured"
                defaultValue={featuredFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Listings</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/businesses"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear
                  </Link>
                )}
              </div>

              {/* Add Button */}
              <Link
                href="/admin/businesses/create"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2 justify-center"
              >
                <Plus size={16} />
                Add Business
              </Link>
            </form>
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {filteredBusinesses?.length || 0} businesses
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Business List */}
          <div className="divide-y divide-slate-100">
            {filteredBusinesses && filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Link
                          href={`/businesses/${business.slug}`}
                          target="_blank"
                          className="group text-lg font-semibold text-slate-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {business.name}
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {business.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <CheckCircle size={12} />
                              Verified
                            </span>
                          )}
                          {business.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Sparkles size={12} />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-400" />
                          {business.categories?.name || 'Uncategorized'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          {business.regions?.name || 'Unknown'}
                        </span>
                        {business.profiles ? (
                          <span className="inline-flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            {business.profiles.name || business.profiles.email}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-orange-600">
                            <User size={14} />
                            No owner
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {business.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {business.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Eye size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{business.view_count || 0}</span>
                          views
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="font-medium text-slate-700">{business.rating?.toFixed(1) || '0.0'}</span>
                          ({business.review_count || 0})
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:items-end">
                      <Link
                        href={`/admin/businesses/${business.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit size={14} />
                        Edit Details
                      </Link>
                      <BusinessActions
                        businessId={business.id}
                        businessName={business.name}
                        isVerified={business.is_verified || false}
                        isFeatured={business.is_featured || false}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No businesses found</h3>
                <p className="text-slate-500 mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by adding your first business'}
                </p>
                <Link
                  href="/admin/businesses/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add Business
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
