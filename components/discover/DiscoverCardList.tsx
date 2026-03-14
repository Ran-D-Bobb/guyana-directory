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
  Phone,
  MapPin,
} from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import type { DiscoverItem, DiscoverItemType } from '@/types/discover';
import { getDistanceTierStyles } from '@/lib/geolocation';
import { cn } from '@/lib/utils';
import { getFallbackImage } from '@/lib/category-images';

interface DiscoverCardListProps {
  item: DiscoverItem;
  showDistance?: boolean;
}

const TYPE_CONFIG: Record<
  DiscoverItemType,
  { icon: React.ElementType; label: string; path: string }
> = {
  business: { icon: Store, label: 'Business', path: '/businesses' },
  tourism: { icon: Palmtree, label: 'Experience', path: '/tourism' },
  rental: { icon: Home, label: 'Rental', path: '/rentals' },
  event: { icon: Calendar, label: 'Event', path: '/events' },
};

function formatDistanceValue(meters: number): string {
  if (meters === Infinity) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatPrice(price: number | null | undefined, type: DiscoverItemType): string {
  if (!price) return '';
  if (type === 'rental') return `$${price.toLocaleString()}/mo`;
  return `From $${price.toLocaleString()}`;
}

export function DiscoverCardList({ item, showDistance = true }: DiscoverCardListProps) {
  const typeConfig = TYPE_CONFIG[item.type];
  const tierStyles = showDistance ? getDistanceTierStyles(item.distance_tier) : null;
  const distanceText = showDistance ? formatDistanceValue(item.distance_meters) : '';
  const priceText = formatPrice(item.price_from, item.type);
  const contactNumber = item.phone || item.whatsapp_number;

  return (
    <div className="group relative flex gap-3 sm:gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30 transition-colors">
      {/* Image — links to detail */}
      <Link
        href={`${typeConfig.path}/${item.slug}`}
        className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-l-xl overflow-hidden shrink-0 bg-[hsl(var(--muted))]"
      >
        <Image
          src={item.image_url || getFallbackImage(item.category_name, item.type)}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, 128px"
        />

        {/* Distance badge — top-left on image */}
        {showDistance && distanceText && tierStyles && (
          <span
            className={cn(
              'absolute top-1.5 left-1.5 inline-flex items-center px-1.5 py-0.5 text-[11px] font-bold rounded-md',
              tierStyles.bg,
              tierStyles.text
            )}
          >
            {distanceText}
          </span>
        )}
      </Link>

      {/* Content — links to detail */}
      <Link
        href={`${typeConfig.path}/${item.slug}`}
        className="flex-1 min-w-0 py-2.5 sm:py-3 pr-2 flex flex-col justify-between"
      >
        <div>
          {/* Name + badges */}
          <div className="flex items-start gap-1.5 mb-0.5">
            <h3 className="font-semibold text-[15px] sm:text-base text-foreground line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
              {item.name}
            </h3>
            {item.is_verified && (
              <BadgeCheck className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
            )}
            {item.is_featured && (
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--gold-500))] shrink-0 mt-0.5" />
            )}
          </div>

          {/* Category + type */}
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.category_name || typeConfig.label}
            {item.address && (
              <span className="inline-flex items-center gap-0.5 ml-1.5">
                <span className="text-[hsl(var(--border))]">&middot;</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{item.address}</span>
              </span>
            )}
          </p>
        </div>

        {/* Bottom row: rating, distance label, price */}
        <div className="flex items-center gap-3 mt-auto">
          {/* Rating */}
          {item.rating != null && item.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={item.rating} size="sm" />
              <span className="text-xs font-semibold text-foreground">
                {item.rating.toFixed(1)}
              </span>
              {item.review_count > 0 && (
                <span className="text-xs text-muted-foreground">({item.review_count})</span>
              )}
            </div>
          )}

          {/* Distance label */}
          {showDistance && item.distance_label && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {item.distance_label}
            </span>
          )}

          {/* Price */}
          {priceText && (
            <span className="text-xs font-medium text-[hsl(var(--primary))]">
              {priceText}
            </span>
          )}
        </div>
      </Link>

      {/* Call button — separate tap target */}
      {contactNumber && (
        <a
          href={`tel:${contactNumber}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'self-center shrink-0 mr-3 sm:mr-4',
            'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
            'bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20',
            'flex items-center justify-center',
            'transition-colors'
          )}
          aria-label={`Call ${item.name}`}
        >
          <Phone className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[hsl(var(--primary))]" />
        </a>
      )}
    </div>
  );
}
