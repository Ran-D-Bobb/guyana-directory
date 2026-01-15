'use client';

import { Store, Palmtree, Home, Calendar, Compass, Navigation, Footprints, Bike, Car, MapPin, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscoverItemType, DiscoverFiltersState } from '@/types/discover';
import {
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
} from '@/types/discover';

interface DiscoverFiltersProps {
  filters: DiscoverFiltersState;
  onFilterChange: (filters: Partial<DiscoverFiltersState>) => void;
  totalResults: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const TYPE_OPTIONS: {
  value: DiscoverItemType | 'all';
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'all', label: 'All', icon: Compass },
  { value: 'business', label: 'Businesses', icon: Store },
  { value: 'tourism', label: 'Tourism', icon: Palmtree },
  { value: 'rental', label: 'Rentals', icon: Home },
  { value: 'event', label: 'Events', icon: Calendar },
];

const DISTANCE_PRESETS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

const SORT_OPTIONS: { value: DiscoverFiltersState['sortBy']; label: string }[] = [
  { value: 'distance', label: 'Nearest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

// Distance tier info
function getDistanceTier(km: number): { label: string; icon: React.ElementType; description: string } {
  if (km <= 2) return { label: 'Walking', icon: Footprints, description: '~25 min walk' };
  if (km <= 5) return { label: 'Biking', icon: Bike, description: '~15 min bike' };
  if (km <= 15) return { label: 'Short drive', icon: Car, description: '~15 min drive' };
  if (km <= 30) return { label: 'Medium drive', icon: Car, description: '~30 min drive' };
  return { label: 'Long drive', icon: Car, description: '~45+ min drive' };
}

export function DiscoverFilters({
  filters,
  onFilterChange,
  totalResults,
  viewMode,
  onViewModeChange,
}: DiscoverFiltersProps) {
  const tier = getDistanceTier(filters.radiusKm);
  const TierIcon = tier.icon;
  const radiusPercent = ((filters.radiusKm - MIN_RADIUS_KM) / (MAX_RADIUS_KM - MIN_RADIUS_KM)) * 100;

  return (
    <div className="space-y-4">
      {/* Main Filter Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header: Location Status + Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Location indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Using your location</p>
                <p className="text-xs text-gray-500">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} within {filters.radiusKm} km
                </p>
              </div>
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as DiscoverFiltersState['sortBy'] })}
                  className={cn(
                    'appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-lg',
                    'bg-gray-50 border border-gray-200 text-gray-700',
                    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
                    'cursor-pointer transition-colors'
                  )}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    viewMode === 'grid'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    viewMode === 'list'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Type Pills */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = filters.type === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onFilterChange({ type: option.value })}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-gray-500')} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance Controls */}
        <div className="p-4 sm:p-5">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-600 shrink-0">Distance:</span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {DISTANCE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onFilterChange({ radiusKm: preset.value })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0',
                    filters.radiusKm === preset.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fine-tune Slider */}
          <div className="relative h-8 flex items-center">
            <div className="absolute inset-x-0 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-150"
                style={{ width: `${radiusPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={MIN_RADIUS_KM}
              max={MAX_RADIUS_KM}
              value={filters.radiusKm}
              onChange={(e) => onFilterChange({ radiusKm: parseInt(e.target.value) })}
              className={cn(
                'absolute inset-x-0 w-full h-8 appearance-none bg-transparent cursor-pointer z-10',
                '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
                '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
                '[&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-emerald-500',
                '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-emerald-500/20',
                '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
                '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
                '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-emerald-500'
              )}
            />
          </div>

          {/* Tier indicator */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TierIcon className="w-3.5 h-3.5" />
              <span>{tier.label}</span>
              <span className="text-gray-400">• {tier.description}</span>
            </div>
            <span className="text-xs font-medium text-emerald-600">{filters.radiusKm} km</span>
          </div>
        </div>

        {/* Results Footer */}
        {totalResults === 0 && (
          <div className="px-4 sm:px-5 py-3 bg-amber-50 border-t border-amber-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-800">
                No results in this area
              </p>
              <button
                onClick={() => onFilterChange({ radiusKm: 50, type: 'all' })}
                className="text-sm font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                Search everywhere
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
