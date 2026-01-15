'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dices, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DiscoverItem } from '@/types/discover';
import { cn } from '@/lib/utils';

interface SurpriseMeButtonProps {
  items: DiscoverItem[];
  className?: string;
}

export function SurpriseMeButton({ items, className }: SurpriseMeButtonProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter to quality items (rated > 3.5 or featured/verified)
  const qualityItems = items.filter(
    (item) =>
      item.is_featured ||
      item.is_verified ||
      (item.rating && item.rating >= 3.5) ||
      item.review_count > 0
  );

  const handleSurpriseMe = () => {
    if (qualityItems.length === 0) return;

    setIsAnimating(true);

    // Brief animation before navigating
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * qualityItems.length);
      const randomItem = qualityItems[randomIndex];

      const pathMap = {
        business: '/businesses',
        tourism: '/tourism',
        rental: '/rentals',
        event: '/events',
      };

      router.push(`${pathMap[randomItem.type]}/${randomItem.slug}`);
    }, 600);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={handleSurpriseMe}
      disabled={isAnimating || qualityItems.length === 0}
      className={cn(
        'group relative overflow-hidden',
        'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500',
        'hover:from-amber-600 hover:via-orange-600 hover:to-amber-600',
        'text-white font-semibold',
        'shadow-lg shadow-amber-500/30',
        'transition-all duration-300',
        isAnimating && 'animate-pulse',
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      {isAnimating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Finding something special...
        </>
      ) : (
        <>
          <Dices className="w-5 h-5 mr-2 group-hover:animate-bounce" />
          Surprise Me
          <Sparkles className="w-4 h-4 ml-2 opacity-75" />
        </>
      )}
    </Button>
  );
}
