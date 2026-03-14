import type { SupabaseClient } from '@supabase/supabase-js'

// Cookie name and default
export const REGION_COOKIE = 'waypoint_region'
export const DEFAULT_REGION = 'georgetown'

// Slug -> region number display mapping
export const REGION_NUMBER_MAP: Record<string, string> = {
  'georgetown': 'Georgetown',
  'barima-waini': 'Region 1',
  'pomeroon-supenaam': 'Region 2',
  'essequibo-islands-west-demerara': 'Region 3',
  'demerara-mahaica': 'Region 4',
  'mahaica-berbice': 'Region 5',
  'east-berbice-corentyne': 'Region 6',
  'cuyuni-mazaruni': 'Region 7',
  'potaro-siparuni': 'Region 8',
  'upper-takutu-upper-essequibo': 'Region 9',
  'upper-demerara-berbice': 'Region 10',
}

// Name -> display name mapping (for cases where only name is available)
const REGION_NAME_MAP: Record<string, string> = {
  'Georgetown': 'Georgetown',
  'Barima-Waini': 'Region 1',
  'Pomeroon-Supenaam': 'Region 2',
  'Essequibo Islands-West Demerara': 'Region 3',
  'Demerara-Mahaica': 'Region 4',
  'Mahaica-Berbice': 'Region 5',
  'East Berbice-Corentyne': 'Region 6',
  'Cuyuni-Mazaruni': 'Region 7',
  'Potaro-Siparuni': 'Region 8',
  'Upper Takutu-Upper Essequibo': 'Region 9',
  'Upper Demerara-Berbice': 'Region 10',
}

/** Convert a region slug or full name to display name (e.g. "Region 4") */
export function getRegionDisplayName(slug: string | null, name?: string): string {
  if (!slug && !name) return 'All Guyana'
  if (slug && REGION_NUMBER_MAP[slug]) return REGION_NUMBER_MAP[slug]
  if (name && REGION_NAME_MAP[name]) return REGION_NAME_MAP[name]
  return name || slug || 'All Guyana'
}

/** Read the selected region slug from the cookie store (server-side) */
export function getSelectedRegionSlug(cookieStore: { get: (name: string) => { value: string } | undefined }): string {
  return cookieStore.get(REGION_COOKIE)?.value || DEFAULT_REGION
}

/**
 * Resolve a region slug to an array of region UUIDs for filtering.
 * Returns null for "all" (no filtering).
 * Uses get_region_with_children() RPC for parent regions that contain sub-regions.
 */
export async function resolveRegionFilter(
  supabase: SupabaseClient,
  slug: string | undefined
): Promise<string[] | null> {
  if (!slug || slug === 'all') return null

  // Look up region by slug
  const { data: region } = await supabase
    .from('regions')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!region) return null

  // Use RPC to get this region + all children
  const { data: regionIds } = await supabase
    .rpc('get_region_with_children', { region_id: region.id })

  if (!regionIds || regionIds.length === 0) return [region.id]

  return regionIds.map((r: { id: string }) => r.id)
}
