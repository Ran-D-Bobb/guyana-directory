import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Cached getUser() for server components.
 * Deduplicates auth calls within a single server render pass —
 * Header + page component calling getUser() only hits Supabase once.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
