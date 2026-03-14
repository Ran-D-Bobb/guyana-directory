import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker'
import { TourismViewTracker } from '@/components/TourismViewTracker'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  MapPin,
  Clock,
  Sparkles,
  Eye,
  Users,
  Star,
  Mountain,
  Calendar,
  CheckCircle2,
  Package,
  Phone,
  ArrowRight
} from 'lucide-react'
import { getFallbackImage } from '@/lib/category-images'
import { TourismStickyCTA } from './TourismStickyCTA'
import { TourismPhotoGallery } from './TourismDetailClient'

// Convert human-readable duration to ISO 8601 for JSON-LD
function toIsoDuration(duration: string): string {
  const lower = duration.toLowerCase().trim()

  // Match patterns like "2 hours", "3 hour", "1.5 hours"
  const hourMatch = lower.match(/^(\d+(?:\.\d+)?)\s*hours?$/)
  if (hourMatch) {
    const h = parseFloat(hourMatch[1])
    if (Number.isInteger(h)) return `PT${h}H`
    const wholeH = Math.floor(h)
    const mins = Math.round((h - wholeH) * 60)
    return wholeH > 0 ? `PT${wholeH}H${mins}M` : `PT${mins}M`
  }

  // "half day" → ~4 hours
  if (lower.includes('half') && lower.includes('day')) return 'PT4H'
  // "full day" → ~8 hours
  if (lower.includes('full') && lower.includes('day')) return 'PT8H'

  // Match "X days" / "X nights" / "X weeks"
  const dayMatch = lower.match(/^(\d+)\s*(?:days?|nights?)$/)
  if (dayMatch) return `P${dayMatch[1]}D`
  const weekMatch = lower.match(/^(\d+)\s*weeks?$/)
  if (weekMatch) return `P${parseInt(weekMatch[1]) * 7}D`

  // Fallback: return the raw string (Google may still partially parse it)
  return duration
}

// Revalidate every 2 minutes
export const revalidate = 120

// Pre-render top 50 most-viewed tourism experiences at build time
export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: experiences } = await supabase
    .from('tourism_experiences')
    .select('slug')
    .eq('is_approved', true)
    .order('view_count', { ascending: false })
    .limit(50)

  return (experiences || []).map((exp) => ({
    slug: exp.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data: experience } = await supabase
    .from('tourism_experiences')
    .select('name, description, tourism_categories:tourism_category_id (name), regions:region_id (name), tourism_photos (image_url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!experience) return { title: 'Experience Not Found' }

  const photo = Array.isArray(experience.tourism_photos)
    ? experience.tourism_photos.find(p => p.is_primary)?.image_url || experience.tourism_photos[0]?.image_url
    : null
  const categoryName = (experience.tourism_categories as { name: string } | null)?.name || ''
  const regionName = (experience.regions as { name: string } | null)?.name || ''
  const description = experience.description
    ? experience.description.slice(0, 155)
    : `${experience.name} - ${categoryName} experience in ${regionName}, Guyana.`

  return {
    title: `${experience.name} - Guyana Tourism`,
    description,
    alternates: { canonical: `/tourism/${slug}` },
    openGraph: {
      title: `${experience.name} | Waypoint`,
      description,
      ...(photo ? { images: [{ url: photo, width: 1200, height: 630, alt: experience.name }] } : {}),
    },
  }
}

interface ExperiencePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the experience with category, region, and photos
  const { data: experience } = await supabase
    .from('tourism_experiences')
    .select(`
      *,
      tourism_categories:tourism_category_id (name, icon),
      regions:region_id (name),
      tourism_photos:tourism_photos (
        image_url,
        is_primary,
        display_order
      )
    `)
    .eq('slug', slug)
    .eq('is_approved', true) // Only show approved experiences to public
    .single()

  if (!experience) {
    notFound()
  }

  // Get primary photo or first photo
  const photos = Array.isArray(experience.tourism_photos) ? experience.tourism_photos : []
  const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || getFallbackImage(experience.tourism_categories?.name, 'tourism')

  // Fetch related experiences (same category, excluding current)
  let relatedExperiences: Array<{
    id: string
    name: string
    slug: string
    price_from: number | null
    rating: number | null
    review_count: number | null
    duration: string | null
    tourism_categories: { name: string } | null
    regions: { name: string } | null
    tourism_photos: Array<{ image_url: string; is_primary: boolean | null }> | null
  }> = []

  if (experience.tourism_category_id) {
    const { data } = await supabase
      .from('tourism_experiences')
      .select(`
        id, name, slug, price_from, rating, review_count, duration,
        tourism_categories:tourism_category_id (name),
        regions:region_id (name),
        tourism_photos:tourism_photos (image_url, is_primary)
      `)
      .eq('is_approved', true)
      .eq('tourism_category_id', experience.tourism_category_id)
      .neq('id', experience.id)
      .order('rating', { ascending: false })
      .limit(4)
    relatedExperiences = data || []
  }

  // Sort photos: primary first, then by display_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  })

  // JSON-LD structured data for TouristAttraction
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: experience.name,
    description: experience.description || undefined,
    url: `https://waypointgy.com/tourism/${experience.slug}`,
    image: primaryPhoto,
    ...(experience.regions ? {
      address: {
        '@type': 'PostalAddress',
        addressRegion: (experience.regions as { name: string }).name,
        addressCountry: 'GY',
      },
    } : {}),
    ...(experience.price_from ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'GYD',
        price: experience.price_from,
        availability: 'https://schema.org/InStock',
      },
    } : {}),
    ...(experience.duration ? { timeRequired: toIsoDuration(experience.duration) } : {}),
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Track view count (client-side to avoid blocking SSR) */}
      <TourismViewTracker experienceId={experience.id} />

      {/* Track recently viewed */}
      <RecentlyViewedTracker
        type="tourism"
        id={experience.id}
        slug={experience.slug}
        name={experience.name}
        image={primaryPhoto}
        category={experience.tourism_categories?.name}
        location={experience.regions?.name}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-[hsl(0,0%,5%)]">
        {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm dark:border-[hsl(0,0%,18%)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/tourism"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Tourism</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in">
            {/* Photo Gallery */}
            <TourismPhotoGallery
              photos={sortedPhotos}
              experienceName={experience.name}
              defaultImage={primaryPhoto}
            />

            {/* Sentinel: sticky CTA becomes visible when this scrolls out of view */}
            <div id="tourism-hero-sentinel" aria-hidden="true" />

            {/* Experience Details */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              {/* Badges */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                {experience.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-amber-500 text-white rounded-full shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    Featured
                  </span>
                )}
                {experience.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-full shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </span>
                )}
                {experience.tourism_categories && (
                  <span className="px-4 py-2 text-sm font-semibold bg-emerald-100 text-emerald-700 rounded-full border-2 border-emerald-200 hover:bg-emerald-200 transition-colors duration-200">
                    {experience.tourism_categories.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                {experience.name}
              </h1>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b-2 border-gray-100">
                {/* Duration */}
                {experience.duration && (
                  <div className="flex flex-col items-center p-4 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors">
                    <Clock className="w-6 h-6 text-cyan-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">
                      {experience.duration}
                    </span>
                    <span className="text-xs text-gray-600">Duration</span>
                  </div>
                )}

                {/* Difficulty */}
                {experience.difficulty_level && (
                  <div className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                    <Mountain className="w-6 h-6 text-orange-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {experience.difficulty_level}
                    </span>
                    <span className="text-xs text-gray-600">Difficulty</span>
                  </div>
                )}

                {/* Group Size */}
                {experience.group_size_max && (
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <Users className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">
                      {experience.group_size_min || 1}-{experience.group_size_max}
                    </span>
                    <span className="text-xs text-gray-600">Group Size</span>
                  </div>
                )}

                {/* Rating */}
                {experience.rating && (
                  <div className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                    <Star className="w-6 h-6 text-amber-600 mb-2 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">
                      {experience.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {experience.review_count} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Location */}
              {experience.location_details && (
                <div className="flex items-start gap-4 p-4 mb-6 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors duration-200">
                  <div className="p-2 bg-teal-600 rounded-lg shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold leading-relaxed">{experience.location_details}</p>
                    {experience.regions && (
                      <p className="text-sm text-gray-600 mt-1">{experience.regions.name}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {experience.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-8 bg-emerald-600 rounded-full" />
                    About This Experience
                  </h2>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg pl-5 border-l-2 border-emerald-100">
                    {experience.description}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {experience.includes && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    What&apos;s Included
                  </h2>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{experience.includes}</p>
                  </div>
                </div>
              )}

              {/* What to Bring */}
              {experience.what_to_bring && experience.what_to_bring.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-orange-600" />
                    What to Bring
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.what_to_bring.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <Package className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Availability */}
              {experience.available_months && experience.available_months.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Availability
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {experience.available_months.map((month, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 border-2 border-emerald-200 rounded-lg text-sm font-medium"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                  {experience.best_season && (
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold">Best season:</span> {experience.best_season}
                    </p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Eye className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {experience.view_count} {experience.view_count === 1 ? 'view' : 'views'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24 space-y-6 hover:shadow-xl transition-shadow duration-300">
              {/* Price */}
              {experience.price_from !== null && (
                <div className="pb-6 border-b-2 border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">From</p>
                  <p className="text-4xl font-extrabold text-emerald-600">
                    GYD {experience.price_from.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{experience.price_notes || 'per person'}</p>
                </div>
              )}

              {/* Contact Button */}
              {experience.phone && (
                <div className="pb-6 border-b-2 border-gray-100">
                  <a
                    href={`tel:${experience.phone}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 rounded-lg"
                  >
                    <Phone className="h-6 w-6" />
                    <span>Book Now</span>
                  </a>
                </div>
              )}

              {/* Operator Info */}
              {experience.operator_name && (
                <div className="pb-6 border-b-2 border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Tour Operator
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <p className="font-bold text-gray-900 text-lg mb-1">{experience.operator_name}</p>
                    {experience.operator_license && (
                      <p className="text-xs text-gray-600 mb-2">
                        License: {experience.operator_license}
                      </p>
                    )}
                    {experience.email && (
                      <p className="text-sm text-gray-600 break-all">{experience.email}</p>
                    )}
                    {experience.phone && (
                      <p className="text-sm text-gray-600">{experience.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {experience.languages && experience.languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Languages Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {experience.languages.map((lang: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Experiences */}
        {relatedExperiences && relatedExperiences.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                More {experience.tourism_categories?.name || 'Similar'} Experiences
              </h2>
              <Link
                href={`/tourism${experience.tourism_category_id ? `?category=${experience.tourism_category_id}` : ''}`}
                className="hidden sm:inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedExperiences.map((related) => {
                const relPhotos = Array.isArray(related.tourism_photos) ? related.tourism_photos : []
                const relPhoto = relPhotos.find((p: { is_primary: boolean | null }) => p.is_primary)?.image_url || relPhotos[0]?.image_url || getFallbackImage((related.tourism_categories as { name: string } | null)?.name, 'tourism')

                return (
                  <Link
                    key={related.id}
                    href={`/tourism/${related.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-gray-100"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={relPhoto}
                        alt={related.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {related.price_from !== null && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow">
                          <div className="text-xs text-gray-500">From</div>
                          <div className="text-base font-bold text-emerald-600 leading-tight">
                            GYD {related.price_from.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-2">
                        {related.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {(related.regions as { name: string } | null)?.name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-500" />
                            {(related.regions as { name: string }).name}
                          </span>
                        )}
                        {related.rating && related.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {related.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>
      </div>

      {/* Sticky mobile CTA - visible after scrolling past hero */}
      <TourismStickyCTA
        priceFrom={experience.price_from}
        priceNotes={experience.price_notes}
        phone={experience.phone}
        email={experience.email}
      />
    </>
  )
}
