'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Sparkles, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const DEFAULT_IMAGES: Record<FeedItemType, string> = {
  business: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  tourism: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
  rental: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
};

export function FeedCard({ item, index = 0 }: FeedCardProps) {
  const config = TYPE_CONFIG[item.type];
  const href = `${config.path}/${item.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-2xl overflow-hidden card-elevated',
        'active:scale-[0.98] transition-transform duration-150',
        'animate-fade-up'
      )}
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={item.image_url || DEFAULT_IMAGES[item.type]}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Left: Type Badge */}
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

          {/* Featured Badge */}
          {item.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Featured</span>
            </span>
          )}

          {/* Verified Badge */}
          {item.is_verified && !item.is_featured && (
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
        {/* Category */}
        {item.category_name && (
          <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 truncate">
            {item.category_name}
          </p>
        )}

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
