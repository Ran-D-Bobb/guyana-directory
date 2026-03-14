'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Star,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type FeedItem } from './FeedCard';

/* ─── Time-of-day configuration ─── */

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface TimeConfig {
  greeting: string;
  emoji: string;
  image: string;
  overlay: string;
}

const TIME_CONFIG: Record<TimeOfDay, TimeConfig> = {
  morning: {
    greeting: 'Good morning',
    emoji: '\u2600\uFE0F',
    image: '/images/defaults/tourism-landscape.jpg',
    overlay:
      'linear-gradient(to bottom, rgba(10,20,15,0.45) 0%, rgba(10,20,15,0.25) 40%, rgba(10,20,15,0.7) 100%)',
  },
  afternoon: {
    greeting: 'Good afternoon',
    emoji: '\uD83C\uDF24\uFE0F',
    image: '/images/defaults/tourism-landscape.jpg',
    overlay:
      'linear-gradient(to bottom, rgba(10,18,14,0.4) 0%, rgba(10,18,14,0.2) 40%, rgba(10,18,14,0.75) 100%)',
  },
  evening: {
    greeting: 'Good evening',
    emoji: '\uD83C\uDF05',
    image: '/images/defaults/tourism-landscape.jpg',
    overlay:
      'linear-gradient(to bottom, rgba(15,10,5,0.4) 0%, rgba(15,10,5,0.2) 40%, rgba(10,8,5,0.8) 100%)',
  },
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

/* ─── Category Navigation ─── */

function NearMeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 018 8c0 5.4-8 12-8 12S4 15.4 4 10a8 8 0 018-8z" />
    </svg>
  );
}

function ShoppingNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M7 9v1.5a2.5 2.5 0 005 0V9" />
      <path d="M12 9v1.5a2.5 2.5 0 005 0V9" />
    </svg>
  );
}

function ExploreNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M16.24 7.76l-4.24 2.48-2.48 4.24 4.24-2.48z" />
    </svg>
  );
}

function EventsNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StaysNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17v3h20v-3" />
      <path d="M2 17V10a1 1 0 011-1h3v5h12V9h3a1 1 0 011 1v7" />
      <path d="M6 9V6a2 2 0 012-2h8a2 2 0 012 2v3" />
      <path d="M6 14h12" />
    </svg>
  );
}

const CATEGORIES = [
  { name: 'Near Me', href: '/discover', icon: NearMeIcon, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { name: 'Shopping', href: '/businesses', icon: ShoppingNavIcon, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { name: 'Explore', href: '/tourism', icon: ExploreNavIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { name: 'Events', href: '/events', icon: EventsNavIcon, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { name: 'Stays', href: '/rentals', icon: StaysNavIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

/* ─── Component ─── */

interface WelcomeHeroProps {
  items: FeedItem[];
}

export function WelcomeHero({ items }: WelcomeHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, []);

  const config = timeOfDay ? TIME_CONFIG[timeOfDay] : null;

  const featuredItems = useMemo(() => {
    return items
      .filter((item) => item.is_featured || (item.rating && item.rating >= 4))
      .slice(0, 4);
  }, [items]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  const listingCount = items.length;

  return (
    <header className="relative overflow-hidden">
      {/* ══════ Image Banner Section ══════ */}
      <div className="relative">
        {/* Background image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(158,64%,8%)] via-[hsl(160,55%,12%)] to-[hsl(158,45%,6%)]" />
          {config && (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={config.image}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover animate-ken-burns-slow"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          )}
          {/* Clean single overlay — no noise, no vignette, no accent glow */}
          {config && (
            <div
              className="absolute inset-0 z-[1]"
              style={{ background: config.overlay }}
            />
          )}
        </div>

        {/* Banner content — greeting + search */}
        <div className="relative z-10 px-4 pt-8 pb-7 sm:pt-10 sm:pb-9">
          <div className="max-w-2xl mx-auto">
            {/* Greeting + stat */}
            <div className="mb-5 animate-fade-up">
              <h2 className="font-display text-white mb-1.5 drop-shadow-lg">
                {config ? config.greeting : 'Welcome'}{' '}
                {config ? config.emoji : '\u{1F44B}'}
              </h2>
              <p className="text-white/70 text-sm sm:text-base font-medium tracking-wide drop-shadow-md">
                {listingCount > 0
                  ? `${listingCount}+ listings across Guyana`
                  : 'Discover local gems across Guyana'}
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="animate-fade-up delay-100">
              <div
                className={`relative transition-all duration-200 ${
                  isFocused ? 'scale-[1.01]' : ''
                }`}
              >
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-[18px] h-[18px] text-white/50 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search businesses, experiences..."
                    className="w-full pl-10 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.18] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-white/30 placeholder:text-white/45 text-white font-medium transition-all shadow-lg shadow-black/10"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom fade into content area */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[hsl(var(--jungle-50))] dark:from-[hsl(var(--background))] to-transparent z-10" />
      </div>

      {/* ══════ Content Below Banner ══════ */}
      <div className="relative bg-[hsl(var(--jungle-50))] dark:bg-[hsl(var(--background))] px-4 pt-4 pb-2">
        <div className="max-w-2xl mx-auto">
          {/* Category Cards — horizontal scroll */}
          <motion.div
            className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-5 snap-x justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.name} variants={staggerChild}>
                  <Link
                    href={cat.href}
                    className="flex flex-col items-center justify-center w-[72px] h-[76px] rounded-2xl bg-white dark:bg-white/[0.08] border border-gray-200/80 dark:border-white/[0.1] hover:border-emerald-200 dark:hover:border-emerald-700/40 hover:shadow-md transition-all active:scale-[0.95] touch-manipulation shadow-sm snap-start group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-[18px] h-[18px] ${cat.color}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-none">{cat.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Featured Preview — visible without scrolling */}
        {featuredItems.length > 0 && (
          <div className="max-w-2xl mx-auto animate-fade-up delay-300">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-sans tracking-tight">
                Featured
              </h3>
              <Link
                href="#browse-all"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4 snap-x snap-mandatory">
              {featuredItems.map((item) => {
                const href = `/${
                  item.type === 'business'
                    ? 'businesses'
                    : item.type === 'tourism'
                      ? 'tourism'
                      : item.type === 'rental'
                        ? 'rentals'
                        : 'events'
                }/${item.slug}`;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="flex-none w-[200px] sm:w-[220px] snap-start rounded-xl overflow-hidden bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.08] hover:shadow-lg dark:hover:border-white/[0.15] transition-all active:scale-[0.98] touch-manipulation group shadow-sm"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-white/5">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="220px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
                          <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-sans leading-tight">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {item.rating && item.rating > 0 ? (
                          <>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {item.rating.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            New
                          </span>
                        )}
                        {item.category_name && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto truncate max-w-[90px]">
                            {item.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
