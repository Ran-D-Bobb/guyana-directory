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
  ArrowRight,
} from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import type { DiscoverItem, DiscoverItemType } from '@/types/discover';
import { getDistanceTierStyles } from '@/lib/geolocation';
import { cn } from '@/lib/utils';

interface DiscoverCardProps {
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

export function DiscoverCard({ item }: DiscoverCardProps) {
  const typeConfig = TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const tierStyles = getDistanceTierStyles(item.distance_tier);

  return (
    <Link
      href={`${typeConfig.path}/${item.slug}`}
      className="group block rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
    >
      {/* Image with Overlay */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={item.image_url || DEFAULT_IMAGE}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Left: Type Badge + Status */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {/* Type Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full shadow-lg ring-1 ring-white/30',
              typeConfig.color
            )}
          >
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>

          {/* Featured/Verified */}
          {item.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-full shadow-lg ring-1 ring-white/30">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {item.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 rounded-full shadow-lg ring-1 ring-white/30">
              <BadgeCheck className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Top Right: Distance Badge */}
        <div
          className={cn(
            'absolute top-3 right-3 inline-flex flex-col items-end gap-0.5'
          )}
        >
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-full shadow-lg ring-1 ring-white/30',
              tierStyles.bg,
              tierStyles.text
            )}
          >
            {formatDistanceValue(item.distance_meters)}
          </span>
          <span className="text-[10px] font-medium text-white/90 drop-shadow-md pr-1">
            {item.distance_label}
          </span>
        </div>

        {/* Bottom Right: Rating */}
        {item.rating != null && item.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <StarRating rating={item.rating} size="sm" />
            <span className="text-sm font-bold text-gray-900">
              {item.rating.toFixed(1)}
            </span>
            {item.review_count > 0 && (
              <span className="text-xs text-gray-500">({item.review_count})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {item.name}
        </h3>

        {/* Category */}
        {item.category_name && (
          <p className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {item.category_name}
          </p>
        )}

        {/* View Details */}
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
