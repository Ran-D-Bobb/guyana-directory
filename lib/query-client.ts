import { QueryClient } from '@tanstack/react-query'

/**
 * Create a new QueryClient with optimized caching configuration
 *
 * Stale time strategy:
 * - Categories/Regions: 30 min (rarely changes)
 * - Category counts: 5 min (updates when items added)
 * - Listings: 2 min (acceptable for browsing)
 * - Detail pages: 1 min (users expect fresh data)
 * - User data: 0 (always fresh for security/personalization)
 * - Reviews: 30 sec (show new reviews quickly)
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time of 2 minutes for most data
        staleTime: 2 * 60 * 1000,
        // Cache for 10 minutes by default
        gcTime: 10 * 60 * 1000,
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't refetch on window focus by default (reduces unnecessary requests)
        refetchOnWindowFocus: false,
        // Refetch on reconnect for better offline support
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  })
}

// Browser-side query client singleton
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is important for React Suspense boundaries to work correctly
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**
 * Stale time constants for different data types
 * Use these when configuring individual queries
 */
export const STALE_TIMES = {
  // Rarely changes
  categories: 30 * 60 * 1000, // 30 minutes
  regions: 30 * 60 * 1000, // 30 minutes

  // Updates when items added
  categoryCounts: 5 * 60 * 1000, // 5 minutes

  // Acceptable for browsing
  listings: 2 * 60 * 1000, // 2 minutes

  // Users expect fresh data
  detail: 1 * 60 * 1000, // 1 minute

  // Always fresh (security/personalization)
  user: 0,

  // Show new reviews quickly
  reviews: 30 * 1000, // 30 seconds
} as const
