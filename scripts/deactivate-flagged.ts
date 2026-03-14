#!/usr/bin/env npx tsx
/**
 * Deactivate flagged businesses from audit-report.json
 * Keeps: Courts, Kamboat
 */

import { readFileSync } from 'fs'
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
      if (!process.env[key]) process.env[key] = value
    }
  } catch {}
}
loadEnvFile()

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Names to KEEP (case-insensitive match)
const KEEP_NAMES = ['courts', 'kamboat']

async function main() {
  if (!SUPABASE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const reportPath = resolve(process.cwd(), 'scripts', 'audit-report.json')
  const report = JSON.parse(readFileSync(reportPath, 'utf-8'))

  // Collect all flagged business IDs, excluding the ones to keep
  const toDeactivate: { id: string; name: string }[] = []
  const kept: { id: string; name: string }[] = []

  for (const [, group] of Object.entries(report.flagged_by_category) as [string, any][]) {
    for (const biz of group.businesses) {
      if (KEEP_NAMES.some(k => biz.name.toLowerCase().trim() === k)) {
        kept.push({ id: biz.id, name: biz.name })
      } else if (biz.is_active) {
        toDeactivate.push({ id: biz.id, name: biz.name })
      }
    }
  }

  console.log(`=== Deactivating Flagged Businesses ===`)
  console.log(`Total flagged: ${report.total_flagged}`)
  console.log(`Keeping: ${kept.length} (${kept.map(k => k.name).join(', ')})`)
  console.log(`Already inactive: ${report.already_inactive}`)
  console.log(`To deactivate now: ${toDeactivate.length}`)
  console.log('')

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Deactivate in batches of 50
  let totalDone = 0
  const ids = toDeactivate.map(b => b.id)

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const { error } = await supabase
      .from('businesses')
      .update({ is_active: false })
      .in('id', batch)

    if (error) {
      console.error(`Error on batch ${Math.floor(i / 50) + 1}: ${error.message}`)
    } else {
      totalDone += batch.length
      console.log(`Batch ${Math.floor(i / 50) + 1}: deactivated ${batch.length} businesses (${totalDone}/${ids.length})`)
    }
  }

  console.log('')
  console.log(`Done. ${totalDone} businesses set to is_active=false.`)
  console.log('')

  // Show final counts
  const { data: cats } = await supabase.from('categories').select('id, name')
  console.log('=== ACTIVE BUSINESS COUNTS ===')
  for (const c of (cats || []).sort((a, b) => a.name.localeCompare(b.name))) {
    const { count } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', c.id)
      .eq('is_active', true)
    if (count != null && count > 0) {
      console.log(`  ${c.name.padEnd(30)} ${String(count).padStart(5)}`)
    }
  }
  const { count: total } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  console.log('')
  console.log(`TOTAL ACTIVE: ${total}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
