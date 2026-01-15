'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, Compass, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  calculateDistance,
  formatDistance,
  getDistanceTier,
  filterByRadius,
} from '@/lib/geolocation';
import { LocationPermissionModal } from './LocationPermissionModal';
import { DiscoverFilters } from './DiscoverFilters';
import { DiscoverCard } from './DiscoverCard';
import { DiscoverCardList } from './DiscoverCardList';
import { SurpriseMeButton } from './SurpriseMeButton';
import type {
  DiscoverItem,
  DiscoverFiltersState,
  DiscoverItemType,
} from '@/types/discover';
import { DEFAULT_RADIUS_KM } from '@/types/discover';

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

export function DiscoverPageClient({
  businesses,
  tourism,
  rentals,
  events,
}: DiscoverPageClientProps) {
  const {
    coords,
    status,
    error,
    isLoading,
    requestPermission,
  } = useUserLocation();

  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Combine and process all items
  const allItems = useMemo(() => {
    if (!coords) return [];

    const processItems = (
      items: RawItem[],
      type: DiscoverItemType
    ): DiscoverItem[] => {
      return items.map((item) => {
        const distance =
          item.latitude && item.longitude
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
          distance_label: formatDistance(distance),
          distance_tier: getDistanceTier(distance),
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

    // Sort by distance
    return allProcessed.sort((a, b) => a.distance_meters - b.distance_meters);
  }, [businesses, tourism, rentals, events, coords]);

  // Apply filters and sorting
  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by type
    if (filters.type !== 'all') {
      items = items.filter((item) => item.type === filters.type);
    }

    // Filter by radius
    items = filterByRadius(items, filters.radiusKm);

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        items = [...items].sort((a, b) => b.review_count - a.review_count);
        break;
      case 'distance':
      default:
        // Already sorted by distance from allItems
        break;
    }

    return items;
  }, [allItems, filters]);

  const handleFilterChange = (newFilters: Partial<DiscoverFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRequestLocation = async () => {
    await requestPermission();
    // Modal will be closed automatically by the useEffect when status becomes 'granted'
  };

  // Loading/requesting state - show skeleton
  if (status === 'requesting') {
    return (
      <div className="space-y-6">
        {/* Skeleton filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-gray-200 rounded-lg" />
              <div className="h-9 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded-full" />
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No location state
  if (!coords) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          {/* Animated illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Compass className="w-16 h-16 text-emerald-600 animate-[spin_8s_linear_infinite]" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center animate-bounce">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>

          <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
            Enable Location
          </h2>
          <p className="text-gray-600 max-w-md mb-8 text-lg">
            To discover amazing experiences around you, we need to know where you are.
            Your location is never stored or shared.
          </p>

          <Button
            onClick={() => setShowModal(true)}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 text-lg px-8 py-6 h-auto"
          >
            <Navigation className="w-6 h-6 mr-3" />
            Enable Location
          </Button>

          <p className="text-sm text-gray-400 mt-6">
            We only use your location while you&apos;re using the app
          </p>
        </div>

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

  return (
    <>
      {/* Sticky Filters */}
      <div className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 bg-[hsl(var(--jungle-50))]/95 backdrop-blur-sm">
        <DiscoverFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={filteredItems.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Surprise Me Button - Floating */}
      {filteredItems.length > 0 && (
        <div className="flex justify-end mb-4">
          <SurpriseMeButton items={filteredItems} />
        </div>
      )}

      {/* Results */}
      {filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              >
                <DiscoverCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
              >
                <DiscoverCardList item={item} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {/* Empty state illustration */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-14 h-14 text-gray-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
          </div>

          <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
            No results found
          </h3>
          <p className="text-gray-600 max-w-md mb-8">
            We couldn&apos;t find anything within {filters.radiusKm} km.
            Try expanding your search area or changing filters.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => handleFilterChange({ radiusKm: 50 })}
              className="border-emerald-200 hover:bg-emerald-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Search 50 km
            </Button>
            <Button
              onClick={() => handleFilterChange({ radiusKm: 50, type: 'all' })}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Show Everything
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
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
