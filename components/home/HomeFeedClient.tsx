'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { WelcomeHero } from './WelcomeHero';
import { CategoryFilterPills, type FilterType, type SortOption } from './CategoryFilterPills';
import { UnifiedFeed } from './UnifiedFeed';
import { type FeedItem } from './FeedCard';
import { ScrollReveal } from '@/components/ScrollReveal';

// Dynamic imports for below-fold sections — reduces initial JS bundle
const ForYouSection = dynamic(() => import('./ForYouSection').then(m => ({ default: m.ForYouSection })), { ssr: false });
const NewInCategories = dynamic(() => import('./NewInCategories').then(m => ({ default: m.NewInCategories })), { ssr: false });
const UpcomingFromOrganisers = dynamic(() => import('./UpcomingFromOrganisers').then(m => ({ default: m.UpcomingFromOrganisers })), { ssr: false });
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed').then(m => ({ default: m.RecentlyViewed })), { ssr: false });

interface HomeFeedClientProps {
  items: FeedItem[];
}

export function HomeFeedClient({ items }: HomeFeedClientProps) {
  const t = useTranslations('home');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Filter by type
  const filteredItems = useMemo(() => {
    if (activeType === 'all') return items;
    return items.filter((item) => item.type === activeType);
  }, [items, activeType]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    switch (sortBy) {
      case 'featured':
        // Featured items first, then by popularity score
        return sorted.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          // Then by popularity
          const scoreA = (a.rating || 0) * 10 + a.review_count;
          const scoreB = (b.rating || 0) * 10 + b.review_count;
          return scoreB - scoreA;
        });

      case 'popular':
        // Weighted score: rating matters more than review count
        return sorted.sort((a, b) => {
          const scoreA = (a.rating || 0) * 10 + a.review_count;
          const scoreB = (b.rating || 0) * 10 + b.review_count;
          return scoreB - scoreA;
        });

      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      default:
        return sorted;
    }
  }, [filteredItems, sortBy]);

  // Calculate counts
  const counts = useMemo(() => {
    return {
      all: items.length,
      business: items.filter((i) => i.type === 'business').length,
      tourism: items.filter((i) => i.type === 'tourism').length,
      rental: items.filter((i) => i.type === 'rental').length,
      event: items.filter((i) => i.type === 'event').length,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-[hsl(var(--jungle-50))] pb-24 lg:pb-0">
      {/* Welcome Hero with Search & Quick Access */}
      <WelcomeHero items={items} />

      {/* Sticky Filter Bar */}
      <CategoryFilterPills
        activeType={activeType}
        onTypeChange={setActiveType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />

      {/* Content sections with improved spacing - 16px min on mobile */}
      <div className="space-y-4 sm:space-y-6">
        {/* Recently Viewed Section */}
        <ScrollReveal variant="fade-up">
          <RecentlyViewed limit={10} />
        </ScrollReveal>

        {/* Personalized Recommendations */}
        <ScrollReveal variant="fade-up" delay={100}>
          <ForYouSection />
        </ScrollReveal>

        {/* New in Followed Categories */}
        <ScrollReveal variant="fade-up" delay={100}>
          <NewInCategories />
        </ScrollReveal>

        {/* Upcoming Events from Followed Organisers */}
        <ScrollReveal variant="fade-up" delay={150}>
          <UpcomingFromOrganisers />
        </ScrollReveal>
      </div>

      {/* Main Content Area - Browse All */}
      <main id="browse-all" className="max-w-7xl mx-auto px-4 pt-4 pb-6 sm:pt-8 scroll-mt-4">
        <ScrollReveal variant="fade-up">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-section-title-lg font-bold text-gray-900">{t('exploreTitle')}</h2>
            <p className="text-small-fluid text-gray-500 mt-0.5">{t('exploreSubtitle')}</p>
          </div>
        </ScrollReveal>
        <UnifiedFeed items={sortedItems} />
      </main>

    </div>
  );
}
