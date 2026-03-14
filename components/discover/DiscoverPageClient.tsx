'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, Dices, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  calculateDistance,
  formatDistance,
  getDistanceTier,
  filterByRadius,
} from '@/lib/geolocation';
import { LocationPermissionModal } from './LocationPermissionModal';
import { DiscoverCardList } from './DiscoverCardList';
import type {
  DiscoverItem,
  DiscoverFiltersState,
  DiscoverItemType,
} from '@/types/discover';
import { DEFAULT_RADIUS_KM } from '@/types/discover';
import { cn } from '@/lib/utils';

interface RawItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rating: number | null;
  review_count: number;
  is_featured: boolean;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  category_name: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp_number?: string | null;
  price_from?: number | null;
  address?: string | null;
}

interface DiscoverPageClientProps {
  businesses: RawItem[];
  tourism: RawItem[];
  rentals: RawItem[];
  events: RawItem[];
}

const TYPE_PILLS: {
  value: DiscoverItemType | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All' },
  { value: 'business', label: 'Businesses' },
  { value: 'tourism', label: 'Experiences' },
  { value: 'rental', label: 'Rentals' },
  { value: 'event', label: 'Events' },
];

const DISTANCE_PRESETS = [
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: 'All' },
];

export function DiscoverPageClient({
  businesses,
  tourism,
  rentals,
  events,
}: DiscoverPageClientProps) {
  const router = useRouter();
  const {
    coords,
    status,
    error,
    isLoading,
    requestPermission,
  } = useUserLocation();

  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<DiscoverFiltersState>({
    type: 'all',
    radiusKm: DEFAULT_RADIUS_KM,
    sortBy: 'distance',
  });

  // Show modal on first load if no location
  useEffect(() => {
    if (status === 'idle') {
      setShowModal(true);
    }
  }, [status]);

  // Close modal when location is granted
  useEffect(() => {
    if (status === 'granted' && coords) {
      setShowModal(false);
    }
  }, [status, coords]);

  const hasLocation = !!coords;

  // Build all items (with or without distance)
  const allItems = useMemo(() => {
    const processItems = (
      items: RawItem[],
      type: DiscoverItemType
    ): DiscoverItem[] => {
      return items.map((item) => {
        const distance =
          coords && item.latitude && item.longitude
            ? calculateDistance(coords.lat, coords.lng, item.latitude, item.longitude)
            : Infinity;

        return {
          id: item.id,
          type,
          name: item.name,
          slug: item.slug,
          description: item.description,
          image_url: item.image_url,
          rating: item.rating,
          review_count: item.review_count || 0,
          distance_meters: distance,
          distance_label: distance < Infinity ? formatDistance(distance) : '',
          distance_tier: distance < Infinity ? getDistanceTier(distance) : 'adventure',
          category_name: item.category_name,
          is_featured: item.is_featured || false,
          is_verified: item.is_verified || false,
          phone: item.phone,
          email: item.email,
          whatsapp_number: item.whatsapp_number,
          price_from: item.price_from,
          address: item.address,
        };
      });
    };

    const allProcessed = [
      ...processItems(businesses, 'business'),
      ...processItems(tourism, 'tourism'),
      ...processItems(rentals, 'rental'),
      ...processItems(events, 'event'),
    ];

    if (hasLocation) {
      return allProcessed.sort((a, b) => a.distance_meters - b.distance_meters);
    }
    // Without location: featured first, then by rating
    return allProcessed.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [businesses, tourism, rentals, events, coords, hasLocation]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (filters.type !== 'all') {
      items = items.filter((item) => item.type === filters.type);
    }

    if (hasLocation) {
      items = filterByRadius(items, filters.radiusKm);
    }

    switch (filters.sortBy) {
      case 'rating':
        items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        items = [...items].sort((a, b) => b.review_count - a.review_count);
        break;
      case 'distance':
      default:
        break;
    }

    return items;
  }, [allItems, filters, hasLocation]);

  const handleFilterChange = (newFilters: Partial<DiscoverFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRequestLocation = async () => {
    await requestPermission();
  };

  // Surprise me
  const handleSurpriseMe = () => {
    const qualityItems = filteredItems.filter(
      (item) =>
        item.is_featured ||
        item.is_verified ||
        (item.rating && item.rating >= 3.5) ||
        item.review_count > 0
    );
    const pool = qualityItems.length > 0 ? qualityItems : filteredItems;
    if (pool.length === 0) return;

    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    const pathMap = {
      business: '/businesses',
      tourism: '/tourism',
      rental: '/rentals',
      event: '/events',
    };
    router.push(`${pathMap[randomItem.type]}/${randomItem.slug}`);
  };

  const activeFilterCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'distance' ? 1 : 0) +
    (hasLocation && filters.radiusKm !== DEFAULT_RADIUS_KM ? 1 : 0);

  return (
    <>
      {/* Page header */}
      <div className="pt-6 pb-4 sm:pt-8">
        <div className="flex items-end justify-between gap-4 mb-1">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground leading-tight">
              Near Me
            </h1>
            {hasLocation ? (
              <p className="text-sm text-muted-foreground mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'place' : 'places'} within {filters.radiusKm} km
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Showing {filteredItems.length} popular places
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!hasLocation && status !== 'requesting' && (
              <button
                onClick={() => setShowModal(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
                  'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
                  'hover:bg-[hsl(var(--primary))]/15 transition-colors'
                )}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Use location</span>
                <span className="sm:hidden">Location</span>
              </button>
            )}
            {filteredItems.length > 0 && (
              <button
                onClick={handleSurpriseMe}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
                  'bg-[hsl(var(--gold-100))] text-[hsl(var(--gold-800))]',
                  'hover:bg-[hsl(var(--gold-200))] transition-colors'
                )}
                title="Go to a random place"
              >
                <Dices className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Surprise me</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[hsl(var(--background))]/95 backdrop-blur-sm border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {/* Type pills */}
          {TYPE_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => handleFilterChange({ type: pill.value })}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
                filters.type === pill.value
                  ? 'bg-foreground text-background'
                  : 'bg-[hsl(var(--muted))] text-muted-foreground hover:text-foreground'
              )}
            >
              {pill.label}
            </button>
          ))}

          <div className="w-px h-6 bg-[hsl(var(--border))] shrink-0 mx-1" />

          {/* Distance presets (only with location) */}
          {hasLocation && (
            <>
              {DISTANCE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleFilterChange({ radiusKm: preset.value })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
                    filters.radiusKm === preset.value
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-[hsl(var(--muted))] text-muted-foreground hover:text-foreground'
                  )}
                >
                  {preset.label}
                </button>
              ))}

              <div className="w-px h-6 bg-[hsl(var(--border))] shrink-0 mx-1" />
            </>
          )}

          {/* Sort toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
              showFilters || activeFilterCount > 0
                ? 'bg-foreground text-background'
                : 'bg-[hsl(var(--muted))] text-muted-foreground hover:text-foreground'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort
            {activeFilterCount > 0 && !showFilters && (
              <span className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable sort row */}
        {showFilters && (
          <div className="pb-3 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">Sort by</span>
            {(['distance', 'rating', 'popular'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => handleFilterChange({ sortBy: sort })}
                disabled={sort === 'distance' && !hasLocation}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  filters.sortBy === sort
                    ? 'bg-foreground text-background'
                    : 'bg-[hsl(var(--muted))] text-muted-foreground hover:text-foreground',
                  sort === 'distance' && !hasLocation && 'opacity-40 cursor-not-allowed'
                )}
              >
                {sort === 'distance' ? 'Nearest' : sort === 'rating' ? 'Top Rated' : 'Most Reviews'}
              </button>
            ))}

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  handleFilterChange({ type: 'all', sortBy: hasLocation ? 'distance' : 'rating', radiusKm: DEFAULT_RADIUS_KM });
                  setShowFilters(false);
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Location banner — shown when denied/unavailable */}
      {(status === 'denied' || status === 'error') && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--gold-50))] border border-[hsl(var(--gold-200))]">
          <MapPin className="w-4 h-4 text-[hsl(var(--gold-600))] shrink-0" />
          <p className="text-sm text-[hsl(var(--gold-800))] flex-1">
            Location unavailable — showing popular places instead.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-[hsl(var(--primary))] hover:underline shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {status === 'requesting' && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-[hsl(var(--card))] animate-pulse">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-[hsl(var(--muted))]" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-2/3 bg-[hsl(var(--muted))] rounded" />
                <div className="h-3 w-1/3 bg-[hsl(var(--muted))] rounded" />
                <div className="h-3 w-1/2 bg-[hsl(var(--muted))] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results — list view by default for local utility */}
      {status !== 'requesting' && filteredItems.length > 0 && (
        <div className="mt-4 space-y-3">
          {filteredItems.map((item) => (
            <DiscoverCardList
              key={`${item.type}-${item.id}`}
              item={item}
              showDistance={hasLocation}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {status !== 'requesting' && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nothing nearby
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {hasLocation
              ? `No results within ${filters.radiusKm} km. Try widening your search.`
              : 'Enable location to find places near you.'}
          </p>
          <div className="flex gap-3">
            {hasLocation ? (
              <button
                onClick={() => handleFilterChange({ radiusKm: 50, type: 'all' })}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Search everywhere
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity"
              >
                Enable location
              </button>
            )}
          </div>
        </div>
      )}

      {/* Location permission modal */}
      <LocationPermissionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onRequestLocation={handleRequestLocation}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
