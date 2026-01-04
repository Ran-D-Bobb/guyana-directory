import { createClient } from '@/lib/supabase/server'
import { CategorySidebar } from '@/components/CategorySidebar'
import { BusinessesPageClient } from '@/components/BusinessesPageClient'
import { MobileCategoryDrawer } from '@/components/MobileCategoryDrawer'
import { MobileFilterSheet } from '@/components/MobileFilterSheet'
import { BusinessFilterPanel } from '@/components/BusinessFilterPanel'
import { getBusinessCategoriesWithCounts } from '@/lib/category-counts'
import { Sparkles, MapPin, TrendingUp } from 'lucide-react'

// Revalidate every 5 minutes - categories and regions don't change often
export const revalidate = 300

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

  // Limit initial page load for performance
  query = query.limit(24)

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

  // Get featured businesses for hero
  const featuredBusinesses = businessesWithPhotos.filter(b => b.is_featured).slice(0, 3)
  const totalBusinesses = businessesWithPhotos.length

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))] flex pb-0 lg:pb-0">
      {/* Desktop Category Sidebar */}
      <CategorySidebar categories={categoriesWithCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">

        {/* Immersive Hero Header */}
        <header className="relative overflow-hidden">
          {/* Background with gradient mesh */}
          <div className="absolute inset-0 gradient-mesh-dark" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--jungle-900))]/95 via-[hsl(var(--jungle-800))]/90 to-[hsl(var(--jungle-700))]/85" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--gold-500))]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--jungle-400))]/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

          {/* Noise overlay */}
          <div className="absolute inset-0 noise-overlay opacity-30" />

          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left: Typography */}
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--gold-500))]/20 border border-[hsl(var(--gold-500))]/30 mb-6">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--gold-400))]" />
                  <span className="text-sm font-medium text-[hsl(var(--gold-300))]">
                    {totalBusinesses} Local Businesses
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-[1.1]">
                  Discover
                  <span className="block text-gradient-gold animate-text-shimmer bg-[length:200%_auto]">
                    Guyana&apos;s Finest
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-[hsl(var(--jungle-200))] max-w-xl mb-8 leading-relaxed">
                  Connect with trusted local businesses across Guyana.
                  From restaurants to services, find exactly what you need
                  and reach out directly.
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--jungle-500))]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[hsl(var(--jungle-300))]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{regions?.length || 0}</div>
                      <div className="text-sm text-[hsl(var(--jungle-300))]">Regions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gold-500))]/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[hsl(var(--gold-400))]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{categoriesWithCount.length}</div>
                      <div className="text-sm text-[hsl(var(--gold-300))]">Categories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Featured Business Cards Stack */}
              {featuredBusinesses.length > 0 && (
                <div className="relative h-64 lg:h-80 hidden md:block animate-fade-up delay-200">
                  {featuredBusinesses.map((business, index) => (
                    <div
                      key={business.id}
                      className="absolute w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105"
                      style={{
                        top: `${index * 20}px`,
                        right: `${index * 30}px`,
                        zIndex: featuredBusinesses.length - index,
                        transform: `rotate(${(index - 1) * 3}deg)`,
                      }}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-[hsl(var(--jungle-600))] to-[hsl(var(--jungle-800))]">
                        {business.primary_photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={business.primary_photo}
                            alt={business.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="text-xs font-medium text-[hsl(var(--gold-400))] mb-1">
                            {business.categories?.name}
                          </div>
                          <h3 className="text-lg font-bold text-white line-clamp-1">
                            {business.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(var(--jungle-50))] to-transparent" />
        </header>

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-screen-2xl mx-auto w-full">

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block sticky top-0 z-30 mb-8">
            <BusinessFilterPanel
              regions={regions || []}
              currentFilters={{
                region,
                sort,
              }}
            />
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl text-[hsl(var(--jungle-900))]">
                {q ? `Results for "${q}"` : 'All Businesses'}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">
                {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'} found
              </p>
            </div>
          </div>

          {/* Business Grid */}
          <BusinessesPageClient businesses={businessesWithPhotos} />
        </main>
      </div>

      {/* Mobile Category Drawer */}
      <MobileCategoryDrawer categories={categoriesWithCount} />

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet regions={regions || []} />
    </div>
  )
}
