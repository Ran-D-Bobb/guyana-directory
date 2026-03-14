/**
 * Shared category image mappings for all content types.
 * All images are stored locally in /public/images/ to avoid external URL dependencies.
 */

// ─── Business Categories ────────────────────────────────────────────
export const CATEGORY_IMAGES: Record<string, string> = {
  'restaurants-dining': '/images/categories/restaurants-dining.jpg',
  'grocery-supermarkets': '/images/categories/grocery-supermarkets.jpg',
  'beauty-personal-care': '/images/categories/beauty-personal-care.jpg',
  'health-medical': '/images/categories/health-medical.jpg',
  'automotive-services': '/images/categories/automotive-services.jpg',
  'home-garden': '/images/categories/home-garden.jpg',
  'construction-trades': '/images/categories/construction-trades.jpg',
  'technology-electronics': '/images/categories/technology-electronics.jpg',
  'fashion-clothing': '/images/categories/fashion-clothing.jpg',
  'education-training': '/images/categories/education-training.jpg',
  'professional-services': '/images/categories/professional-services.jpg',
  'entertainment-events': '/images/categories/entertainment-events.jpg',
  'fitness-sports': '/images/categories/fitness-sports.jpg',
  'pet-services': '/images/categories/pet-services.jpg',
  'real-estate': '/images/categories/real-estate.jpg',
  'financial-services': '/images/categories/financial-services.jpg',
  'hospitality-lodging': '/images/categories/hospitality-lodging.jpg',
  'transportation-logistics': '/images/categories/transportation-logistics.jpg',
  'photography-media': '/images/categories/photography-media.jpg',
  'other-services': '/images/categories/other-services.jpg',
  'government-public-services': '/images/categories/government-public-services.jpg',
}

// ─── Tourism Categories ─────────────────────────────────────────────
export const TOURISM_CATEGORY_IMAGES: Record<string, string> = {
  'nature-wildlife': '/images/tourism/nature-wildlife.jpg',
  'adventure': '/images/tourism/adventure.jpg',
  'adventure-activities': '/images/tourism/adventure.jpg',
  'culture': '/images/tourism/culture.jpg',
  'cultural-experiences': '/images/tourism/culture.jpg',
  'eco-lodges': '/images/tourism/eco-lodges.jpg',
  'eco-lodges-stays': '/images/tourism/eco-lodges.jpg',
  'tours-guides': '/images/tourism/tours-guides.jpg',
  'water-activities': '/images/tourism/water-activities.jpg',
  'food-culinary': '/images/tourism/food-culinary.jpg',
  'history-heritage': '/images/tourism/history-heritage.jpg',
  'historical-heritage': '/images/tourism/history-heritage.jpg',
  'photography': '/images/tourism/photography.jpg',
  'photography-tours': '/images/tourism/photography.jpg',
  'bird-watching': '/images/tourism/bird-watching.jpg',
  'expeditions': '/images/tourism/expeditions.jpg',
  'multi-day-expeditions': '/images/tourism/expeditions.jpg',
  'transfers': '/images/tourism/transfers.jpg',
  'airport-transfer-services': '/images/tourism/transfers.jpg',
}

// ─── Event Categories ───────────────────────────────────────────────
export const EVENT_CATEGORY_IMAGES: Record<string, string> = {
  'concert': '/images/events/concert.jpg',
  'workshop': '/images/events/workshop.jpg',
  'community': '/images/events/community.jpg',
  'festival': '/images/events/festival.jpg',
  'sports': '/images/events/sports.jpg',
  'business-networking': '/images/events/business-networking.jpg',
  'food-drink': '/images/events/food-drink.jpg',
  'art-culture': '/images/events/art-culture.jpg',
  'charity': '/images/events/charity.jpg',
  'other': '/images/events/other.jpg',
}

// ─── Rental Categories ──────────────────────────────────────────────
export const RENTAL_CATEGORY_IMAGES: Record<string, string> = {
  'apartments': '/images/rentals/apartments.jpg',
  'houses': '/images/rentals/houses.jpg',
  'vacation-homes': '/images/rentals/vacation-homes.jpg',
  'room-rentals': '/images/rentals/room-rentals.jpg',
  'office-spaces': '/images/rentals/office-spaces.jpg',
  'commercial': '/images/rentals/commercial.jpg',
  'shared-housing': '/images/rentals/shared-housing.jpg',
  'land': '/images/rentals/land.jpg',
}

// ─── Defaults ───────────────────────────────────────────────────────
export const DEFAULT_CATEGORY_IMAGE = '/images/categories/other-services.jpg'

export const DEFAULT_IMAGES = {
  business: '/images/defaults/business.jpg',
  businessOffice: '/images/defaults/business-office.jpg',
  event: '/images/defaults/event.jpg',
  tourism: '/images/defaults/tourism.jpg',
  tourismLandscape: '/images/defaults/tourism-landscape.jpg',
  rental: '/images/defaults/rental.jpg',
  rentalHero: '/images/defaults/rental-hero.jpg',
} as const

// ─── Lookup Functions ───────────────────────────────────────────────

/** Get a business category image by slug */
export function getCategoryImage(slug: string): string {
  return CATEGORY_IMAGES[slug] || DEFAULT_CATEGORY_IMAGE
}

/** Get a tourism category image by slug */
export function getTourismCategoryImage(slug: string): string {
  return TOURISM_CATEGORY_IMAGES[slug] || DEFAULT_IMAGES.tourismLandscape
}

/** Get an event category image by slug */
export function getEventCategoryImage(slug: string): string {
  return EVENT_CATEGORY_IMAGES[slug] || DEFAULT_IMAGES.event
}

/** Get a rental category image by slug */
export function getRentalCategoryImage(slug: string): string {
  return RENTAL_CATEGORY_IMAGES[slug] || DEFAULT_IMAGES.rental
}

/**
 * Convert a category name to a slug for fallback lookup.
 * e.g. "Restaurants & Dining" -> "restaurants-dining"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Universal fallback image lookup.
 * Works with category name OR slug, across all content types.
 * Components that only have category_name (not slug) can use this.
 */
export function getFallbackImage(
  categoryNameOrSlug: string | null | undefined,
  contentType: 'business' | 'tourism' | 'rental' | 'event'
): string {
  if (!categoryNameOrSlug) {
    switch (contentType) {
      case 'business': return DEFAULT_IMAGES.business
      case 'tourism': return DEFAULT_IMAGES.tourismLandscape
      case 'event': return DEFAULT_IMAGES.event
      case 'rental': return DEFAULT_IMAGES.rental
    }
  }

  const slug = slugify(categoryNameOrSlug)

  switch (contentType) {
    case 'business':
      return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES[categoryNameOrSlug] || DEFAULT_IMAGES.business
    case 'tourism':
      return TOURISM_CATEGORY_IMAGES[slug] || TOURISM_CATEGORY_IMAGES[categoryNameOrSlug] || DEFAULT_IMAGES.tourismLandscape
    case 'event':
      return EVENT_CATEGORY_IMAGES[slug] || EVENT_CATEGORY_IMAGES[categoryNameOrSlug] || DEFAULT_IMAGES.event
    case 'rental':
      return RENTAL_CATEGORY_IMAGES[slug] || RENTAL_CATEGORY_IMAGES[categoryNameOrSlug] || DEFAULT_IMAGES.rental
  }
}
