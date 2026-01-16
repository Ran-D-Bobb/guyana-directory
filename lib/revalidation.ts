'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Cache Revalidation Utilities
 *
 * Use these functions after admin mutations to ensure cache stays fresh.
 * Tags match those defined in category-counts.ts and other cached functions.
 */

// ============================================================
// Business Revalidation
// ============================================================

/**
 * Revalidate all business-related caches
 * Call after creating/deleting a business
 */
export async function revalidateBusinesses() {
  revalidateTag('business-categories')
  revalidateTag('categories')
  revalidatePath('/businesses')
  revalidatePath('/')
}

/**
 * Revalidate a single business's cache
 * Call after editing a business
 */
export async function revalidateSingleBusiness(slug: string) {
  revalidatePath(`/businesses/${slug}`)
}

/**
 * Full business mutation handler
 * Call after any business create/edit/delete operation
 */
export async function onBusinessMutation(slug?: string) {
  revalidateTag('business-categories')
  revalidateTag('categories')
  revalidatePath('/businesses')
  revalidatePath('/')

  if (slug) {
    revalidatePath(`/businesses/${slug}`)
  }
}

// ============================================================
// Event Revalidation
// ============================================================

/**
 * Revalidate all event-related caches
 * Call after creating/deleting an event
 */
export async function revalidateEvents() {
  revalidateTag('event-categories')
  revalidateTag('categories')
  revalidateTag('events-upcoming')
  revalidateTag('events-ongoing')
  revalidateTag('events-past')
  revalidateTag('events-all')
  revalidatePath('/events')
  revalidatePath('/')
}

/**
 * Revalidate a single event's cache
 * Call after editing an event
 */
export async function revalidateSingleEvent(slug: string) {
  revalidatePath(`/events/${slug}`)
}

/**
 * Full event mutation handler
 * Call after any event create/edit/delete operation
 */
export async function onEventMutation(slug?: string) {
  revalidateTag('event-categories')
  revalidateTag('categories')
  revalidateTag('events-upcoming')
  revalidateTag('events-ongoing')
  revalidateTag('events-past')
  revalidateTag('events-all')
  revalidatePath('/events')
  revalidatePath('/')

  if (slug) {
    revalidatePath(`/events/${slug}`)
  }
}

// ============================================================
// Tourism Revalidation
// ============================================================

/**
 * Revalidate all tourism-related caches
 * Call after creating/deleting a tourism experience
 */
export async function revalidateTourism() {
  revalidateTag('tourism-categories')
  revalidateTag('categories')
  revalidatePath('/tourism')
  revalidatePath('/')
}

/**
 * Revalidate a single tourism experience's cache
 * Call after editing a tourism experience
 */
export async function revalidateSingleTourism(slug: string) {
  revalidatePath(`/tourism/${slug}`)
}

/**
 * Full tourism mutation handler
 * Call after any tourism experience create/edit/delete operation
 */
export async function onTourismMutation(slug?: string) {
  revalidateTag('tourism-categories')
  revalidateTag('categories')
  revalidatePath('/tourism')
  revalidatePath('/')

  if (slug) {
    revalidatePath(`/tourism/${slug}`)
  }
}

// ============================================================
// Rental Revalidation
// ============================================================

/**
 * Revalidate all rental-related caches
 * Call after creating/deleting a rental
 */
export async function revalidateRentals() {
  revalidateTag('rental-categories')
  revalidateTag('categories')
  revalidatePath('/rentals')
  revalidatePath('/')
}

/**
 * Revalidate a single rental's cache
 * Call after editing a rental
 */
export async function revalidateSingleRental(slug: string) {
  revalidatePath(`/rentals/${slug}`)
}

/**
 * Full rental mutation handler
 * Call after any rental create/edit/delete operation
 */
export async function onRentalMutation(slug?: string) {
  revalidateTag('rental-categories')
  revalidateTag('categories')
  revalidatePath('/rentals')
  revalidatePath('/')

  if (slug) {
    revalidatePath(`/rentals/${slug}`)
  }
}

// ============================================================
// Category Revalidation
// ============================================================

/**
 * Revalidate all category caches
 * Call after modifying any category
 */
export async function revalidateCategories() {
  revalidateTag('categories')
  revalidateTag('business-categories')
  revalidateTag('event-categories')
  revalidateTag('tourism-categories')
  revalidateTag('rental-categories')
  revalidatePath('/')
}

// ============================================================
// Full Site Revalidation
// ============================================================

/**
 * Revalidate entire site cache
 * Use sparingly - only for major updates
 */
export async function revalidateAll() {
  revalidateTag('categories')
  revalidateTag('business-categories')
  revalidateTag('event-categories')
  revalidateTag('tourism-categories')
  revalidateTag('rental-categories')
  revalidatePath('/', 'layout')
}
