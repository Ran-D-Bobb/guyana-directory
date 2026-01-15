import type { DistanceTier } from '@/lib/geolocation';

export type DiscoverItemType = 'business' | 'tourism' | 'rental' | 'event';

export interface DiscoverItem {
  id: string;
  type: DiscoverItemType;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  review_count: number;
  distance_meters: number;
  distance_label: string;
  distance_tier: DistanceTier;
  category_name: string | null;
  is_featured: boolean;
  is_verified: boolean;
  // Type-specific fields
  phone?: string | null;
  email?: string | null;
  whatsapp_number?: string | null;
  price_from?: number | null;
  address?: string | null;
}

export interface DiscoverFiltersState {
  type: DiscoverItemType | 'all';
  radiusKm: number;
  sortBy: 'distance' | 'rating' | 'popular';
}

export interface LocationState {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';
  coords: { lat: number; lng: number } | null;
  error: string | null;
}

export const DEFAULT_RADIUS_KM = 10;
export const MAX_RADIUS_KM = 50;
export const MIN_RADIUS_KM = 1;
export const RADIUS_STEP = 1;

export const DISCOVER_TYPE_LABELS: Record<DiscoverItemType | 'all', string> = {
  all: 'All',
  business: 'Businesses',
  tourism: 'Tourism',
  rental: 'Rentals',
  event: 'Events',
};

export const DISCOVER_TYPE_ICONS: Record<DiscoverItemType | 'all', string> = {
  all: 'Compass',
  business: 'Store',
  tourism: 'Palmtree',
  rental: 'Home',
  event: 'Calendar',
};
