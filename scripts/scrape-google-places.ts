#!/usr/bin/env npx tsx
// @ts-nocheck — Supabase types are out of date (google_place_id migration not in generated types)
/**
 * Google Places API (New) Scraper for Waypoint
 *
 * Searches Google Places API (New) across Guyana regions and categories,
 * filters out non-businesses, saves a local JSON backup, then inserts
 * into the Supabase database.
 *
 * Usage:
 *   npm run scrape:google                              # scrape everything
 *   npm run scrape:google -- --region georgetown       # one region
 *   npm run scrape:google -- --category restaurants-dining  # one category
 *   npm run scrape:google -- --dry-run                 # preview only
 *   npm run scrape:google -- --no-photos               # skip photo download
 *   npm run scrape:google -- --no-db                   # save JSON only, no DB insert
 *   npm run scrape:google -- --no-text-search          # skip text search phase
 *   npm run scrape:google -- --restore <file>          # restore from a backup JSON
 *   npm run scrape:google -- --resume                  # resume from last checkpoint
 *   npm run scrape:google -- --update-existing         # update existing businesses with fresh data
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { resolve } from 'path'

// Load .env.local since we're running outside Next.js
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
    // .env.local not found — env vars must be set externally
  }
}
loadEnvFile()

import { createClient } from '@supabase/supabase-js'
import {
  GOOGLE_TYPE_TO_CATEGORY,
  SEARCH_TYPES,
  TEXT_SEARCH_QUERIES,
  SEARCH_RADIUS,
  RATE_LIMIT_MS,
  BATCH_INSERT_SIZE,
  MAX_CONCURRENT_DETAILS,
  MAX_PHOTOS_PER_BUSINESS,
  PHOTO_MAX_WIDTH,
  MIN_PHOTO_WIDTH,
  RETRY_ATTEMPTS,
  RETRY_BASE_DELAY_MS,
  GUYANA_BOUNDS,
  EXCLUDED_PLACE_TYPES,
  GENERIC_ONLY_TYPES,
  REJECTED_NAME_PATTERNS,
  BRAZILIAN_NAME_PATTERNS,
  BRAZILIAN_ADDRESS_PATTERNS,
  SEARCH_FIELD_MASK,
  DETAIL_FIELD_MASK,
} from './scrape-config'

// ---------------------------------------------------------------------------
// ENV & CLI ARGS
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const NO_PHOTOS = args.includes('--no-photos')
const NO_DB = args.includes('--no-db')
const NO_TEXT_SEARCH = args.includes('--no-text-search')
const RESUME = args.includes('--resume')
const UPDATE_EXISTING = args.includes('--update-existing')
const REGION_FILTER = getArgValue('--region')
const CATEGORY_FILTER = getArgValue('--category')
const RESTORE_FILE = getArgValue('--restore')

function getArgValue(flag: string): string | null {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

interface Region {
  id: string
  name: string
  slug: string
  type: string
  latitude: number | null
  longitude: number | null
}

interface Category {
  id: string
  name: string
  slug: string
}

// Places API (New) search result shape
interface PlaceResult {
  id: string
  displayName: { text: string; languageCode?: string }
  location: { latitude: number; longitude: number }
  types?: string[]
  primaryType?: string
}

// Places API (New) detail shape
interface PlaceDetail {
  id: string
  displayName: { text: string; languageCode?: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  googleMapsUri?: string
  editorialSummary?: { text: string; languageCode?: string }
  regularOpeningHours?: {
    openNow?: boolean
    periods?: Array<{
      open: { day: number; hour: number; minute: number }
      close?: { day: number; hour: number; minute: number }
    }>
    weekdayDescriptions?: string[]
  }
  location: { latitude: number; longitude: number }
  types?: string[]
  primaryType?: string
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>
  rating?: number
  userRatingCount?: number
  businessStatus?: string
}

interface BusinessInsert {
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  latitude: number
  longitude: number
  formatted_address: string | null
  category_id: string | null
  region_id: string | null
  google_place_id: string
  source: string
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  hours: Record<string, unknown> | null
  rating: number
  review_count: number
}

// Places API (New): photo resource name like "places/ChIJxxx/photos/AUacShyyy"
interface PhotoRef {
  name: string
  widthPx: number
}

interface BackupEntry extends BusinessInsert {
  photo_references: PhotoRef[]
  google_types: string[]
  category_slug: string | null
  region_name: string | null
  rejection_reason?: string
}

// ---------------------------------------------------------------------------
// STATS
// ---------------------------------------------------------------------------

const stats = {
  searched: 0,
  found: 0,
  inserted: 0,
  updated: 0,
  skipped: 0,
  photoUploaded: 0,
  errors: 0,
  textSearchResults: 0,
  filtered: {
    outsideGuyana: 0,
    excludedType: 0,
    genericOnly: 0,
    rejectedName: 0,
    brazilianName: 0,
    brazilianAddress: 0,
    surinameseName: 0,
    surinameseAddress: 0,
    noCategoryMatch: 0,
    closedPermanently: 0,
    closedTemporarily: 0,
    duplicateNameLocation: 0,
    tooSmallPhoto: 0,
  },
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/**
 * Makes a unique slug, preferring region disambiguation over numeric suffix.
 */
function makeUniqueSlug(
  base: string,
  regionSlug: string | null,
  existing: Set<string>
): string {
  if (!existing.has(base)) {
    existing.add(base)
    return base
  }

  // Try with region appended
  if (regionSlug) {
    const withRegion = `${base}-${regionSlug}`
    if (!existing.has(withRegion)) {
      existing.add(withRegion)
      return withRegion
    }
  }

  // Fallback to numeric counter
  let i = 2
  let slug = `${base}-${i}`
  while (existing.has(slug)) {
    i++
    slug = `${base}-${i}`
  }
  existing.add(slug)
  return slug
}

function mapCategory(
  types: string[],
  categoryMap: Map<string, string>
): { id: string; slug: string } | null {
  for (const t of types) {
    const slug = GOOGLE_TYPE_TO_CATEGORY[t]
    if (slug && categoryMap.has(slug)) {
      return { id: categoryMap.get(slug)!, slug }
    }
  }
  return null
}

function findNearestRegion(
  lat: number,
  lng: number,
  regions: Region[]
): Region | null {
  let best: Region | null = null
  let bestDist = Infinity

  for (const r of regions) {
    if (r.latitude == null || r.longitude == null) continue
    const d = Math.hypot(lat - r.latitude, lng - r.longitude)
    if (d < bestDist) {
      bestDist = d
      best = r
    }
  }
  return best
}

/**
 * Maps New API regularOpeningHours to our hours format.
 * Google Places API (New) returns `day` as an integer 0-6 (0=Sunday through 6=Saturday).
 */
function mapHours(
  openingHours?: PlaceDetail['regularOpeningHours']
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

/**
 * Generates a human-readable description from Google data.
 * Prefers Google's editorial summary, falls back to category + region template.
 */
function generateDescription(
  _name: string,
  _types: string[],
  categorySlug: string | null,
  regionName: string | null,
  editorialSummary: string | null,
  _address: string | null
): string | null {
  if (editorialSummary && editorialSummary.trim().length > 0) {
    return editorialSummary.trim()
  }

  const categoryLabel = categorySlug
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  if (categoryLabel && regionName) {
    return `${categoryLabel} located in ${regionName}, Guyana.`
  }
  if (categoryLabel) {
    return `${categoryLabel} in Guyana.`
  }
  return null
}

function log(msg: string) {
  const prefix = DRY_RUN ? '[DRY RUN] ' : ''
  console.log(`${prefix}${msg}`)
}

function logError(msg: string, err?: unknown) {
  console.error(`[ERROR] ${msg}`, err instanceof Error ? err.message : String(err ?? ''))
  stats.errors++
}

// ---------------------------------------------------------------------------
// BUSINESS FILTERING
// ---------------------------------------------------------------------------

function isInsideGuyana(lat: number, lng: number): boolean {
  return (
    lat >= GUYANA_BOUNDS.minLat && lat <= GUYANA_BOUNDS.maxLat &&
    lng >= GUYANA_BOUNDS.minLng && lng <= GUYANA_BOUNDS.maxLng
  )
}

function hasExcludedType(types: string[]): boolean {
  return types.some((t) => EXCLUDED_PLACE_TYPES.has(t))
}

function isGenericOnly(types: string[]): boolean {
  return types.length > 0 && types.every((t) => GENERIC_ONLY_TYPES.has(t))
}

function isRejectedName(name: string): boolean {
  return REJECTED_NAME_PATTERNS.some((re) => re.test(name))
}

function isBrazilianName(name: string): boolean {
  return BRAZILIAN_NAME_PATTERNS.some((re) => re.test(name))
}

function isForeignAddress(address: string): boolean {
  return BRAZILIAN_ADDRESS_PATTERNS.some((re) => re.test(address))
}

/**
 * Fuzzy duplicate check: same normalized name within ~100m threshold.
 */
function isDuplicateByNameLocation(
  name: string,
  lat: number,
  lng: number,
  accepted: BackupEntry[],
  threshold: number = 0.001 // ~100m in degrees
): boolean {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return accepted.some((b) => {
    const existingNorm = b.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (existingNorm !== normalizedName) return false
    const dist = Math.hypot(lat - b.latitude, lng - b.longitude)
    return dist < threshold
  })
}

/**
 * Returns a rejection reason string, or null if the place should be kept.
 */
function getFilterReason(
  name: string,
  types: string[],
  lat: number,
  lng: number,
  address: string | null,
  businessStatus: string | null,
  accepted: BackupEntry[]
): string | null {
  if (!isInsideGuyana(lat, lng)) {
    stats.filtered.outsideGuyana++
    return 'outside_guyana'
  }

  if (businessStatus === 'CLOSED_PERMANENTLY') {
    stats.filtered.closedPermanently++
    return 'closed_permanently'
  }

  if (businessStatus === 'CLOSED_TEMPORARILY') {
    stats.filtered.closedTemporarily++
    return 'closed_temporarily'
  }

  if (hasExcludedType(types)) {
    stats.filtered.excludedType++
    return `excluded_type: ${types.filter((t) => EXCLUDED_PLACE_TYPES.has(t)).join(', ')}`
  }

  if (isGenericOnly(types)) {
    stats.filtered.genericOnly++
    return 'generic_types_only'
  }

  if (isRejectedName(name)) {
    stats.filtered.rejectedName++
    return 'rejected_name_pattern'
  }

  if (isBrazilianName(name)) {
    stats.filtered.brazilianName++
    return `brazilian_name: ${name}`
  }

  if (address && isForeignAddress(address)) {
    stats.filtered.brazilianAddress++
    return `foreign_address: ${address}`
  }

  if (isDuplicateByNameLocation(name, lat, lng, accepted)) {
    stats.filtered.duplicateNameLocation++
    return 'duplicate_name_location'
  }

  return null
}

// ---------------------------------------------------------------------------
// RETRY & CONCURRENCY
// ---------------------------------------------------------------------------

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

async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(
      batch.map((item, idx) => processor(item, i + idx))
    )
    for (const r of batchResults) {
      if (r.status === 'fulfilled' && r.value !== undefined) {
        results.push(r.value)
      } else if (r.status === 'rejected') {
        logError(`Batch processor rejected`, r.reason)
      }
    }
    if (i + concurrency < items.length) await sleep(RATE_LIMIT_MS)
  }
  return results
}

// ---------------------------------------------------------------------------
// CHECKPOINT — incremental progress saving
// ---------------------------------------------------------------------------

const SCRIPTS_DIR = resolve(process.cwd(), 'scripts')

function getCheckpointPath(): string {
  return resolve(SCRIPTS_DIR, 'scrape-checkpoint.json')
}

function saveCheckpoint(
  accepted: BackupEntry[],
  rejected: BackupEntry[],
  processedCount: number
) {
  const checkpoint = {
    saved_at: new Date().toISOString(),
    processed_count: processedCount,
    accepted_count: accepted.length,
    rejected_count: rejected.length,
    accepted,
    rejected,
    stats,
  }
  writeFileSync(getCheckpointPath(), JSON.stringify(checkpoint, null, 2), 'utf-8')
}

function loadCheckpoint(): {
  accepted: BackupEntry[]
  rejected: BackupEntry[]
  processedCount: number
} | null {
  const path = getCheckpointPath()
  if (!existsSync(path)) return null

  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw)
    log(`Found checkpoint: ${data.accepted_count} accepted, ${data.rejected_count} rejected (saved ${data.saved_at})`)
    return {
      accepted: data.accepted ?? [],
      rejected: data.rejected ?? [],
      processedCount: data.processed_count ?? 0,
    }
  } catch (err) {
    log(`Could not read checkpoint: ${err}`)
    return null
  }
}

function deleteCheckpoint() {
  const path = getCheckpointPath()
  if (existsSync(path)) {
    try {
      unlinkSync(path)
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// LOCAL BACKUP
// ---------------------------------------------------------------------------

function getBackupFilePath(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return resolve(SCRIPTS_DIR, `scrape-backup-${timestamp}.json`)
}

function findLatestCheckpoint(): string | null {
  try {
    const files = readdirSync(SCRIPTS_DIR)
    const checkpoints = files
      .filter((f) => f === 'scrape-checkpoint.json')
      .map((f) => resolve(SCRIPTS_DIR, f))
    return checkpoints.length > 0 ? checkpoints[0] : null
  } catch {
    return null
  }
}

function saveBackup(accepted: BackupEntry[], rejected: BackupEntry[]) {
  const backupPath = getBackupFilePath()
  const backup = {
    scraped_at: new Date().toISOString(),
    total_found: accepted.length + rejected.length,
    accepted_count: accepted.length,
    rejected_count: rejected.length,
    filters_applied: stats.filtered,
    accepted,
    rejected,
  }

  writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8')
  log(`Backup saved to: ${backupPath}`)
  log(`  Accepted: ${accepted.length} | Rejected: ${rejected.length}`)
  return backupPath
}

// ---------------------------------------------------------------------------
// GOOGLE PLACES API (NEW)
// ---------------------------------------------------------------------------

/**
 * Nearby Search (New) — POST request, max 20 results, NO pagination.
 * Server-side filtering via excludedTypes reduces junk results.
 */
async function nearbySearch(
  lat: number,
  lng: number,
  type: string,
  radius: number,
): Promise<{ results: PlaceResult[] }> {
  const body = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius,
      },
    },
    includedTypes: [type],
    excludedTypes: Array.from(EXCLUDED_PLACE_TYPES),
    maxResultCount: 20,
    languageCode: 'en',
    regionCode: 'GY',
  }

  const res = await fetchWithRetry('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Nearby search failed: ${res.status}`)
  const data = await res.json()
  return { results: data.places ?? [] }
}

/**
 * Text Search (New) — POST request, supports pagination via nextPageToken.
 */
async function textSearch(
  query: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 20,
    languageCode: 'en',
    regionCode: 'GY',
  }
  if (pageToken) body.pageToken = pageToken

  const res = await fetchWithRetry('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Text search failed: ${res.status}`)
  const data = await res.json()
  return {
    results: data.places ?? [],
    nextPageToken: data.nextPageToken,
  }
}

/**
 * Place Details (New) — GET request. Response is the place object directly,
 * not wrapped in a `result` field. No `status` field to check.
 */
async function getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': DETAIL_FIELD_MASK,
    },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Place details failed: ${res.status}`)
  }

  return await res.json()
}

/**
 * Download a photo using its resource name (New API format).
 * photoName: "places/ChIJxxx/photos/AUacShyyy"
 */
async function downloadPhoto(
  photoName: string,
  maxWidth: number = PHOTO_MAX_WIDTH
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`

  try {
    const res = await fetchWithRetry(url)
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const arrayBuffer = await res.arrayBuffer()
    return { buffer: Buffer.from(arrayBuffer), contentType }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// SUPABASE OPERATIONS
// ---------------------------------------------------------------------------

function createSupabase() {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!) as any
}

async function loadRegions(supabase: ReturnType<typeof createClient>): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('id, name, slug, type, latitude, longitude')
    .order('display_order')

  if (error) throw new Error(`Failed to load regions: ${error.message}`)
  return data ?? []
}

async function loadCategories(supabase: ReturnType<typeof createClient>): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')

  if (error) throw new Error(`Failed to load categories: ${error.message}`)
  return data ?? []
}

async function getExistingPlaceIds(
  supabase: ReturnType<typeof createClient>
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('businesses')
    .select('google_place_id')
    .not('google_place_id', 'is', null)

  if (error) throw new Error(`Failed to load existing IDs: ${error.message}`)
  return new Set(
    (data ?? [])
      .map((r: { google_place_id: string }) => r.google_place_id)
      .filter(Boolean)
  )
}

async function getExistingSlugs(
  supabase: ReturnType<typeof createClient>
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('businesses')
    .select('slug')

  if (error) throw new Error(`Failed to load slugs: ${error.message}`)
  return new Set((data ?? []).map((r: { slug: string }) => r.slug))
}

async function insertBatch(
  supabase: ReturnType<typeof createClient>,
  businesses: BusinessInsert[]
): Promise<string[]> {
  const { data, error } = await supabase
    .from('businesses')
    .insert(businesses)
    .select('id, name')

  if (error) {
    logError(`Batch insert failed: ${error.message}`)
    return []
  }
  return (data ?? []).map((b) => b.id)
}

/**
 * Updates an existing business record with fresh data from Google.
 * Only updates fields that are safe to overwrite (not manually curated fields).
 */
async function updateExistingBusiness(
  supabase: ReturnType<typeof createClient>,
  placeId: string,
  detail: PlaceDetail
): Promise<boolean> {
  const updatePayload: Record<string, unknown> = {}

  if (detail.nationalPhoneNumber || detail.internationalPhoneNumber) {
    updatePayload.phone = detail.nationalPhoneNumber ?? detail.internationalPhoneNumber
  }
  if (detail.websiteUri) updatePayload.website = detail.websiteUri
  if (detail.rating != null) updatePayload.rating = detail.rating
  if (detail.userRatingCount != null) {
    updatePayload.review_count = detail.userRatingCount
  }

  const mappedHours = mapHours(detail.regularOpeningHours)
  if (mappedHours) updatePayload.hours = mappedHours

  if (Object.keys(updatePayload).length === 0) return false

  const { error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('google_place_id', placeId)

  if (error) {
    logError(`Update failed for place ${placeId}: ${error.message}`)
    return false
  }

  return true
}

async function uploadPhotos(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
  businessSlug: string,
  photoRefs: PhotoRef[]
): Promise<number> {
  let uploaded = 0
  const validRefs = photoRefs
    .filter((p) => p.widthPx >= MIN_PHOTO_WIDTH)
    .slice(0, MAX_PHOTOS_PER_BUSINESS)

  if (validRefs.length < photoRefs.length) {
    stats.filtered.tooSmallPhoto += photoRefs.length - validRefs.length
  }

  for (let i = 0; i < validRefs.length; i++) {
    const ref = validRefs[i]
    const isPrimary = i === 0
    const suffix = isPrimary ? 'primary' : `photo-${i}`
    const result = await downloadPhoto(ref.name)
    if (!result) continue

    const ext = result.contentType.includes('png') ? 'png' : 'jpg'
    const fileName = `${businessSlug}-${suffix}.${ext}`
    const filePath = `${businessId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('business-photos')
      .upload(filePath, result.buffer, {
        contentType: result.contentType,
        upsert: true,
      })

    if (uploadError) {
      logError(`Photo upload failed for ${businessSlug} #${i}: ${uploadError.message}`)
      continue
    }

    const { data: urlData } = supabase.storage
      .from('business-photos')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('business_photos').insert({
      business_id: businessId,
      image_url: urlData.publicUrl,
      display_order: i,
      is_primary: isPrimary,
    })

    if (dbError) {
      logError(`Photo DB insert failed for ${businessSlug} #${i}: ${dbError.message}`)
      continue
    }

    uploaded++
    await sleep(RATE_LIMIT_MS)
  }

  return uploaded
}

// ---------------------------------------------------------------------------
// RESTORE FROM BACKUP
// ---------------------------------------------------------------------------

async function restoreFromBackup(filePath: string) {
  log(`=== Restoring from backup: ${filePath} ===`)

  if (!existsSync(filePath)) {
    console.error(`Backup file not found: ${filePath}`)
    process.exit(1)
  }

  const raw = readFileSync(filePath, 'utf-8')
  const backup = JSON.parse(raw)
  const entries: BackupEntry[] = backup.accepted

  if (!entries || entries.length === 0) {
    console.error('No accepted entries in backup file')
    process.exit(1)
  }

  log(`Found ${entries.length} businesses in backup`)

  const supabase = createSupabase()
  const existingPlaceIds = await getExistingPlaceIds(supabase)
  const existingSlugs = await getExistingSlugs(supabase)

  // Load categories and regions from TARGET database to remap IDs by slug/name
  const [categories, regions] = await Promise.all([
    loadCategories(supabase),
    loadRegions(supabase),
  ])
  const catSlugToId = new Map<string, string>()
  for (const c of categories) catSlugToId.set(c.slug, c.id)
  const regionNameToId = new Map<string, string>()
  for (const r of regions) regionNameToId.set(r.name, r.id)
  log(`  Target DB: ${categories.length} categories, ${regions.length} regions`)

  const toInsert: BusinessInsert[] = []
  const photoQueue: Array<{
    slug: string
    photoRefs: PhotoRef[]
    batchIndex: number
  }> = []

  for (const entry of entries) {
    if (existingPlaceIds.has(entry.google_place_id)) {
      log(`  Skip (exists): ${entry.name}`)
      continue
    }

    // Remap category and region IDs to target database
    const remappedCategoryId = entry.category_slug
      ? catSlugToId.get(entry.category_slug) ?? null
      : null
    const remappedRegionId = entry.region_name
      ? regionNameToId.get(entry.region_name) ?? null
      : null

    const slug = makeUniqueSlug(
      generateSlug(entry.name),
      entry.region_name ? generateSlug(entry.region_name) : null,
      existingSlugs
    )

    const business: BusinessInsert = {
      name: entry.name,
      slug,
      description: entry.description,
      phone: entry.phone,
      email: entry.email,
      website: entry.website,
      address: entry.address,
      latitude: entry.latitude,
      longitude: entry.longitude,
      formatted_address: entry.formatted_address,
      category_id: remappedCategoryId,
      region_id: remappedRegionId,
      google_place_id: entry.google_place_id,
      source: entry.source ?? 'google_places',
      is_verified: false,
      is_featured: false,
      is_active: true,
      hours: entry.hours,
      rating: entry.rating ?? 0,
      review_count: entry.review_count ?? 0,
    }

    toInsert.push(business)

    // Support both old backup format (photo_reference string) and new format (name resource name).
    // Old format: { photo_reference: "xxx", width: 800 }
    // New format: { name: "places/xxx/photos/yyy", widthPx: 1200 }
    let refs: PhotoRef[] = []
    if (entry.photo_references?.length > 0) {
      refs = entry.photo_references.map((p: any) => {
        // If it already has a `name` field it's the new format
        if (p.name) return p as PhotoRef
        // Otherwise it's the old format — reconstruct a resource name from the reference
        return {
          name: `places/${entry.google_place_id}/photos/${p.photo_reference}`,
          widthPx: p.width ?? PHOTO_MAX_WIDTH,
        } as PhotoRef
      })
    } else if ((entry as any).photo_reference) {
      // Very old single-reference format
      refs = [{
        name: `places/${entry.google_place_id}/photos/${(entry as any).photo_reference}`,
        widthPx: PHOTO_MAX_WIDTH,
      }]
    }

    if (refs.length > 0) {
      photoQueue.push({ slug, photoRefs: refs, batchIndex: toInsert.length - 1 })
    }
  }

  log(`Inserting ${toInsert.length} businesses (${entries.length - toInsert.length} already exist)`)

  if (DRY_RUN) {
    log('DRY RUN — skipping insert')
    return
  }

  const insertedIds: string[] = []
  for (let i = 0; i < toInsert.length; i += BATCH_INSERT_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_INSERT_SIZE)
    const ids = await insertBatch(supabase, chunk)
    insertedIds.push(...ids)
    log(`  Inserted batch ${Math.floor(i / BATCH_INSERT_SIZE) + 1}: ${ids.length} businesses`)
  }

  if (!NO_PHOTOS && photoQueue.length > 0) {
    log(`Uploading photos for ${photoQueue.length} businesses...`)
    for (let i = 0; i < photoQueue.length; i++) {
      const { slug, photoRefs, batchIndex } = photoQueue[i]
      if (batchIndex >= insertedIds.length) continue
      const businessId = insertedIds[batchIndex]
      if (!businessId) continue

      try {
        const count = await uploadPhotos(supabase, businessId, slug, photoRefs)
        stats.photoUploaded += count
        if ((i + 1) % 25 === 0) log(`  Photos: ${i + 1}/${photoQueue.length}`)
      } catch (err) {
        logError(`Photo failed for ${slug}`, err)
      }
    }
  }

  log(`Restore complete. Inserted: ${insertedIds.length}, Photos: ${stats.photoUploaded}`)
}

// ---------------------------------------------------------------------------
// MAIN SCRAPER
// ---------------------------------------------------------------------------

async function main() {
  // Handle restore mode
  if (RESTORE_FILE) {
    await restoreFromBackup(resolve(process.cwd(), RESTORE_FILE))
    return
  }

  // Validate env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  if (!GOOGLE_API_KEY) {
    console.error('Missing GOOGLE_PLACES_API_KEY')
    process.exit(1)
  }

  log('=== Waypoint Google Places Scraper (New API) ===')
  log(`Mode: ${DRY_RUN ? 'DRY RUN' : NO_DB ? 'JSON ONLY (no DB)' : 'LIVE'}`)
  if (REGION_FILTER) log(`Region filter: ${REGION_FILTER}`)
  if (CATEGORY_FILTER) log(`Category filter: ${CATEGORY_FILTER}`)
  if (NO_PHOTOS) log('Photos: SKIPPED')
  if (NO_TEXT_SEARCH) log('Text search: SKIPPED')
  if (UPDATE_EXISTING) log('Update existing: ENABLED')
  if (RESUME) log('Resume mode: ON')
  log('')

  const supabase = createSupabase()

  // Load reference data
  const [regions, categories] = await Promise.all([
    loadRegions(supabase),
    loadCategories(supabase),
  ])

  log(`Loaded ${regions.length} regions, ${categories.length} categories`)

  // Build lookup maps
  const categoryMap = new Map<string, string>() // slug → id
  for (const c of categories) categoryMap.set(c.slug, c.id)

  // Determine which Google types to search for
  const searchTypesFiltered = CATEGORY_FILTER
    ? SEARCH_TYPES.filter((t) => GOOGLE_TYPE_TO_CATEGORY[t] === CATEGORY_FILTER)
    : SEARCH_TYPES

  if (CATEGORY_FILTER && searchTypesFiltered.length === 0) {
    console.error(`No Google types map to category "${CATEGORY_FILTER}"`)
    process.exit(1)
  }

  // Filter regions
  const searchRegions = REGION_FILTER
    ? regions.filter((r) => r.slug === REGION_FILTER)
    : regions

  if (REGION_FILTER && searchRegions.length === 0) {
    console.error(`Region "${REGION_FILTER}" not found`)
    process.exit(1)
  }

  // Load existing data for dedup
  const existingPlaceIds = await getExistingPlaceIds(supabase)
  const existingSlugs = await getExistingSlugs(supabase)
  log(`Existing businesses: ${existingSlugs.size} (${existingPlaceIds.size} from Google)`)
  log('')

  // -------------------------------------------------------------------------
  // PHASE 1: Nearby Search — collect unique place IDs
  // Nearby Search (New) returns max 20 results and has NO pagination.
  // -------------------------------------------------------------------------
  const placeIdSet = new Set<string>()
  const placeIdToTypes = new Map<string, string[]>()

  log('--- Phase 1: Nearby Search ---')
  for (const region of searchRegions) {
    if (!region.latitude || !region.longitude) {
      log(`Skipping ${region.name} — no coordinates`)
      continue
    }

    const radius = SEARCH_RADIUS[region.type] ?? 5000

    for (const type of searchTypesFiltered) {
      try {
        await sleep(RATE_LIMIT_MS)

        // Single call — Nearby Search (New) does not support pagination
        const { results } = await nearbySearch(
          region.latitude,
          region.longitude,
          type,
          radius,
        )

        for (const r of results) {
          const lat = r.location.latitude
          const lng = r.location.longitude
          if (!isInsideGuyana(lat, lng)) {
            stats.filtered.outsideGuyana++
            continue
          }

          if (!existingPlaceIds.has(r.id) || UPDATE_EXISTING) {
            placeIdSet.add(r.id)
            const existing = placeIdToTypes.get(r.id) ?? []
            placeIdToTypes.set(r.id, [
              ...new Set([...existing, ...(r.types ?? [])]),
            ])
          }
        }

        if (results.length > 0) {
          log(`  ${region.name} / ${type}: ${results.length} results`)
        }
        stats.searched++
      } catch (err) {
        logError(`Nearby search failed for ${region.name}/${type}`, err)
      }
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 1b: Text Search (supplementary)
  // Text Search (New) supports pagination via nextPageToken.
  // -------------------------------------------------------------------------
  if (!NO_TEXT_SEARCH && !CATEGORY_FILTER) {
    log('')
    log('--- Phase 1b: Text Search (supplementary) ---')

    for (const { query } of TEXT_SEARCH_QUERIES) {
      try {
        let pageToken: string | undefined
        let totalForQuery = 0

        do {
          await sleep(RATE_LIMIT_MS)
          if (pageToken) await sleep(2000) // short wait between pages

          const { results, nextPageToken } = await textSearch(query, pageToken)

          for (const r of results) {
            const lat = r.location.latitude
            const lng = r.location.longitude
            if (!isInsideGuyana(lat, lng)) continue

            if (!existingPlaceIds.has(r.id) || UPDATE_EXISTING) {
              if (!placeIdSet.has(r.id)) {
                placeIdSet.add(r.id)
              }
              const existing = placeIdToTypes.get(r.id) ?? []
              placeIdToTypes.set(r.id, [
                ...new Set([...existing, ...(r.types ?? [])]),
              ])
            }
          }

          totalForQuery += results.length
          pageToken = nextPageToken
          stats.searched++
        } while (pageToken)

        stats.textSearchResults += totalForQuery
        if (totalForQuery > 0) {
          log(`  "${query}": ${totalForQuery} results`)
        }
      } catch (err) {
        logError(`Text search failed for "${query}"`, err)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Separate new from existing (for UPDATE_EXISTING mode)
  // -------------------------------------------------------------------------
  const newPlaceIds: string[] = []
  const existingPlaceIdsToUpdate: string[] = []

  for (const id of placeIdSet) {
    if (existingPlaceIds.has(id)) {
      existingPlaceIdsToUpdate.push(id)
    } else {
      newPlaceIds.push(id)
    }
  }

  stats.found = newPlaceIds.length
  stats.skipped = existingPlaceIds.size - existingPlaceIdsToUpdate.length

  log('')
  log(`Found ${newPlaceIds.length} new places (${existingPlaceIds.size} already exist)`)
  if (UPDATE_EXISTING) {
    log(`Will update ${existingPlaceIdsToUpdate.length} existing places`)
  }
  log('')

  // -------------------------------------------------------------------------
  // PHASE 2: Fetch Place Details, filter, and build batch
  // -------------------------------------------------------------------------
  log('--- Phase 2: Fetching Place Details ---')

  // Resume from checkpoint if requested
  let accepted: BackupEntry[] = []
  let rejected: BackupEntry[] = []
  let startIndex = 0

  if (RESUME) {
    const checkpoint = loadCheckpoint()
    if (checkpoint) {
      accepted = checkpoint.accepted
      rejected = checkpoint.rejected
      startIndex = checkpoint.processedCount
      log(`Resuming from index ${startIndex}`)
    } else {
      log('No checkpoint found — starting fresh')
    }
  }

  const idsToProcess = newPlaceIds.slice(startIndex)
  let processedCount = startIndex

  // Processor function for a single place ID
  const processPlaceId = async (
    placeId: string,
    globalIndex: number
  ): Promise<BackupEntry | undefined> => {
    await sleep(RATE_LIMIT_MS * Math.random() * 0.5) // stagger concurrent requests

    const detail = await getPlaceDetails(placeId)
    if (!detail) return undefined

    const types = placeIdToTypes.get(placeId) ?? detail.types ?? []
    const lat = detail.location.latitude
    const lng = detail.location.longitude
    const address = detail.formattedAddress ?? null
    const businessStatus = detail.businessStatus ?? null

    const categoryResult = mapCategory(types, categoryMap)
    const region = findNearestRegion(lat, lng, regions)

    const editorialSummary = detail.editorialSummary?.text ?? null
    const description = generateDescription(
      detail.displayName.text,
      types,
      categoryResult?.slug ?? null,
      region?.name ?? null,
      editorialSummary,
      address
    )

    // Collect photo references (up to MAX_PHOTOS_PER_BUSINESS)
    const photoRefs: PhotoRef[] = (detail.photos ?? [])
      .slice(0, MAX_PHOTOS_PER_BUSINESS)
      .map((p) => ({ name: p.name, widthPx: p.widthPx }))

    const baseSlug = generateSlug(detail.displayName.text)
    const slug = makeUniqueSlug(
      baseSlug,
      region?.slug ?? null,
      existingSlugs
    )

    const entry: BackupEntry = {
      name: detail.displayName.text,
      slug,
      description,
      phone: detail.nationalPhoneNumber ?? detail.internationalPhoneNumber ?? null,
      email: null,
      website: detail.websiteUri ?? null,
      address,
      latitude: lat,
      longitude: lng,
      formatted_address: address,
      category_id: categoryResult?.id ?? null,
      region_id: region?.id ?? null,
      google_place_id: detail.id,
      source: 'google_places',
      is_verified: false,
      is_featured: false,
      is_active: true,
      hours: mapHours(detail.regularOpeningHours),
      rating: detail.rating ?? 0,
      review_count: detail.userRatingCount ?? 0,
      photo_references: photoRefs,
      google_types: types,
      category_slug: categoryResult?.slug ?? null,
      region_name: region?.name ?? null,
    }

    // Apply filter — pass current accepted list for dedup check
    const rejection = getFilterReason(
      detail.displayName.text,
      types,
      lat,
      lng,
      address,
      businessStatus,
      accepted
    )

    if (!rejection && !categoryResult) {
      stats.filtered.noCategoryMatch++
    }

    if (rejection) {
      entry.rejection_reason = rejection
    } else if (!categoryResult) {
      entry.rejection_reason = 'no_category_match'
    }

    return entry
  }

  // Process in concurrent batches with checkpoint saving
  for (let i = 0; i < idsToProcess.length; i += MAX_CONCURRENT_DETAILS) {
    const batch = idsToProcess.slice(i, i + MAX_CONCURRENT_DETAILS)

    const batchResults = await Promise.allSettled(
      batch.map((id, idx) => processPlaceId(id, startIndex + i + idx))
    )

    for (const result of batchResults) {
      if (result.status === 'rejected') {
        logError('Place detail fetch failed', result.reason)
        continue
      }
      const entry = result.value
      if (!entry) continue

      if (entry.rejection_reason) {
        rejected.push(entry)
      } else {
        accepted.push(entry)
      }
    }

    processedCount = startIndex + i + batch.length

    // Progress log
    if (processedCount % 50 === 0 || processedCount === startIndex + idsToProcess.length) {
      log(
        `  Fetched details: ${processedCount}/${startIndex + idsToProcess.length} ` +
        `(${accepted.length} accepted, ${rejected.length} rejected)`
      )
    }

    // Save checkpoint every 100 processed
    if (processedCount % 100 === 0) {
      saveCheckpoint(accepted, rejected, processedCount)
      log(`  Checkpoint saved at ${processedCount}`)
    }

    // Delay between batches of concurrent requests
    if (i + MAX_CONCURRENT_DETAILS < idsToProcess.length) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 2b: Update existing businesses
  // -------------------------------------------------------------------------
  if (UPDATE_EXISTING && existingPlaceIdsToUpdate.length > 0 && !DRY_RUN && !NO_DB) {
    log('')
    log('--- Phase 2b: Updating existing businesses ---')
    let updatedCount = 0

    await processInBatches(
      existingPlaceIdsToUpdate,
      MAX_CONCURRENT_DETAILS,
      async (placeId) => {
        await sleep(RATE_LIMIT_MS)
        const detail = await getPlaceDetails(placeId)
        if (!detail) return

        const ok = await updateExistingBusiness(supabase, placeId, detail)
        if (ok) {
          updatedCount++
          stats.updated++
        }
      }
    )

    log(`Updated ${updatedCount} existing businesses`)
  }

  log('')
  log(`Filtering complete: ${accepted.length} accepted, ${rejected.length} rejected`)

  // -------------------------------------------------------------------------
  // PHASE 3: Save local backup (ALWAYS — before any DB operations)
  // -------------------------------------------------------------------------
  const backupPath = saveBackup(accepted, rejected)

  // -------------------------------------------------------------------------
  // PHASE 4: Preview / Insert
  // -------------------------------------------------------------------------
  if (DRY_RUN || NO_DB) {
    log('')
    log('=== PREVIEW (top 30) ===')
    for (const b of accepted.slice(0, 30)) {
      log(
        `  ${b.name} | ${b.category_slug ?? '?'} | ${b.region_name ?? '?'} | ${b.phone ?? 'no phone'}`
      )
    }
    if (accepted.length > 30) log(`  ... and ${accepted.length - 30} more`)

    if (rejected.length > 0) {
      log('')
      log('=== REJECTED (top 20) ===')
      for (const b of rejected.slice(0, 20)) {
        log(`  ${b.name} => ${b.rejection_reason}`)
      }
      if (rejected.length > 20) log(`  ... and ${rejected.length - 20} more`)
    }

    log('')
    printSummary(accepted)
    return
  }

  // Build insert-ready batch (strip backup-only fields)
  const batch: BusinessInsert[] = accepted.map(
    ({ photo_references, google_types, category_slug, region_name, rejection_reason, ...rest }) => rest
  )

  log('')
  log('Inserting into database...')
  const insertedIds: string[] = []

  for (let i = 0; i < batch.length; i += BATCH_INSERT_SIZE) {
    const chunk = batch.slice(i, i + BATCH_INSERT_SIZE)
    const ids = await insertBatch(supabase, chunk)
    insertedIds.push(...ids)
    stats.inserted += ids.length
    log(`  Inserted batch ${Math.floor(i / BATCH_INSERT_SIZE) + 1}: ${ids.length} businesses`)
  }

  // Upload photos — one business at a time (photos are a secondary concern)
  if (!NO_PHOTOS) {
    const photoQueue = accepted
      .map((entry, idx) => ({
        slug: entry.slug,
        photoRefs: entry.photo_references,
        batchIndex: idx,
      }))
      .filter((p) => p.photoRefs.length > 0)

    if (photoQueue.length > 0) {
      log('')
      log(`Uploading photos for ${photoQueue.length} businesses...`)

      for (let i = 0; i < photoQueue.length; i++) {
        const { slug, photoRefs, batchIndex } = photoQueue[i]
        if (batchIndex >= insertedIds.length) continue
        const businessId = insertedIds[batchIndex]
        if (!businessId) continue

        try {
          const count = await uploadPhotos(supabase, businessId, slug, photoRefs)
          stats.photoUploaded += count
          if ((i + 1) % 25 === 0) log(`  Photos: ${i + 1}/${photoQueue.length}`)
        } catch (err) {
          logError(`Photo upload failed for ${slug}`, err)
        }
      }
    }
  }

  // Clean up checkpoint on successful completion
  deleteCheckpoint()

  log('')
  printSummary(accepted)
  log('')
  log(`Backup file: ${backupPath}`)
  log('You can restore from this backup with: npm run scrape:google -- --restore <file>')
}

function printSummary(accepted: BackupEntry[]) {
  const totalFiltered = Object.values(stats.filtered).reduce((a, b) => a + b, 0)
  log('=== SUMMARY ===')
  log(`  API searches:           ${stats.searched}`)
  log(`  Text search results:    ${stats.textSearchResults}`)
  log(`  New places found:       ${stats.found}`)
  log(`  Already existed:        ${stats.skipped}`)
  log(`  Updated existing:       ${stats.updated}`)
  log(`  Filtered out:           ${totalFiltered}`)
  log(`    Outside Guyana:         ${stats.filtered.outsideGuyana}`)
  log(`    Excluded type:          ${stats.filtered.excludedType}`)
  log(`    Generic only:           ${stats.filtered.genericOnly}`)
  log(`    Bad name:               ${stats.filtered.rejectedName}`)
  log(`    Brazilian name:         ${stats.filtered.brazilianName}`)
  log(`    Foreign address:        ${stats.filtered.brazilianAddress}`)
  log(`    Closed permanently:     ${stats.filtered.closedPermanently}`)
  log(`    Closed temporarily:     ${stats.filtered.closedTemporarily}`)
  log(`    Duplicate (name+loc):   ${stats.filtered.duplicateNameLocation}`)
  log(`    No category match:      ${stats.filtered.noCategoryMatch}`)
  log(`    Photo too small:        ${stats.filtered.tooSmallPhoto}`)
  log(`  Accepted:               ${accepted.length}`)
  log(`  Inserted:               ${stats.inserted}`)
  log(`  Photos uploaded:        ${stats.photoUploaded}`)
  log(`  Errors:                 ${stats.errors}`)
}

// Run
main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
