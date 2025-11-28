import { createClient } from '@/lib/supabase/server'
import { CategorySidebar } from '@/components/CategorySidebar'
import { CategoryPageClient } from '@/components/CategoryPageClient'
import { MobileCategoryDrawer } from '@/components/MobileCategoryDrawer'
import { MobileFilterSheet } from '@/components/MobileFilterSheet'
import { BusinessFilterPanel } from '@/components/BusinessFilterPanel'
import { getBusinessCategoriesWithCounts } from '@/lib/category-counts'
import { Building2 } from 'lucide-react'

interface BusinessesPageProps {
  searchParams: Promise<{
    category?: string
    region?: string
    sort?: string
    q?: string
  }>
}

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const { category, region, sort = 'featured', q } = await searchParams
  const supabase = await createClient()

  // Fetch all categories with business counts
  const categoriesWithCount = await getBusinessCategoriesWithCounts()

  // Fetch all regions for filters
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  // Build the query for businesses
  let query = supabase
    .from('businesses')
    .select(`
      *,
      categories:category_id (name),
      regions:region_id (name),
      business_photos (
        image_url,
        is_primary
      )
    `)

  // Apply category filter if selected
  if (category && category !== 'all') {
    query = query.eq('category_id', category)
  }

  // Apply region filter if selected
  if (region && region !== 'all') {
    query = query.eq('region_id', region)
  }

  // Apply search filter if query exists
  if (q && q.trim()) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: businesses, error } = await query

  // Log errors for debugging
  if (error) {
    console.error('Businesses query error:', error)
  }

  // Process businesses to extract primary photo
  const businessesWithPhotos = (businesses || []).map(b => ({
    ...b,
    primary_photo: Array.isArray(b.business_photos)
      ? b.business_photos.find(p => p.is_primary)?.image_url || b.business_photos[0]?.image_url || null
      : null
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex pb-0 lg:pb-0">
      {/* Desktop Category Sidebar */}
      <CategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Businesses
                </h2>
                <p className="text-sm text-gray-600">
                  {businessesWithPhotos.length} {businessesWithPhotos.length === 1 ? 'business' : 'businesses'} found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              Discover Local Businesses
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Browse and connect with local businesses across Guyana. Contact them instantly via WhatsApp.
            </p>
          </div>

          {/* Desktop Filter Panel - Sticky */}
          <div className="hidden lg:block sticky top-0 z-30 mb-6">
            <BusinessFilterPanel
              regions={regions || []}
              currentFilters={{
                region,
                sort,
              }}
            />
          </div>

          {/* Business Grid */}
          {businessesWithPhotos && businessesWithPhotos.length > 0 ? (
            <CategoryPageClient businesses={businessesWithPhotos} />
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6">
                <Building2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No businesses found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Try adjusting your filters or check back later for new businesses
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Category Drawer */}
      <MobileCategoryDrawer categories={categoriesWithCount} />

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet regions={regions || []} />
    </div>
  )
}
