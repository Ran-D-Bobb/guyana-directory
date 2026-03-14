'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, BadgeCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFallbackImage } from '@/lib/category-images';

export type FeedItemType = 'business' | 'tourism' | 'rental' | 'event';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  review_count: number;
  category_name: string | null;
  is_featured: boolean;
  is_verified: boolean;
  price_display?: string | null;
  location?: string | null;
}

interface FeedCardProps {
  item: FeedItem;
  index?: number;
}

const TYPE_CONFIG: Record<
  FeedItemType,
  {
    label: string;
    gradient: string;
    bgLight: string;
    path: string;
  }
> = {
  business: {
    label: 'Shop',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 text-amber-700',
    path: '/businesses',
  },
  tourism: {
    label: 'Experience',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 text-emerald-700',
    path: '/tourism',
  },
  rental: {
    label: 'Stay',
    gradient: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50 text-blue-700',
    path: '/rentals',
  },
  event: {
    label: 'Event',
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50 text-purple-700',
    path: '/events',
  },
};


export function FeedCard({ item, index = 0 }: FeedCardProps) {
  const config = TYPE_CONFIG[item.type];
  const href = `${config.path}/${item.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-2xl overflow-hidden',
        'hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]',
        'transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        item.is_featured
          ? 'ring-2 ring-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
          : 'card-elevated'
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={item.image_url || getFallbackImage(item.category_name, item.type)}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Left: Type Badge + Verified */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full',
              'bg-gradient-to-r text-white shadow-lg',
              'ring-1 ring-white/20',
              config.gradient
            )}
          >
            {config.label}
          </span>

          {/* Verified Badge */}
          {item.is_verified && (
            <span className="inline-flex items-center p-1 bg-emerald-500 text-white rounded-full shadow-lg">
              <BadgeCheck className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Top Right: Rating */}
        {item.rating != null && item.rating > 0 && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold">{item.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 bg-white">
        {/* Category + Featured label */}
        <div className="flex items-center gap-2 mb-1">
          {item.category_name && (
            <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider truncate">
              {item.category_name}
            </p>
          )}
          {item.is_featured && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 flex-shrink-0">
              <Sparkles className="w-3 h-3 animate-featured-sparkle" />
              Featured
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-600 transition-colors mb-1">
          {item.name}
        </h3>

        {/* Price or Location */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 truncate min-w-0">
            {item.price_display ? (
              <span className="font-medium text-gray-900">{item.price_display}</span>
            ) : item.location ? (
              <>
                <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                <span className="truncate">{item.location}</span>
              </>
            ) : null}
          </div>

          {/* Review count */}
          {item.review_count > 0 && (
            <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
              {item.review_count} {item.review_count === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
