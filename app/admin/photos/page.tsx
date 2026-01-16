import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import Image from 'next/image'
import {
  ImageIcon,
  Building2,
  Calendar,
  Flag,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { PhotoActions } from '@/components/admin/AdminActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; minFlags?: string }>
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/admin')
  }

  const params = await searchParams
  const searchQuery = params.q
  const minFlagsFilter = params.minFlags

  // Get flagged photos with business info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('business_photos')
    .select(`
      id,
      image_url,
      is_primary,
      flag_count,
      is_flagged,
      created_at,
      business:business_id (
        id,
        name,
        slug
      )
    `)
    .eq('is_flagged', true)
    .order('flag_count', { ascending: false })

  // Apply minimum flags filter
  if (minFlagsFilter) {
    const minFlags = parseInt(minFlagsFilter)
    if (minFlags > 0) {
      query = query.gte('flag_count', minFlags)
    }
  }

  const { data: flaggedPhotos, error } = await query

  if (error) {
    console.error('Error fetching flagged photos:', error)
  }

  // Get total flagged photos count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalFlagged } = await (supabase as any)
    .from('business_photos')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)

  // Get high priority (3+ flags) count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: highPriorityCount } = await (supabase as any)
    .from('business_photos')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)
    .gte('flag_count', 3)

  // Apply search filter client-side
  const filteredPhotos = searchQuery
    ? flaggedPhotos?.filter((p: { business?: { name?: string } }) =>
        p.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : flaggedPhotos

  // Check if any filter is active
  const hasActiveFilters = searchQuery || minFlagsFilter

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Flagged Photos"
        subtitle={`Review ${totalFlagged || 0} flagged photos`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* High Priority Alert */}
        {(highPriorityCount || 0) > 0 && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">High Priority Photos</h3>
              <p className="text-sm text-red-700">
                {highPriorityCount} photo{highPriorityCount !== 1 ? 's' : ''} flagged 3+ times require immediate attention
              </p>
            </div>
            <Link
              href="/admin/photos?minFlags=3"
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              View High Priority
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Flagged"
            value={totalFlagged || 0}
            icon="Flag"
            color="orange"
            size="sm"
          />
          <AdminStatCard
            label="High Priority (3+)"
            value={highPriorityCount || 0}
            icon="AlertTriangle"
            color="red"
            size="sm"
          />
          <AdminStatCard
            label="Reviewed Today"
            value={0}
            icon="CheckCircle"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Pending Review"
            value={totalFlagged || 0}
            icon="Clock"
            color="blue"
            size="sm"
          />
        </div>

        {/* Filters & Photos List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <form className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by business name..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Min Flags Filter */}
              <select
                name="minFlags"
                defaultValue={minFlagsFilter || ''}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all min-w-[150px]"
              >
                <option value="">All Flags</option>
                <option value="2">2+ Flags</option>
                <option value="3">3+ Flags</option>
                <option value="5">5+ Flags</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Filter size={16} className="inline mr-2" />
                  Apply
                </button>
                {hasActiveFilters && (
                  <Link
                    href="/admin/photos"
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
              Showing {filteredPhotos?.length || 0} flagged photos
              {hasActiveFilters && ' (filtered)'}
            </span>
          </div>

          {/* Photos Grid */}
          <div className="p-4">
            {filteredPhotos && filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPhotos.map((photo: {
                  id: string
                  image_url: string
                  is_primary: boolean
                  flag_count: number
                  created_at: string
                  business?: { id: string; name: string; slug: string }
                }) => (
                  <div
                    key={photo.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Photo Preview */}
                    <div className="relative aspect-video bg-slate-100">
                      <Image
                        src={photo.image_url}
                        alt={`Photo for ${photo.business?.name || 'Unknown business'}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Flag Count Badge */}
                      <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        photo.flag_count >= 3
                          ? 'bg-red-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}>
                        <Flag size={12} />
                        {photo.flag_count} flag{photo.flag_count !== 1 ? 's' : ''}
                      </div>
                      {photo.is_primary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                          Primary
                        </div>
                      )}
                    </div>

                    {/* Photo Info */}
                    <div className="p-4">
                      {/* Business Link */}
                      <Link
                        href={`/businesses/${photo.business?.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 text-slate-900 font-medium hover:text-emerald-600 transition-colors mb-2"
                      >
                        <Building2 size={16} className="text-slate-400" />
                        {photo.business?.name || 'Unknown Business'}
                        <ExternalLink size={12} className="opacity-50" />
                      </Link>

                      {/* Upload Date */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Calendar size={14} />
                        Uploaded {formatDate(photo.created_at)}
                      </div>

                      {/* Actions */}
                      <PhotoActions
                        photoId={photo.id}
                        businessName={photo.business?.name || 'Unknown Business'}
                        imageUrl={photo.image_url}
                        flagCount={photo.flag_count}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No flagged photos</h3>
                <p className="text-slate-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'All photos have been reviewed. Check back later!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
