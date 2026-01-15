'use client';

import { useRef } from 'react';
import {
  Compass,
  Store,
  Palmtree,
  Home,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedItemType } from './FeedCard';

export type FilterType = FeedItemType | 'all';
export type SortOption = 'featured' | 'popular' | 'rating';

interface CategoryFilterPillsProps {
  activeType: FilterType;
  onTypeChange: (type: FilterType) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    business: number;
    tourism: number;
    rental: number;
    event: number;
  };
}

const FILTER_OPTIONS: {
  type: FilterType;
  label: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  {
    type: 'all',
    label: 'All',
    icon: Compass,
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
  },
  {
    type: 'business',
    label: 'Shops',
    icon: Store,
    activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500',
  },
  {
    type: 'tourism',
    label: 'Experiences',
    icon: Palmtree,
    activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500',
  },
  {
    type: 'rental',
    label: 'Stays',
    icon: Home,
    activeClass: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500',
  },
  {
    type: 'event',
    label: 'Events',
    icon: Calendar,
    activeClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500',
  },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export function CategoryFilterPills({
  activeType,
  onTypeChange,
  sortBy,
  onSortChange,
  counts,
}: CategoryFilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-14 md:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        {/* Mobile: Two rows | Desktop: Single row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* Row 1: Sort select on mobile (left aligned) | Desktop: at end */}
          <div className="flex items-center gap-2 sm:order-2 sm:flex-shrink-0">
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
                'min-h-[40px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Filter Pills - Scrollable | Desktop: first */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:order-1"
          >
            {FILTER_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = activeType === option.type;
              const count = counts[option.type];

              return (
                <button
                  key={option.type}
                  onClick={() => onTypeChange(option.type)}
                  className={cn(
                    'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all duration-200',
                    'border min-h-[36px] sm:min-h-[44px] touch-manipulation',
                    isActive
                      ? option.activeClass
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
