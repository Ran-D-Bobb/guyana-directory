#!/usr/bin/env npx tsx
/**
 * Re-fetches opening hours from Google Places API (New) for businesses
 * that have incorrect hours (all 7 days identical due to the dayOfWeek bug).
 *
 * Usage:
 *   npx tsx scripts/refetch-hours.ts --test           # fetch 1 business, print result, no DB write
 *   npx tsx scripts/refetch-hours.ts --dry-run        # fetch all, print results, no DB write
 *   npx tsx scripts/refetch-hours.ts                  # fetch all and update local DB
 *   npx tsx scripts/refetch-hours.ts --push-to-prod   # sync corrected hours from local DB to production
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// ENV
// ---------------------------------------------------------------------------

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
  } catch { /* env vars must be set externally */ }
}
loadEnvFile()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// For local dev, the service role key may be commented out in .env.local
// so we hardcode the default local Supabase service role key as fallback
const SUPABASE_SERVICE_KEY = SUPABASE_URL.includes('127.0.0.1')
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  : process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!

const args = process.argv.slice(2)
const TEST_MODE = args.includes('--test')
const PUSH_TO_PROD = args.includes('--push-to-prod')
const DRY_RUN = (args.includes('--dry-run') || TEST_MODE) && !PUSH_TO_PROD

const RATE_LIMIT_MS = 100
const RETRY_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 1000
const CONCURRENCY = 5

// Production Supabase URL (read from commented-out env or hardcoded)
function getProductionUrl(): string {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      // Look for commented-out production URL
      if (trimmed.startsWith('#') && trimmed.includes('NEXT_PUBLIC_SUPABASE_URL=https://')) {
        const eqIdx = trimmed.indexOf('=')
        return trimmed.slice(eqIdx + 1).trim()
      }
    }
  } catch { /* */ }
  throw new Error('Could not find production Supabase URL in .env.local')
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  attempts: number = RETRY_ATTEMPTS
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status >= 500) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, i)
        log(`  Rate limited / server error (${res.status}), retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
      return res
    } catch (err) {
      if (i === attempts - 1) throw err
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, i)
      log(`  Network error, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Maps Google Places API (New) regularOpeningHours to our hours format.
 * The API returns `day` as an integer 0-6 (0=Sunday through 6=Saturday).
 */
function mapHours(
  openingHours?: { periods?: Array<{ open: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } }> }
): Record<string, unknown> | null {
  if (!openingHours?.periods) return null

  const dayNames = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ]
  const hours: Record<string, unknown> = {}

  for (const period of openingHours.periods) {
    const dayName = dayNames[period.open.day]
    if (!dayName) continue
    const openTime = `${String(period.open.hour).padStart(2, '0')}:${String(period.open.minute).padStart(2, '0')}`
    const closeTime = period.close
      ? `${String(period.close.hour).padStart(2, '0')}:${String(period.close.minute).padStart(2, '0')}`
      : '23:59'
    hours[dayName] = { open: openTime, close: closeTime, closed: false }
  }

  for (const day of dayNames) {
    if (!hours[day]) {
      hours[day] = { open: '', close: '', closed: true }
    }
  }

  return hours
}

// ---------------------------------------------------------------------------
// GOOGLE API
// ---------------------------------------------------------------------------

async function fetchHours(placeId: string): Promise<Record<string, unknown> | null> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`
  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'regularOpeningHours',
    },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return mapHours(data.regularOpeningHours)
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// PUSH TO PRODUCTION — reads corrected hours from local, writes to prod
// ---------------------------------------------------------------------------

async function pushToProduction() {
  const PROD_URL = getProductionUrl()
  const PROD_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!PROD_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY for production')
    process.exit(1)
  }

  log(`Local:      ${SUPABASE_URL}`)
  log(`Production: ${PROD_URL}`)

  const local = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const prod = createClient(PROD_URL, PROD_KEY)

  // 1. Read all hours from local, keyed by google_place_id
  log('Reading hours from local DB...')
  const localBiz: any[] = []
  let page = 0
  const PAGE_SIZE = 1000
  while (true) {
    const { data, error } = await local
      .from('businesses')
      .select('google_place_id, hours')
      .not('google_place_id', 'is', null)
      .not('hours', 'is', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) { console.error('Local query failed:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    localBiz.push(...data)
    if (data.length < PAGE_SIZE) break
    page++
  }

  const hoursMap = new Map<string, any>()
  for (const b of localBiz) {
    hoursMap.set(b.google_place_id, b.hours)
  }
  log(`Loaded ${hoursMap.size} businesses with hours from local`)

  // 2. Read production businesses to find matching google_place_ids
  log('Reading businesses from production DB...')
  const prodBiz: any[] = []
  page = 0
  while (true) {
    const { data, error } = await prod
      .from('businesses')
      .select('id, google_place_id, hours')
      .not('google_place_id', 'is', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) { console.error('Production query failed:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    prodBiz.push(...data)
    if (data.length < PAGE_SIZE) break
    page++
  }
  log(`Found ${prodBiz.length} businesses in production`)

  // 3. Update production where hours differ
  let updated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < prodBiz.length; i++) {
    const pb = prodBiz[i]
    const localHours = hoursMap.get(pb.google_place_id)
    if (!localHours) { skipped++; continue }

    // Only update if different
    if (JSON.stringify(pb.hours) === JSON.stringify(localHours)) {
      skipped++
      continue
    }

    const { error } = await prod
      .from('businesses')
      .update({ hours: localHours })
      .eq('id', pb.id)

    if (error) {
      failed++
      log(`  Failed to update ${pb.google_place_id}: ${error.message}`)
    } else {
      updated++
    }

    // Progress
    if ((i + 1) % 100 === 0 || i === prodBiz.length - 1) {
      log(`Progress: ${i + 1}/${prodBiz.length} (updated: ${updated}, skipped: ${skipped}, failed: ${failed})`)
    }
  }

  log(`\nPush to production done!`)
  log(`  Updated:  ${updated}`)
  log(`  Skipped:  ${skipped}`)
  log(`  Failed:   ${failed}`)
}

// ---------------------------------------------------------------------------
// REFETCH FROM GOOGLE — fetches fresh hours and updates local DB
// ---------------------------------------------------------------------------

async function main() {
  if (PUSH_TO_PROD) {
    return pushToProduction()
  }

  if (!GOOGLE_API_KEY) {
    console.error('Missing GOOGLE_PLACES_API_KEY in environment')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Find businesses with uniform hours (the broken ones we patched)
  log('Querying businesses with uniform hours (broken by dayOfWeek bug)...')

  // Fetch all businesses in pages (Supabase default limit is 1000)
  const allBusinesses: any[] = []
  let page = 0
  const PAGE_SIZE = 1000
  while (true) {
    const { data, error: err } = await supabase
      .from('businesses')
      .select('id, name, google_place_id, hours')
      .not('google_place_id', 'is', null)
      .not('hours', 'is', null)
      .order('name')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (err) {
      console.error('DB query failed:', err.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    allBusinesses.push(...data)
    if (data.length < PAGE_SIZE) break
    page++
  }
  const businesses = allBusinesses

  // Filter to ones where all 7 days are identical (the ones we "fixed" uniformly)
  const broken = (businesses ?? []).filter(b => {
    const h = b.hours as any
    if (!h?.monday || !h?.tuesday) return false
    const mon = JSON.stringify(h.monday)
    return (
      mon === JSON.stringify(h.tuesday) &&
      mon === JSON.stringify(h.wednesday) &&
      mon === JSON.stringify(h.thursday) &&
      mon === JSON.stringify(h.friday) &&
      mon === JSON.stringify(h.saturday) &&
      mon === JSON.stringify(h.sunday)
    )
  })

  log(`Found ${broken.length} businesses to re-fetch hours for`)

  if (broken.length === 0) {
    log('Nothing to do!')
    return
  }

  const toProcess = TEST_MODE ? broken.slice(0, 1) : broken

  let updated = 0
  let noHours = 0
  let failed = 0
  let unchanged = 0

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY)

    const results = await Promise.allSettled(
      batch.map(async (biz) => {
        const hours = await fetchHours(biz.google_place_id)
        return { biz, hours }
      })
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        failed++
        log(`  FAILED: ${result.reason}`)
        continue
      }

      const { biz, hours } = result.value

      if (!hours) {
        noHours++
        log(`  No hours returned: ${biz.name}`)
        continue
      }

      // Check if hours actually differ from what we have
      const currentJson = JSON.stringify(biz.hours)
      const newJson = JSON.stringify(hours)
      if (currentJson === newJson) {
        unchanged++
        continue
      }

      if (DRY_RUN) {
        log(`  [DRY RUN] ${biz.name}:`)
        console.log('    Current:', JSON.stringify(biz.hours))
        console.log('    New:    ', JSON.stringify(hours))
        updated++
        continue
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ hours })
        .eq('id', biz.id)

      if (updateError) {
        failed++
        log(`  DB update failed for ${biz.name}: ${updateError.message}`)
      } else {
        updated++
      }
    }

    // Progress
    const done = Math.min(i + CONCURRENCY, toProcess.length)
    if (done % 50 === 0 || done === toProcess.length) {
      log(`Progress: ${done}/${toProcess.length} (updated: ${updated}, no hours: ${noHours}, failed: ${failed}, unchanged: ${unchanged})`)
    }

    // Rate limit
    if (i + CONCURRENCY < toProcess.length) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  log(`\nDone!`)
  log(`  Updated:   ${updated}`)
  log(`  No hours:  ${noHours}`)
  log(`  Failed:    ${failed}`)
  log(`  Unchanged: ${unchanged}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
