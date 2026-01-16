/**
 * Centralized query key factory for TanStack Query
 * Provides type-safe, organized query keys for cache management
 *
 * Usage:
 *   queryKey: queryKeys.businesses.list()
 *   queryKey: queryKeys.businesses.detail('my-business-slug')
 *   queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all })
 */

export const queryKeys = {
  // ============================================================
  // Businesses
  // ============================================================
  businesses: {
    all: ['businesses'] as const,
    lists: () => [...queryKeys.businesses.all, 'list'] as const,
    list: (filters?: {
      categorySlug?: string
      regionSlug?: string
      sort?: string
      search?: string
    }) => [...queryKeys.businesses.lists(), filters] as const,
    details: () => [...queryKeys.businesses.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.businesses.details(), slug] as const,
    reviews: (businessId: string) =>
      [...queryKeys.businesses.all, 'reviews', businessId] as const,
  },

  // ============================================================
  // Events
  // ============================================================
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters?: {
      categorySlug?: string
      timeFilter?: string
      sort?: string
    }) => [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.events.details(), slug] as const,
  },

  // ============================================================
  // Tourism
  // ============================================================
  tourism: {
    all: ['tourism'] as const,
    lists: () => [...queryKeys.tourism.all, 'list'] as const,
    list: (filters?: {
      categorySlug?: string
      regionSlug?: string
      sort?: string
    }) => [...queryKeys.tourism.lists(), filters] as const,
    details: () => [...queryKeys.tourism.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.tourism.details(), slug] as const,
  },

  // ============================================================
  // Rentals
  // ============================================================
  rentals: {
    all: ['rentals'] as const,
    lists: () => [...queryKeys.rentals.all, 'list'] as const,
    list: (filters?: {
      categorySlug?: string
      regionSlug?: string
      propertyType?: string
      sort?: string
    }) => [...queryKeys.rentals.lists(), filters] as const,
    details: () => [...queryKeys.rentals.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.rentals.details(), slug] as const,
    reviews: (rentalId: string) =>
      [...queryKeys.rentals.all, 'reviews', rentalId] as const,
  },

  // ============================================================
  // Categories
  // ============================================================
  categories: {
    all: ['categories'] as const,
    businesses: () => [...queryKeys.categories.all, 'businesses'] as const,
    businessesWithCounts: () =>
      [...queryKeys.categories.businesses(), 'counts'] as const,
    events: () => [...queryKeys.categories.all, 'events'] as const,
    eventsWithCounts: (timeFilter?: string) =>
      [...queryKeys.categories.events(), 'counts', timeFilter] as const,
    tourism: () => [...queryKeys.categories.all, 'tourism'] as const,
    tourismWithCounts: () =>
      [...queryKeys.categories.tourism(), 'counts'] as const,
    rentals: () => [...queryKeys.categories.all, 'rentals'] as const,
    rentalsWithCounts: () =>
      [...queryKeys.categories.rentals(), 'counts'] as const,
  },

  // ============================================================
  // Regions
  // ============================================================
  regions: {
    all: ['regions'] as const,
    list: () => [...queryKeys.regions.all, 'list'] as const,
  },

  // ============================================================
  // User Data
  // ============================================================
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    savedBusinesses: () => [...queryKeys.user.all, 'saved-businesses'] as const,
    savedRentals: () => [...queryKeys.user.all, 'saved-rentals'] as const,
    eventInterests: () => [...queryKeys.user.all, 'event-interests'] as const,
    reviews: () => [...queryKeys.user.all, 'reviews'] as const,
  },

  // ============================================================
  // Search
  // ============================================================
  search: {
    all: ['search'] as const,
    results: (query: string, type?: string) =>
      [...queryKeys.search.all, query, type] as const,
    suggestions: (query: string) =>
      [...queryKeys.search.all, 'suggestions', query] as const,
  },

  // ============================================================
  // Featured/Homepage
  // ============================================================
  featured: {
    all: ['featured'] as const,
    businesses: () => [...queryKeys.featured.all, 'businesses'] as const,
    events: () => [...queryKeys.featured.all, 'events'] as const,
    tourism: () => [...queryKeys.featured.all, 'tourism'] as const,
    rentals: () => [...queryKeys.featured.all, 'rentals'] as const,
  },
} as const

export type QueryKeys = typeof queryKeys
