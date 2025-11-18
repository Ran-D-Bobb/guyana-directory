import { User } from '@supabase/supabase-js'

/**
 * Check if a user is an admin based on their email
 * @param user - The authenticated user object
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
  return adminEmails.includes(user.email)
}

/**
 * Get admin email list from environment
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  return process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
}
