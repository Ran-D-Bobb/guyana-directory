import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import { CategorySidebar } from '@/components/CategorySidebar'
import { CategoryPageClient } from '@/components/CategoryPageClient'
import { MobileCategoryFilterBar } from '@/components/MobileCategoryFilterBar'
import { FollowCategoryButton } from '@/components/FollowCategoryButton'
import { getBusinessCategoriesWithCounts } from '@/lib/category-counts'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data: category } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  if (!category) return { title: 'Category Not Found' }
  const description = category.description || `Find the best ${category.name} businesses in Guyana. Browse listings with reviews, hours, and contact information.`
  return {
    title: `${category.name} Businesses in Guyana`,
    description: description.slice(0, 160),
    alternates: { canonical: `/businesses/category/${slug}` },
    openGraph: {
      title: `${category.name} Businesses in Guyana | Waypoint`,
      description: description.slice(0, 160),
    },
  }
}

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    region?: string
    sort?: string
    rating?: string
    verified?: string
    featured?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { region, sort = 'featured', rating, verified, featured } = await searchParams
  const supabase = await createClient()

  // Fetch the current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  // Check if user is following this category
  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
      .from('followed_categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', category.id)
      .single()
    isFollowing = !!followData
  }

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
    .eq('category_id', category.id)

  // Apply filters
  if (region && region !== 'all') {
    query = query.eq('region_id', region)
  }

  if (rating && rating !== 'all') {
    query = query.gte('rating', parseFloat(rating))
  }

  if (verified === 'true') {
    query = query.eq('is_verified', true)
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  // Apply sorting
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false })
      query = query.order('rating', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
  }

  const { data: businesses } = await query

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
      <CategorySidebar categories={categoriesWithCount} currentCategorySlug={slug} />

      {/* Main Content Area - scrollable on desktop */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-0 lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
        {/* Mobile Header - Sticky */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b-0 px-4 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold text-gray-900">{businessesWithPhotos.length}</span> results
              </p>
            </div>
            <FollowCategoryButton
              categoryId={category.id}
              categoryName={category.name}
              initialIsFollowing={isFollowing}
              userId={user?.id ?? null}
              variant="pill"
              size="sm"
            />
          </div>
        </div>

        {/* Mobile Category & Filter Bar */}
        <MobileCategoryFilterBar
          categories={categoriesWithCount}
          currentCategorySlug={slug}
          regions={regions || []}
          currentFilters={{ region, sort, rating, verified, featured }}
          basePath="/businesses"
          categoryPath="/businesses/category"
        />

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          {/* Category Header - Desktop Only */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-gray-600 max-w-3xl">
                    {category.description}
                  </p>
                )}
              </div>
              <FollowCategoryButton
                categoryId={category.id}
                categoryName={category.name}
                initialIsFollowing={isFollowing}
                userId={user?.id ?? null}
                variant="icon-label"
                size="md"
              />
            </div>
          </div>

          {/* Business Grid with View Controls */}
          <CategoryPageClient businesses={businessesWithPhotos} />
        </main>
      </div>

    </div>
  )
}
