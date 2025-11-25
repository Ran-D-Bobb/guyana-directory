import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Compass,
  Eye,
  MessageCircle,
  Star,
  Filter,
  ExternalLink,
  Search,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Sparkles,
  Mountain,
  ArrowUpRight
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { TourismActions } from '@/components/admin/AdminActionButtons'
import { cn } from '@/lib/utils'

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  challenging: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700',
}

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
  const searchQuery = params.q as string | undefined

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

  // Apply search filter client-side
  const filteredExperiences = searchQuery
    ? experiences?.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : experiences

  // Calculate stats
  const totalExperiences = experiences?.length || 0
  const approvedCount = experiences?.filter(e => e.is_approved).length || 0
  const totalViews = experiences?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0
  const totalInquiries = experiences?.reduce((sum, e) => sum + (e.booking_inquiry_count || 0), 0) || 0

  // Check if any filter is active
  const hasActiveFilters = categoryFilter || approvedFilter || featuredFilter || searchQuery

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Tourism Experiences"
        subtitle={`Manage ${totalExperiences} tourism experiences`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Pending Approval Alert */}
        {pendingCount && pendingCount > 0 && (
          <Link
            href="/admin/tourism?approved=false"
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl hover:shadow-lg hover:border-orange-300 transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Pending Approvals</h3>
              <p className="text-sm text-orange-700">
                {pendingCount} experience{pendingCount !== 1 ? 's' : ''} waiting for your review
              </p>
            </div>
            <ArrowUpRight className="text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={20} />
          </Link>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Experiences"
            value={totalExperiences}
            icon="Compass"
            color="cyan"
            size="sm"
          />
          <AdminStatCard
            label="Approved"
            value={approvedCount}
            icon="CheckCircle"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Pending"
            value={pendingCount || 0}
            icon="Clock"
            color="orange"
            size="sm"
          />
          <AdminStatCard
            label="Total Views"
            value={totalViews}
            icon="Eye"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Inquiries"
            value={totalInquiries}
            icon="MessageCircle"
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
                  placeholder="Search experiences..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <select
                name="category"
                defaultValue={categoryFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-w-[180px]"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Approved Filter */}
              <select
                name="approved"
                defaultValue={approvedFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-w-[160px]"
              >
                <option value="">All Status</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>

              {/* Featured Filter */}
              <select
                name="featured"
                defaultValue={featuredFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-w-[140px]"
              >
                <option value="">All Listings</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/tourism"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {filteredExperiences?.length || 0} experiences
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Experience List */}
          <div className="divide-y divide-slate-100">
            {filteredExperiences && filteredExperiences.length > 0 ? (
              filteredExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className={cn(
                    'p-4 transition-colors',
                    !experience.is_approved ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-slate-50/50'
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Link
                          href={`/tourism/${experience.slug}`}
                          target="_blank"
                          className="group text-lg font-semibold text-slate-900 hover:text-cyan-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {experience.name}
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {!experience.is_approved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {experience.is_approved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              <CheckCircle size={12} />
                              Approved
                            </span>
                          )}
                          {experience.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Sparkles size={12} />
                              Featured
                            </span>
                          )}
                          {experience.difficulty_level && (
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                              difficultyColors[experience.difficulty_level as keyof typeof difficultyColors]
                            )}>
                              <Mountain size={12} />
                              {experience.difficulty_level}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Compass size={14} className="text-slate-400" />
                          {experience.tourism_categories?.name || 'Uncategorized'}
                        </span>
                        {experience.regions?.name && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            {experience.regions.name}
                          </span>
                        )}
                        {experience.profiles ? (
                          <span className="inline-flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            {experience.profiles.name || experience.profiles.email}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-orange-600">
                            <User size={14} />
                            No operator
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {experience.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {experience.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Eye size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{experience.view_count || 0}</span>
                          views
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <MessageCircle size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{experience.booking_inquiry_count || 0}</span>
                          inquiries
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="font-medium text-slate-700">{experience.rating?.toFixed(1) || '0.0'}</span>
                          ({experience.review_count || 0})
                        </span>
                        {experience.price_from && (
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <span className="font-medium text-slate-700">
                              GYD {experience.price_from.toLocaleString()}
                            </span>
                            /person
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:items-end">
                      <TourismActions
                        experienceId={experience.id}
                        experienceName={experience.name}
                        isApproved={experience.is_approved || false}
                        isFeatured={experience.is_featured || false}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No experiences found</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Tourism experiences created by operators will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
