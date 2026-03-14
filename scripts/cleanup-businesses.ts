#!/usr/bin/env npx tsx
/**
 * Business Cleanup Script for Waypoint
 *
 * Scans all businesses and flags non-business entries (churches, government
 * buildings, cemeteries, public schools, etc.) for review and removal.
 *
 * Usage:
 *   npx tsx scripts/cleanup-businesses.ts                  # dry-run: generates report only
 *   npx tsx scripts/cleanup-businesses.ts --execute        # actually deletes flagged businesses
 *   npx tsx scripts/cleanup-businesses.ts --execute --group religious   # delete only one group
 *   npx tsx scripts/cleanup-businesses.ts --execute --group government
 *   npx tsx scripts/cleanup-businesses.ts --execute --group cemetery_funeral
 *   npx tsx scripts/cleanup-businesses.ts --execute --group public_education
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
const EXECUTE = args.includes('--execute')
const GROUP_FILTER = (() => {
  const idx = args.indexOf('--group')
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
})()

// ---------------------------------------------------------------------------
// KEYWORD GROUPS
// ---------------------------------------------------------------------------

interface KeywordGroup {
  name: string
  label: string
  keywords: string[]
  /** Keywords that exclude a match (e.g. "driving school" is a business) */
  excludePatterns?: string[]
}

const GROUPS: KeywordGroup[] = [
  {
    name: 'religious',
    label: 'Places of Worship & Religious Institutions',
    keywords: [
      'church', 'chapel', 'temple', 'mosque', 'synagogue', 'kingdom hall',
      'adventist', 'catholic church', 'lutheran', 'methodist', 'presbyterian',
      'assembly of god', 'pentecostal', 'baptist', 'gospel', 'worship center',
      'worship centre', 'seventh day', 'seventh-day', 'SDA church',
      'salvation army', 'holy spirit', 'sacred heart', 'tabernacle',
      'diocese', 'parish', 'congregation', 'fellowship church',
      'faith church', 'faith christian', 'faith assembly',
      'brethren', 'nazarene', 'evangelical', 'apostolic',
      'RCCG', 'redeemed christian',
      'jehovah', 'latter-day', 'mormon',
    ],
    excludePatterns: [
      // These contain "church" but are actually businesses/places
      'church street', 'church road', 'church chicken', 'churchs chicken',
    ],
  },
  {
    name: 'government',
    label: 'Government & Public Buildings',
    keywords: [
      'police station', 'magistrate', 'parliament',
      'prison', 'correctional',
    ],
    excludePatterns: [],
  },
  {
    name: 'cemetery_funeral',
    label: 'Cemeteries & Funeral Services',
    keywords: [
      'cemetery', 'crematorium', 'mortuary',
      'burial ground',
    ],
    // Note: "funeral home" is debatable — it IS a business. We'll flag it but
    // the user can decide.
    excludePatterns: [],
  },
  {
    name: 'public_education',
    label: 'Public Schools & Universities (not private training)',
    keywords: [
      'primary school', 'secondary school', 'high school',
      'nursery school', 'public school',
      'university of guyana', 'university of',
    ],
    excludePatterns: [
      'driving school', 'beauty school', 'training center', 'training centre',
      'institute of technology', 'technical institute',
      'music school', 'dance school', 'art school', 'swim school',
      'cooking school', 'flight school', 'trade school',
    ],
  },
]

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

interface FlaggedBusiness {
  id: string
  name: string
  slug: string
  address: string | null
  category: string
  region: string
  source: string | null
  group: string
  matched_keyword: string
  has_phone: boolean
  has_photos: boolean
  has_reviews: boolean
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  if (!SUPABASE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log('=== Waypoint Business Cleanup ===')
  console.log(`Mode: ${EXECUTE ? 'EXECUTE' : 'DRY RUN (report only)'}`)
  if (GROUP_FILTER) console.log(`Group filter: ${GROUP_FILTER}`)
  console.log('')

  // Load reference data
  const { data: cats } = await supabase.from('categories').select('id, name')
  const { data: regions } = await supabase.from('regions').select('id, name')
  const catMap = new Map((cats || []).map(c => [c.id, c.name]))
  const regMap = new Map((regions || []).map(r => [r.id, r.name]))

  // Load all businesses in batches (Supabase default limit is 1000)
  const allBusinesses: Array<{
    id: string; name: string; slug: string; address: string | null;
    category_id: string; region_id: string; source: string | null;
    phone: string | null; review_count: number | null;
  }> = []

  let offset = 0
  const batchSize = 1000
  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, address, category_id, region_id, source, phone, review_count')
      .range(offset, offset + batchSize - 1)
      .order('name')

    if (!data || data.length === 0) break
    allBusinesses.push(...data)
    if (data.length < batchSize) break
    offset += batchSize
  }

  console.log(`Loaded ${allBusinesses.length} businesses`)

  // Get businesses with photos (for the report)
  const { data: photoData } = await supabase.from('business_photos').select('business_id')
  const bizWithPhotos = new Set((photoData || []).map(p => p.business_id))

  // Scan for non-business entries
  const flagged: FlaggedBusiness[] = []
  const seen = new Set<string>()

  for (const group of GROUPS) {
    for (const biz of allBusinesses) {
      if (seen.has(biz.id)) continue
      const nameLower = biz.name.toLowerCase()

      // Check exclude patterns first
      const excluded = (group.excludePatterns || []).some(ep =>
        nameLower.includes(ep.toLowerCase())
      )
      if (excluded) continue

      // Check keywords
      for (const kw of group.keywords) {
        if (nameLower.includes(kw.toLowerCase())) {
          flagged.push({
            id: biz.id,
            name: biz.name,
            slug: biz.slug,
            address: biz.address,
            category: catMap.get(biz.category_id) || 'Unknown',
            region: regMap.get(biz.region_id) || 'Unknown',
            source: biz.source,
            group: group.name,
            matched_keyword: kw,
            has_phone: !!biz.phone,
            has_photos: bizWithPhotos.has(biz.id),
            has_reviews: (biz.review_count || 0) > 0,
          })
          seen.add(biz.id)
          break
        }
      }
    }
  }

  // Group results
  const grouped: Record<string, FlaggedBusiness[]> = {}
  for (const f of flagged) {
    if (!grouped[f.group]) grouped[f.group] = []
    grouped[f.group].push(f)
  }

  // Print summary
  console.log('')
  console.log('=== FLAGGED NON-BUSINESS ENTRIES ===')
  console.log('─'.repeat(70))

  let totalFlagged = 0
  for (const group of GROUPS) {
    const items = grouped[group.name] || []
    totalFlagged += items.length
    console.log('')
    console.log(`[${group.name.toUpperCase()}] ${group.label}`)
    console.log(`  Count: ${items.length}`)
    if (items.length > 0) {
      console.log('  Sample entries:')
      for (const item of items.slice(0, 15)) {
        const flags = [
          item.has_phone ? 'phone' : '',
          item.has_photos ? 'photo' : '',
          item.has_reviews ? 'reviews' : '',
        ].filter(Boolean).join(',')
        console.log(`    - ${item.name.padEnd(45)} [${item.region}] ${flags ? `(${flags})` : ''}`)
      }
      if (items.length > 15) {
        console.log(`    ... and ${items.length - 15} more`)
      }
    }
  }

  console.log('')
  console.log('─'.repeat(70))
  console.log(`TOTAL FLAGGED: ${totalFlagged} / ${allBusinesses.length} businesses`)
  console.log(`WILL REMAIN:   ${allBusinesses.length - totalFlagged} businesses`)
  console.log('')

  // Write report
  const reportPath = resolve(process.cwd(), 'scripts', 'cleanup-report.json')
  const report = {
    generated_at: new Date().toISOString(),
    total_businesses: allBusinesses.length,
    total_flagged: totalFlagged,
    remaining_after_cleanup: allBusinesses.length - totalFlagged,
    groups: Object.fromEntries(
      GROUPS.map(g => [
        g.name,
        {
          label: g.label,
          count: (grouped[g.name] || []).length,
          businesses: (grouped[g.name] || []).map(b => ({
            id: b.id,
            name: b.name,
            address: b.address,
            category: b.category,
            region: b.region,
            matched_keyword: b.matched_keyword,
          })),
        },
      ])
    ),
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`Report saved to: ${reportPath}`)

  // Execute deletions if requested
  if (EXECUTE) {
    const groupsToDelete = GROUP_FILTER
      ? [GROUP_FILTER]
      : GROUPS.map(g => g.name)

    for (const groupName of groupsToDelete) {
      const items = grouped[groupName] || []
      if (items.length === 0) continue

      console.log('')
      console.log(`Deleting ${items.length} "${groupName}" entries...`)

      // Delete in batches of 100
      const ids = items.map(i => i.id)
      for (let i = 0; i < ids.length; i += 100) {
        const batch = ids.slice(i, i + 100)
        const { error } = await supabase
          .from('businesses')
          .delete()
          .in('id', batch)

        if (error) {
          console.error(`  Error deleting batch: ${error.message}`)
        } else {
          console.log(`  Deleted batch ${Math.floor(i / 100) + 1}: ${batch.length} businesses`)
        }
      }
    }

    // Print post-cleanup counts
    console.log('')
    console.log('=== POST-CLEANUP CATEGORY COUNTS ===')
    for (const c of (cats || []).sort((a, b) => a.name.localeCompare(b.name))) {
      const { count } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', c.id)
      if (count != null && count > 0) {
        console.log(`  ${c.name.padEnd(30)} ${String(count).padStart(5)}`)
      }
    }

    const { count: newTotal } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
    console.log('')
    console.log(`NEW TOTAL: ${newTotal} businesses`)
  } else {
    console.log('')
    console.log('This was a DRY RUN. To delete flagged entries, run:')
    console.log('  npx tsx scripts/cleanup-businesses.ts --execute')
    console.log('')
    console.log('To delete only one group:')
    for (const g of GROUPS) {
      if ((grouped[g.name] || []).length > 0) {
        console.log(`  npx tsx scripts/cleanup-businesses.ts --execute --group ${g.name}`)
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
