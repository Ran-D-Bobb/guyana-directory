import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ChevronLeft, MapPin, Star, Building2, Sparkles, BadgeCheck, Search } from 'lucide-react'
import { SaveBusinessButton } from '@/components/SaveBusinessButton'

export const metadata = {
  title: 'My Favorites - Waypoint',
  description: 'View all businesses you have saved',
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'

export default async function FavoritesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch user's saved businesses
  const { data: savedBusinessesData, error } = await supabase
    .from('saved_businesses')
    .select(`
      id,
      created_at,
      business_id,
      businesses:business_id (
        id,
        name,
        slug,
        description,
        rating,
        review_count,
        is_verified,
        is_featured,
        categories:category_id (name),
        regions:region_id (name),
        business_photos (image_url, is_primary)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved businesses:', error)
  }

  // Process businesses to get primary photos
  const savedBusinesses = (savedBusinessesData || [])
    .filter(sb => sb.businesses)
    .map(sb => {
      const business = sb.businesses as {
        id: string
        name: string
        slug: string
        description: string | null
        rating: number | null
        review_count: number | null
        is_verified: boolean | null
        is_featured: boolean | null
        categories: { name: string } | null
        regions: { name: string } | null
        business_photos: { image_url: string; is_primary: boolean | null }[]
      }
      const photos = business.business_photos || []
      const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || null
      return {
        ...business,
        primary_photo: primaryPhoto,
        saved_at: sb.created_at,
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-rose-100 hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Favorites</h1>
              <p className="text-rose-100">
                {savedBusinesses.length} saved {savedBusinesses.length === 1 ? 'business' : 'businesses'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {savedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBusinesses.map((business) => (
              <div
                key={business.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <Link href={`/businesses/${business.slug}`} className="block">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                      src={business.primary_photo || DEFAULT_BUSINESS_IMAGE}
                      alt={business.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badges - top left */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {business.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full uppercase tracking-wide">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      {business.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wide">
                          <BadgeCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Rating - bottom right */}
                    {business.rating != null && business.rating > 0 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-white">{business.rating.toFixed(1)}</span>
                        {business.review_count != null && business.review_count > 0 && (
                          <span className="text-[10px] text-white/70">({business.review_count})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category */}
                    {business.categories && (
                      <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">
                        {business.categories.name}
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="font-semibold text-lg text-gray-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {business.name}
                    </h3>

                    {/* Location */}
                    {business.regions && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{business.regions.name}</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Remove button - positioned absolutely */}
                <div className="absolute top-3 right-3 z-10">
                  <SaveBusinessButton
                    businessId={business.id}
                    initialIsSaved={true}
                    userId={user.id}
                    variant="overlay"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 mb-6">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No saved businesses yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Browse businesses and click the heart icon to save them here. You&apos;ll be able to quickly find all your favorites in one place.
            </p>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
            >
              <Search className="w-5 h-5" />
              Browse Businesses
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <Building2 className="w-4 h-4" />
            Browse All Businesses
          </Link>
          <Link
            href="/dashboard/my-business"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <Building2 className="w-4 h-4" />
            Manage My Business
          </Link>
        </div>
      </main>
    </div>
  )
}
