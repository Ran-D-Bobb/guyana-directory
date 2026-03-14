#!/usr/bin/env npx tsx
/**
 * Business Name Confidence Audit for Waypoint
 *
 * Fetches all businesses grouped by category, scores each on how likely
 * it is to be a legitimate business based on name + description, and
 * outputs the low-confidence entries for manual review.
 *
 * Usage:
 *   npx tsx scripts/audit-businesses.ts                    # generate report
 *   npx tsx scripts/audit-businesses.ts --category dining  # filter by category (partial match)
 *   npx tsx scripts/audit-businesses.ts --threshold 60     # custom confidence threshold (default: 70)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // .env.local not found
  }
}
loadEnvFile()

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:57321'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const args = process.argv.slice(2)
const CATEGORY_FILTER = (() => {
  const idx = args.indexOf('--category')
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
})()
const THRESHOLD = (() => {
  const idx = args.indexOf('--threshold')
  return idx !== -1 && args[idx + 1] ? parseInt(args[idx + 1], 10) : 70
})()

// ---------------------------------------------------------------------------
// CONFIDENCE SCORING
// ---------------------------------------------------------------------------

interface ScoreResult {
  score: number        // 0-100, where 100 = definitely a business
  reasons: string[]    // why the score was lowered
}

/**
 * Score how likely a name+description represents a real business.
 * Lower score = less likely to be a business.
 */
function scoreConfidence(
  name: string,
  description: string | null,
  categoryName: string,
  hasPhone: boolean,
  hasWebsite: boolean,
  hasReviews: boolean,
): ScoreResult {
  let score = 75 // baseline — most Google Places entries are businesses
  const reasons: string[] = []
  const nameLower = name.toLowerCase().trim()
  const descLower = (description || '').toLowerCase().trim()

  // ─── STRONG NEGATIVE SIGNALS (big score drops) ───

  // ATMs — not businesses, just machines
  if (/\batm\b/i.test(name) && !/atmospher/i.test(name)) {
    score -= 60
    reasons.push('ATM (machine, not a business)')
  }

  // Religious institutions
  const religiousPatterns = [
    'church', 'chapel', 'cathedral', 'basilica', 'temple', 'mandir',
    'mosque', 'masjid', 'synagogue', 'kingdom hall', 'tabernacle',
    'adventist', 'pentecostal', 'baptist', 'methodist', 'lutheran',
    'presbyterian', 'assembly of god', 'seventh day', 'seventh-day',
    'sacred heart', 'holy spirit', 'worship center', 'worship centre',
    'apostolic', 'evangelical church', 'gospel hall', 'brethren',
    'jehovah', 'latter-day', 'mormon', 'salvation army', 'nazarene',
    'diocese', 'parish of', 'congregation',
  ]
  const religiousExclude = ['church street', 'church road', 'church chicken', 'churchs chicken',
    'church view', 'temple street', 'cambridge']
  if (
    religiousPatterns.some(p => nameLower.includes(p)) &&
    !religiousExclude.some(e => nameLower.includes(e))
  ) {
    score -= 55
    reasons.push('Religious institution (not a commercial business)')
  }

  // Public schools
  const schoolPatterns = ['primary school', 'secondary school', 'high school', 'nursery school',
    'public school', 'university of guyana']
  const schoolExclude = ['driving school', 'beauty school', 'music school', 'dance school',
    'art school', 'swim school', 'cooking school', 'flight school',
    'trade school', 'montessori', 'international school', 'private school',
    'academy', 'institute', 'school of business', 'school supplies']
  if (
    schoolPatterns.some(p => nameLower.includes(p)) &&
    !schoolExclude.some(e => nameLower.includes(e))
  ) {
    score -= 55
    reasons.push('Public school / educational institution')
  }

  // Government buildings
  const govPatterns = ['police station', 'fire station', 'magistrate court', 'parliament',
    'prison', 'correctional', 'embassy of', 'consulate', 'high commission',
    'ministry of', 'department of', 'city hall', 'town hall',
    'regional democratic council', 'neighbourhood democratic council',
    'customs office', 'immigration office']
  if (govPatterns.some(p => nameLower.includes(p))) {
    score -= 55
    reasons.push('Government/civic building')
  }

  // Cemeteries, memorials, monuments
  if (/\b(cemetery|crematorium|burial ground|cenotaph)\b/i.test(name)) {
    score -= 55
    reasons.push('Cemetery/crematorium')
  }

  // Public infrastructure
  const infraExclude = ['cafe', 'restaurant', 'bar', 'hotel', 'resort', 'view', 'cambridge',
    'amsterdam', 'rotterdam', 'bridgetown']
  if (
    /\b(stelling|koker|sluice gate|water treatment|sewage|power station|electricity substation|pump station|toll booth)\b/i.test(name) &&
    !infraExclude.some(e => nameLower.includes(e))
  ) {
    score -= 50
    reasons.push('Public infrastructure / utility')
  }

  // Bus stops, taxi stands
  if (/\b(bus stop|bus terminal|taxi stand|taxi rank|minibus park)\b/i.test(name)) {
    score -= 50
    reasons.push('Transport point (not a business)')
  }

  // Parks (but not park hotel, park resort, etc.)
  if (
    /\bpark$/i.test(name) &&
    !/\b(hotel|resort|inn|mall|restaurant|cafe|bar|plaza|theme|water|adventure|amusement|skate|industrial|business|tech|car)\b/i.test(name)
  ) {
    score -= 40
    reasons.push('Appears to be a public park')
  }
  if (/\b(playground|playing field|cricket ground|football ground|sports ground|recreation ground|national park)\b/i.test(name)) {
    score -= 40
    reasons.push('Public recreation ground')
  }

  // Health posts (may be legitimate but often not searchable businesses)
  if (/\b(health post|health centre|health center|polyclinic)\b/i.test(name) &&
      !/\b(private|medical center|medical centre|clinic|dr\.|doctor)\b/i.test(name)) {
    score -= 25
    reasons.push('Public health facility (may not be commercial)')
  }

  // ─── MEDIUM NEGATIVE SIGNALS ───

  // Plus Codes / coordinates as names
  if (/^[A-Z0-9]{2,6}\+[A-Z0-9]{2,4}/i.test(name)) {
    score -= 45
    reasons.push('Name is a Plus Code / map reference')
  }

  // Address-like names
  if (/^lot\s+\d+/i.test(name) || /^\d+\s+(main|public|church|regent|robb|king|water)\s+(st|street|road|rd)/i.test(name)) {
    score -= 40
    reasons.push('Name looks like an address, not a business name')
  }

  // Very short names (1-3 characters)
  if (name.trim().length <= 3) {
    score -= 35
    reasons.push(`Very short name (${name.trim().length} chars)`)
  }

  // Unnamed / placeholder
  if (/\b(unnamed|unknown|test business|test listing|n\/a|no name)\b/i.test(name)) {
    score -= 50
    reasons.push('Placeholder / unnamed entry')
  }

  // Residential areas
  if (/\b(housing scheme|housing project|apartment complex|residential area)\b/i.test(name)) {
    score -= 40
    reasons.push('Residential area (not a business)')
  }

  // Just a person's first name (very short, single word, no business indicators)
  if (/^[A-Z][a-z]+$/.test(name.trim()) && name.trim().length < 8 && !description) {
    score -= 20
    reasons.push('Single short word — may be a person\'s name, not a business')
  }

  // Generic place name with no business qualifier
  if (/^(the\s+)?(village|town|city|area|district|community|settlement)\b/i.test(name)) {
    score -= 30
    reasons.push('Generic place descriptor, not a business name')
  }

  // Names that are just a location/area name (common in Google Places)
  // e.g., "Georgetown", "New Amsterdam" without any business qualifier
  const pureLocationNames = [
    'georgetown', 'new amsterdam', 'linden', 'bartica', 'lethem',
    'anna regina', 'rose hall', 'corriverton', 'parika', 'mahaica',
    'mahaicony', 'vreed en hoop', 'tuschen', 'leonora', 'uitvlugt',
  ]
  if (pureLocationNames.includes(nameLower.trim())) {
    score -= 45
    reasons.push('Name is just a city/town name with no business identifier')
  }

  // ─── POSITIVE SIGNALS (boost score) ───

  // Has a phone number (businesses typically have contact info)
  if (hasPhone) {
    score += 5
    // don't add to reasons — too noisy
  }

  // Has a website
  if (hasWebsite) {
    score += 5
  }

  // Has reviews (real businesses get reviews)
  if (hasReviews) {
    score += 10
  }

  // Has a description (curated entries have descriptions)
  if (description && description.length > 20) {
    score += 5
  }

  // Business-like name patterns (boost)
  const businessIndicators = [
    'restaurant', 'cafe', 'bar', 'grill', 'bakery', 'pizza',
    'shop', 'store', 'mart', 'market', 'supermarket', 'grocery',
    'salon', 'barber', 'spa', 'beauty',
    'pharmacy', 'drug store', 'medical', 'dental', 'clinic', 'hospital',
    'hotel', 'resort', 'inn', 'lodge', 'guest house', 'motel',
    'auto', 'motors', 'garage', 'tire', 'tyre', 'mechanic',
    'hardware', 'lumber', 'building supplies',
    'electronics', 'computer', 'phone', 'mobile',
    'gym', 'fitness', 'yoga',
    'studio', 'gallery',
    'agency', 'services', 'solutions', 'enterprises', 'trading',
    'company', 'co.', 'corp', 'inc', 'ltd', 'limited',
    'rental', 'rentals', 'hire',
    'insurance', 'realty', 'real estate',
    'law firm', 'attorney', 'lawyer',
    'accounting', 'tax', 'consultant',
    'bank', 'credit union',
    'gas station', 'fuel', 'filling station',
    'laundry', 'dry clean', 'laundromat',
    'pet', 'vet', 'veterinary', 'animal',
    'school of', 'driving school', 'training',
    'courier', 'shipping', 'freight', 'logistics',
    'construction', 'contractor', 'plumbing', 'electrical',
    'printing', 'signs', 'graphics',
    'wholesale', 'distribution', 'supply',
    'boutique', 'fashion', 'clothing',
    'jewelry', 'jewellery', 'gold',
    'furniture', 'mattress', 'decor',
    'travel', 'tours', 'adventure',
    'photo', 'photography',
    'security', 'guard',
    'cleaning', 'janitorial',
    'catering', 'food',
    'nursery', // plant nursery (exclude school nursery above)
  ]
  if (businessIndicators.some(bi => nameLower.includes(bi))) {
    // Only boost if not already flagged for something
    if (reasons.length === 0) {
      score += 10
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, reasons }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  if (!SUPABASE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log('=== Waypoint Business Confidence Audit ===')
  console.log(`Confidence threshold: ${THRESHOLD}% (showing entries below this)`)
  if (CATEGORY_FILTER) console.log(`Category filter: "${CATEGORY_FILTER}"`)
  console.log('')

  // Load reference data
  const { data: cats } = await supabase.from('categories').select('id, name, slug')
  const { data: regions } = await supabase.from('regions').select('id, name')
  const catMap = new Map((cats || []).map(c => [c.id, c.name]))
  const catSlugMap = new Map((cats || []).map(c => [c.id, c.slug]))
  const regMap = new Map((regions || []).map(r => [r.id, r.name]))

  // Load all businesses in batches
  interface BizRow {
    id: string
    name: string
    slug: string
    description: string | null
    address: string | null
    category_id: string | null
    region_id: string | null
    source: string | null
    phone: string | null
    email: string | null
    website: string | null
    review_count: number | null
    is_active: boolean
    google_place_id: string | null
  }

  const allBusinesses: BizRow[] = []
  let offset = 0
  const batchSize = 1000
  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, description, address, category_id, region_id, source, phone, email, website, review_count, is_active, google_place_id')
      .range(offset, offset + batchSize - 1)
      .order('name')

    if (!data || data.length === 0) break
    allBusinesses.push(...data)
    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`Loaded ${allBusinesses.length} businesses total`)
  console.log('')

  // Filter by category if specified
  let bizToAudit = allBusinesses
  if (CATEGORY_FILTER) {
    const matchingCats = (cats || []).filter(c =>
      c.name.toLowerCase().includes(CATEGORY_FILTER.toLowerCase()) ||
      c.slug.includes(CATEGORY_FILTER.toLowerCase())
    )
    if (matchingCats.length === 0) {
      console.error(`No category matching "${CATEGORY_FILTER}".`)
      console.log('Available categories:')
      for (const c of (cats || []).sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`  ${c.slug.padEnd(30)} ${c.name}`)
      }
      process.exit(1)
    }
    const catIds = new Set(matchingCats.map(c => c.id))
    bizToAudit = allBusinesses.filter(b => b.category_id && catIds.has(b.category_id))
    console.log(`Auditing ${bizToAudit.length} businesses in: ${matchingCats.map(c => c.name).join(', ')}`)
    console.log('')
  }

  // Score every business
  interface ScoredBusiness {
    id: string
    name: string
    description: string | null
    category: string
    categorySlug: string
    region: string
    address: string | null
    score: number
    reasons: string[]
    has_phone: boolean
    has_website: boolean
    has_reviews: boolean
    is_active: boolean
    source: string | null
  }

  const scored: ScoredBusiness[] = bizToAudit.map(biz => {
    const catName = catMap.get(biz.category_id || '') || 'Uncategorized'
    const catSlug = catSlugMap.get(biz.category_id || '') || 'unknown'
    const { score, reasons } = scoreConfidence(
      biz.name,
      biz.description,
      catName,
      !!biz.phone,
      !!biz.website,
      (biz.review_count || 0) > 0,
    )
    return {
      id: biz.id,
      name: biz.name,
      description: biz.description,
      category: catName,
      categorySlug: catSlug,
      region: regMap.get(biz.region_id || '') || 'Unknown',
      address: biz.address,
      score,
      reasons,
      has_phone: !!biz.phone,
      has_website: !!biz.website,
      has_reviews: (biz.review_count || 0) > 0,
      is_active: biz.is_active,
      source: biz.source,
    }
  })

  // Filter to low confidence
  const lowConfidence = scored
    .filter(s => s.score < THRESHOLD)
    .sort((a, b) => a.score - b.score) // worst first

  // Group by category for display
  const byCategory: Record<string, ScoredBusiness[]> = {}
  for (const s of lowConfidence) {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s)
  }

  // Display results
  console.log(`${'═'.repeat(80)}`)
  console.log(`  LOW CONFIDENCE ENTRIES (score < ${THRESHOLD})`)
  console.log(`  ${lowConfidence.length} flagged out of ${bizToAudit.length} audited`)
  console.log(`${'═'.repeat(80)}`)

  for (const catName of Object.keys(byCategory).sort()) {
    const items = byCategory[catName]
    console.log('')
    console.log(`── ${catName} (${items.length} flagged) ${'─'.repeat(Math.max(0, 60 - catName.length))}`)

    for (const item of items) {
      const status = item.is_active ? '' : ' [INACTIVE]'
      const contactInfo = [
        item.has_phone ? 'P' : '-',
        item.has_website ? 'W' : '-',
        item.has_reviews ? 'R' : '-',
      ].join('')

      console.log('')
      console.log(`  SCORE: ${item.score}%${status}  [${contactInfo}]  ${item.name}`)
      if (item.description) {
        const desc = item.description.length > 120
          ? item.description.slice(0, 120) + '...'
          : item.description
        console.log(`    Desc: ${desc}`)
      }
      console.log(`    Region: ${item.region} | Category: ${item.category}`)
      if (item.reasons.length > 0) {
        console.log(`    Flags: ${item.reasons.join('; ')}`)
      }
    }
  }

  // Score distribution summary
  console.log('')
  console.log(`${'═'.repeat(80)}`)
  console.log('  SCORE DISTRIBUTION')
  console.log(`${'═'.repeat(80)}`)

  const brackets = [
    { label: '0-10%  (definitely not businesses)', min: 0, max: 10 },
    { label: '11-20% (very unlikely businesses)', min: 11, max: 20 },
    { label: '21-40% (probably not businesses)',   min: 21, max: 40 },
    { label: '41-60% (uncertain — review these)',  min: 41, max: 60 },
    { label: '61-70% (likely businesses, minor concerns)', min: 61, max: 70 },
    { label: '71-85% (probably businesses)',        min: 71, max: 85 },
    { label: '86-100% (high confidence businesses)', min: 86, max: 100 },
  ]

  for (const b of brackets) {
    const count = scored.filter(s => s.score >= b.min && s.score <= b.max).length
    const bar = '█'.repeat(Math.round(count / Math.max(1, scored.length) * 50))
    console.log(`  ${b.label.padEnd(50)} ${String(count).padStart(5)}  ${bar}`)
  }

  console.log('')
  console.log(`  Total audited: ${scored.length}`)
  console.log(`  Below threshold (${THRESHOLD}%): ${lowConfidence.length}`)
  console.log(`  Above threshold: ${scored.length - lowConfidence.length}`)

  // Write detailed JSON report
  const reportPath = resolve(process.cwd(), 'scripts', 'audit-report.json')
  const report = {
    generated_at: new Date().toISOString(),
    threshold: THRESHOLD,
    total_audited: scored.length,
    total_flagged: lowConfidence.length,
    score_distribution: Object.fromEntries(
      brackets.map(b => [
        `${b.min}-${b.max}`,
        scored.filter(s => s.score >= b.min && s.score <= b.max).length,
      ])
    ),
    flagged_by_category: Object.fromEntries(
      Object.entries(byCategory).map(([cat, items]) => [
        cat,
        {
          count: items.length,
          businesses: items.map(b => ({
            id: b.id,
            name: b.name,
            description: b.description,
            score: b.score,
            reasons: b.reasons,
            region: b.region,
            address: b.address,
            has_phone: b.has_phone,
            has_reviews: b.has_reviews,
            is_active: b.is_active,
          })),
        },
      ])
    ),
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log('')
  console.log(`Full report saved to: ${reportPath}`)
  console.log('')
  console.log('Next steps:')
  console.log('  1. Review the flagged entries above')
  console.log('  2. Adjust threshold if needed: --threshold 50')
  console.log('  3. Filter by category: --category restaurants-dining')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
