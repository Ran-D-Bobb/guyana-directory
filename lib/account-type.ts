import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AccountType = 'personal' | 'business'

/**
 * Fetches the account_type for the current authenticated user.
 */
export async function getAccountType(userId: string): Promise<AccountType | null> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch account type:', error)
    return null
  }

  return (profile?.account_type as AccountType) ?? null
}

/**
 * Ensures the current user has a 'business' account.
 * Redirects to account-required page if not.
 */
export async function requireBusinessAccount(userId: string): Promise<void> {
  const accountType = await getAccountType(userId)
  if (accountType !== 'business') {
    redirect('/dashboard/account-required?type=business')
  }
}

/**
 * Ensures the current user has a 'personal' account.
 * Redirects to account-required page if not.
 */
export async function requirePersonalAccount(userId: string): Promise<void> {
  const accountType = await getAccountType(userId)
  if (accountType !== 'personal') {
    redirect('/dashboard/account-required?type=personal')
  }
}
