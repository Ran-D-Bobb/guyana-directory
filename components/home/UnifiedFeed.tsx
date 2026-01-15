'use client';

import { useState, useMemo } from 'react';
import { FeedCard, type FeedItem } from './FeedCard';
import { Compass, RefreshCw, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedFeedProps {
  items: FeedItem[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 20;

export function UnifiedFeed({ items, isLoading }: UnifiedFeedProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;
  const remainingCount = items.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
  };

  // Empty State
  if (!isLoading && items.length === 0) {
    return (
      <div className="py-16 px-4 text-center animate-fade-up">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Frown className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or check back later for new listings.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Results Count */}
      <div className="flex items-center justify-between mb-4 animate-fade-up">
        <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-semibold text-gray-700">
            {Math.min(visibleCount, items.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{items.length}</span>{' '}
          results
        </p>
        {items.length > 0 && (
          <div className="flex items-center gap-1 text-emerald-600">
            <Compass className="w-4 h-4" />
            <span className="text-xs font-medium">Discover</span>
          </div>
        )}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {visibleItems.map((item, index) => (
          <FeedCard
            key={`${item.type}-${item.id}`}
            item={item}
            index={index}
          />
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="mt-8 text-center animate-fade-up">
          <button
            onClick={handleLoadMore}
            className={cn(
              'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl',
              'bg-white border border-gray-200 text-gray-700 font-semibold',
              'hover:bg-gray-50 hover:border-gray-300',
              'active:scale-[0.98] transition-all',
              'shadow-sm hover:shadow-md'
            )}
          >
            <span>Load More</span>
            <span className="text-sm text-gray-400 font-normal">
              ({remainingCount} remaining)
            </span>
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && items.length > ITEMS_PER_PAGE && (
        <div className="mt-8 text-center animate-fade-up">
          <p className="text-sm text-gray-400">
            You&apos;ve seen all {items.length} results
          </p>
        </div>
      )}
    </div>
  );
}
