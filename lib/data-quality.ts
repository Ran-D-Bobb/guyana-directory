import { createClient } from '@/lib/supabase/server'

// Types for data quality issues
export interface IncompleteIssue {
  missingPhotos: boolean
  shortDescription: boolean
  missingHours: boolean
  missingPhone: boolean
  missingCategory: boolean
  missingRegion: boolean
}

export interface IncompleteBusiness {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string | null
  updated_at: string | null
  photo_count: number
  issues: IncompleteIssue
  severity: number // 0-6 scale based on number of issues
  category?: { name: string } | null
  region?: { name: string } | null
}

export interface StaleBusiness {
  id: string
  name: string
  slug: string
  updated_at: string | null
  created_at: string | null
  days_since_update: number
  severity: 'warning' | 'critical' // warning = 6+ months, critical = 12+ months
  category?: { name: string } | null
  region?: { name: string } | null
}

export interface DuplicateGroup {
  region_id: string | null
  region_name: string | null
  businesses: {
    id: string
    name: string
    slug: string
    created_at: string | null
    is_verified: boolean | null
    view_count: number | null
  }[]
}

export interface LowEngagementBusiness {
  id: string
  name: string
  slug: string
  view_count: number | null
  created_at: string | null
  updated_at: string | null
  days_since_creation: number
  category?: { name: string } | null
  region?: { name: string } | null
}

export interface DataQualityStats {
  totalBusinesses: number
  incompleteCount: number
  staleWarningCount: number
  staleCriticalCount: number
  potentialDuplicatesCount: number
  lowEngagementCount: number
}

/**
 * Get incomplete business listings
 * Incomplete = missing photos OR description < 50 chars OR no hours OR missing phone
 */
export async function getIncompleteListings(): Promise<IncompleteBusiness[]> {
  const supabase = await createClient()

  // Get all businesses with their photo counts
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      description,
      hours,
      phone,
      category_id,
      region_id,
      created_at,
      updated_at,
      category:categories(name),
      region:regions(name)
    `)
    .order('created_at', { ascending: false })

  if (error || !businesses) {
    console.error('Error fetching businesses:', error)
    return []
  }

  // Get photo counts for all businesses
  const businessIds = businesses.map(b => b.id)
  const { data: photoCounts } = await supabase
    .from('business_photos')
    .select('business_id')
    .in('business_id', businessIds)

  // Count photos per business
  const photoCountMap = new Map<string, number>()
  photoCounts?.forEach(p => {
    const count = photoCountMap.get(p.business_id) || 0
    photoCountMap.set(p.business_id, count + 1)
  })

  // Filter and map incomplete businesses
  const incompleteBusinesses: IncompleteBusiness[] = []

  for (const business of businesses) {
    const photoCount = photoCountMap.get(business.id) || 0
    const descLength = business.description?.length || 0

    const issues: IncompleteIssue = {
      missingPhotos: photoCount === 0,
      shortDescription: descLength < 50,
      missingHours: !business.hours || Object.keys(business.hours as object).length === 0,
      missingPhone: !business.phone,
      missingCategory: !business.category_id,
      missingRegion: !business.region_id,
    }

    // Calculate severity (number of issues)
    const severity = Object.values(issues).filter(Boolean).length

    // Only include if there's at least one issue
    if (severity > 0) {
      incompleteBusinesses.push({
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        created_at: business.created_at,
        updated_at: business.updated_at,
        photo_count: photoCount,
        issues,
        severity,
        category: business.category as { name: string } | null,
        region: business.region as { name: string } | null,
      })
    }
  }

  // Sort by severity (highest first)
  return incompleteBusinesses.sort((a, b) => b.severity - a.severity)
}

/**
 * Get stale business listings
 * Warning = not updated in 6+ months
 * Critical = not updated in 12+ months
 */
export async function getStaleListings(): Promise<StaleBusiness[]> {
  const supabase = await createClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      updated_at,
      created_at,
      category:categories(name),
      region:regions(name)
    `)
    .lt('updated_at', sixMonthsAgo.toISOString())
    .order('updated_at', { ascending: true })

  if (error || !businesses) {
    console.error('Error fetching stale businesses:', error)
    return []
  }

  const now = new Date()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  return businesses.map(business => {
    const updatedAt = business.updated_at ? new Date(business.updated_at) : new Date(business.created_at || now)
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    const severity: 'warning' | 'critical' = updatedAt < twelveMonthsAgo ? 'critical' : 'warning'

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      updated_at: business.updated_at,
      created_at: business.created_at,
      days_since_update: daysSinceUpdate,
      severity,
      category: business.category as { name: string } | null,
      region: business.region as { name: string } | null,
    }
  })
}

/**
 * Get potential duplicate listings
 * Finds businesses with similar names in the same region
 */
export async function getPotentialDuplicates(): Promise<DuplicateGroup[]> {
  const supabase = await createClient()

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      region_id,
      created_at,
      is_verified,
      view_count,
      region:regions(name)
    `)
    .order('name')

  if (error || !businesses) {
    console.error('Error fetching businesses for duplicates:', error)
    return []
  }

  // Group by region and find similar names
  const regionGroups = new Map<string | null, typeof businesses>()

  for (const business of businesses) {
    const regionId = business.region_id
    const group = regionGroups.get(regionId) || []
    group.push(business)
    regionGroups.set(regionId, group)
  }

  const duplicateGroups: DuplicateGroup[] = []

  // For each region, find businesses with similar names
  for (const [regionId, regionBusinesses] of regionGroups) {
    const processed = new Set<string>()

    for (let i = 0; i < regionBusinesses.length; i++) {
      if (processed.has(regionBusinesses[i].id)) continue

      const similarBusinesses = [regionBusinesses[i]]
      const baseName = normalizeName(regionBusinesses[i].name)

      for (let j = i + 1; j < regionBusinesses.length; j++) {
        if (processed.has(regionBusinesses[j].id)) continue

        const compareName = normalizeName(regionBusinesses[j].name)

        if (areSimilarNames(baseName, compareName)) {
          similarBusinesses.push(regionBusinesses[j])
          processed.add(regionBusinesses[j].id)
        }
      }

      // Only add if there are potential duplicates (2+ businesses)
      if (similarBusinesses.length >= 2) {
        processed.add(regionBusinesses[i].id)
        duplicateGroups.push({
          region_id: regionId,
          region_name: similarBusinesses[0].region?.name || null,
          businesses: similarBusinesses.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            created_at: b.created_at,
            is_verified: b.is_verified,
            view_count: b.view_count,
          })),
        })
      }
    }
  }

  return duplicateGroups
}

/**
 * Get low engagement listings
 * Businesses with 0 views in the last 90 days (or very low view count overall)
 */
export async function getLowEngagementListings(): Promise<LowEngagementBusiness[]> {
  const supabase = await createClient()

  // Get businesses with low or no views that are at least 30 days old
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      view_count,
      created_at,
      updated_at,
      category:categories(name),
      region:regions(name)
    `)
    .lt('created_at', thirtyDaysAgo.toISOString())
    .or('view_count.is.null,view_count.lte.5')
    .order('view_count', { ascending: true, nullsFirst: true })

  if (error || !businesses) {
    console.error('Error fetching low engagement businesses:', error)
    return []
  }

  const now = new Date()

  return businesses.map(business => {
    const createdAt = business.created_at ? new Date(business.created_at) : now
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      view_count: business.view_count,
      created_at: business.created_at,
      updated_at: business.updated_at,
      days_since_creation: daysSinceCreation,
      category: business.category as { name: string } | null,
      region: business.region as { name: string } | null,
    }
  })
}

/**
 * Get overall data quality stats
 */
export async function getDataQualityStats(): Promise<DataQualityStats> {
  const supabase = await createClient()

  // Get total businesses count
  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  // Get incomplete count (businesses without photos)
  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('id, description, hours, phone, category_id, region_id')

  const { data: photoCounts } = await supabase
    .from('business_photos')
    .select('business_id')

  const businessesWithPhotos = new Set(photoCounts?.map(p => p.business_id) || [])

  let incompleteCount = 0
  allBusinesses?.forEach(b => {
    const hasPhoto = businessesWithPhotos.has(b.id)
    const hasDesc = (b.description?.length || 0) >= 50
    const hasHours = b.hours && Object.keys(b.hours as object).length > 0
    const hasPhone = !!b.phone

    if (!hasPhoto || !hasDesc || !hasHours || !hasPhone) {
      incompleteCount++
    }
  })

  // Get stale counts
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { count: staleWarningCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .lt('updated_at', sixMonthsAgo.toISOString())
    .gte('updated_at', twelveMonthsAgo.toISOString())

  const { count: staleCriticalCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .lt('updated_at', twelveMonthsAgo.toISOString())

  // Get low engagement count
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: lowEngagementCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', thirtyDaysAgo.toISOString())
    .or('view_count.is.null,view_count.lte.5')

  // Get potential duplicates count (approximate)
  const duplicates = await getPotentialDuplicates()
  const potentialDuplicatesCount = duplicates.reduce((acc, group) => acc + group.businesses.length, 0)

  return {
    totalBusinesses: totalBusinesses || 0,
    incompleteCount,
    staleWarningCount: staleWarningCount || 0,
    staleCriticalCount: staleCriticalCount || 0,
    potentialDuplicatesCount,
    lowEngagementCount: lowEngagementCount || 0,
  }
}

// Helper functions for duplicate detection

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .trim()
    .replace(/\b(the|a|an|llc|inc|ltd|co|corp|company|store|shop|restaurant|bar|cafe|hotel|services?|solutions?)\b/g, '') // Remove common words
    .replace(/\s+/g, ' ')
    .trim()
}

function areSimilarNames(name1: string, name2: string): boolean {
  // Exact match after normalization
  if (name1 === name2 && name1.length > 2) return true

  // One contains the other
  if (name1.length > 3 && name2.length > 3) {
    if (name1.includes(name2) || name2.includes(name1)) return true
  }

  // Levenshtein distance check for short names
  if (name1.length >= 3 && name2.length >= 3) {
    const distance = levenshteinDistance(name1, name2)
    const maxLength = Math.max(name1.length, name2.length)
    const similarity = 1 - (distance / maxLength)

    // Consider similar if 80%+ match
    if (similarity >= 0.8) return true
  }

  return false
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}
