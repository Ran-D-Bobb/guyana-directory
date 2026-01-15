'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BadgeCheck,
  Sparkles,
  Store,
  Palmtree,
  Home,
  Calendar,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import type { DiscoverItem, DiscoverItemType } from '@/types/discover';
import { getDistanceTierStyles } from '@/lib/geolocation';
import { cn } from '@/lib/utils';

interface DiscoverCardListProps {
  item: DiscoverItem;
}

const TYPE_CONFIG: Record<
  DiscoverItemType,
  { icon: React.ElementType; color: string; label: string; path: string }
> = {
  business: {
    icon: Store,
    color: 'text-emerald-600 bg-emerald-50',
    label: 'Business',
    path: '/businesses',
  },
  tourism: {
    icon: Palmtree,
    color: 'text-teal-600 bg-teal-50',
    label: 'Experience',
    path: '/tourism',
  },
  rental: {
    icon: Home,
    color: 'text-blue-600 bg-blue-50',
    label: 'Rental',
    path: '/rentals',
  },
  event: {
    icon: Calendar,
    color: 'text-purple-600 bg-purple-50',
    label: 'Event',
    path: '/events',
  },
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';

function formatDistanceValue(meters: number): string {
  if (meters === Infinity) return 'Unknown';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function DiscoverCardList({ item }: DiscoverCardListProps) {
  const typeConfig = TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const tierStyles = getDistanceTierStyles(item.distance_tier);

  return (
    <Link
      href={`${typeConfig.path}/${item.slug}`}
      className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        <Image
          src={item.image_url || DEFAULT_IMAGE}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="144px"
        />
        {/* Type badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full shadow-sm',
              typeConfig.color
            )}
          >
            <TypeIcon className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {item.name}
            </h3>
            {/* Badges */}
            <div className="flex items-center gap-1 shrink-0">
              {item.is_featured && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </span>
              )}
              {item.is_verified && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          {item.category_name && (
            <p className="text-sm text-emerald-600 font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {item.category_name}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Distance */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full',
                tierStyles.bg,
                tierStyles.text
              )}
            >
              <MapPin className="w-3 h-3" />
              {formatDistanceValue(item.distance_meters)}
            </div>

            {/* Rating */}
            {item.rating != null && item.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={item.rating} size="sm" />
                <span className="text-sm font-bold text-gray-900">
                  {item.rating.toFixed(1)}
                </span>
                {item.review_count > 0 && (
                  <span className="text-xs text-gray-400">({item.review_count})</span>
                )}
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
