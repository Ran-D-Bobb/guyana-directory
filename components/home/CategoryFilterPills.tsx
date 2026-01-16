'use client';

import { useRef, useState } from 'react';
import {
  Compass,
  Store,
  Palmtree,
  Home,
  Calendar,
  ArrowUpDown,
  Check,
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
  const [showSortMenu, setShowSortMenu] = useState(false);

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="sticky top-14 md:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Single row layout with sort button on right */}
        <div className="flex items-center gap-3">
          {/* Filter Pills - Scrollable */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
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
                    'flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                    'border min-h-[44px] touch-manipulation active:scale-[0.97]',
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

          {/* Sort Button - Compact on mobile */}
          <div className="relative flex-shrink-0">
            {/* Mobile: Icon button with dropdown - 44px touch target */}
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={cn(
                'sm:hidden flex items-center justify-center w-11 h-11 rounded-full',
                'border border-gray-200 bg-white text-gray-600',
                'hover:bg-gray-50 hover:border-gray-300 transition-all',
                'active:scale-95',
                showSortMenu && 'bg-gray-50 border-gray-300'
              )}
              aria-label={`Sort by ${currentSortLabel}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Desktop: Full select */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className={cn(
                'hidden sm:block px-3 py-2 rounded-lg text-sm font-semibold transition-all',
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

            {/* Mobile dropdown menu */}
            {showSortMenu && (
              <>
                <div
                  className="sm:hidden fixed inset-0 z-40"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="sm:hidden absolute right-0 top-12 z-50 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort by</span>
                  </div>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors min-h-[48px]',
                        'active:bg-gray-100',
                        sortBy === option.value
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
