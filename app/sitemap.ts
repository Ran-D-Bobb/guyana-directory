import { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()
  const baseUrl = 'https://waypointgy.com'

  // Fetch all public content in parallel
  const [
    { data: businesses },
    { data: businessCategories },
    { data: experiences },
    { data: tourismCategories },
    { data: events },
    { data: eventCategories },
    { data: rentals },
    { data: rentalCategories },
  ] = await Promise.all([
    supabase.from('businesses').select('slug, updated_at').order('updated_at', { ascending: false }),
    supabase.from('categories').select('slug'),
    supabase.from('tourism_experiences').select('slug, updated_at').eq('is_approved', true).order('updated_at', { ascending: false }),
    supabase.from('tourism_categories').select('slug'),
    supabase.from('events').select('slug, updated_at').order('updated_at', { ascending: false }),
    supabase.from('event_categories').select('slug'),
    supabase.from('rentals').select('slug, updated_at').order('updated_at', { ascending: false }),
    supabase.from('rental_categories').select('slug'),
  ])

  const now = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/businesses`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tourism`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/rentals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/discover`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/events/timeline`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Business category pages
  const businessCategoryPages: MetadataRoute.Sitemap = (businessCategories || []).map((cat) => ({
    url: `${baseUrl}/businesses/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual business pages
  const businessPages: MetadataRoute.Sitemap = (businesses || []).map((biz) => ({
    url: `${baseUrl}/businesses/${biz.slug}`,
    lastModified: biz.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Tourism category pages
  const tourismCategoryPages: MetadataRoute.Sitemap = (tourismCategories || []).map((cat) => ({
    url: `${baseUrl}/tourism/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual tourism pages
  const tourismPages: MetadataRoute.Sitemap = (experiences || []).map((exp) => ({
    url: `${baseUrl}/tourism/${exp.slug}`,
    lastModified: exp.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Event category pages
  const eventCategoryPages: MetadataRoute.Sitemap = (eventCategories || []).map((cat) => ({
    url: `${baseUrl}/events/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual event pages
  const eventPages: MetadataRoute.Sitemap = (events || []).map((evt) => ({
    url: `${baseUrl}/events/${evt.slug}`,
    lastModified: evt.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Rental category pages
  const rentalCategoryPages: MetadataRoute.Sitemap = (rentalCategories || []).map((cat) => ({
    url: `${baseUrl}/rentals/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual rental pages
  const rentalPages: MetadataRoute.Sitemap = (rentals || []).map((rental) => ({
    url: `${baseUrl}/rentals/${rental.slug}`,
    lastModified: rental.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...businessCategoryPages,
    ...businessPages,
    ...tourismCategoryPages,
    ...tourismPages,
    ...eventCategoryPages,
    ...eventPages,
    ...rentalCategoryPages,
    ...rentalPages,
  ]
}
