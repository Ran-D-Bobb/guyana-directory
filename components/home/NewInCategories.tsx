'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Bell, Sparkles, ChevronRight, Star, MapPin, Loader2, Folder, Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, Home, Heart, Laptop, GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package, type LucideIcon } from 'lucide-react';
import { getCategoryImage } from '@/lib/category-images';

// Map icon names to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, Home, Heart, Laptop,
  GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package, Folder
};

interface FollowedCategoryWithBusinesses {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
  new_this_week: number;
  businesses: Array<{
    id: string;
    name: string;
    slug: string;
    rating: number | null;
    region_name: string | null;
    image_url: string | null;
  }>;
}

export function NewInCategories() {
  const t = useTranslations('home');
  const [userId, setUserId] = useState<string | null>(null);
  const [categoriesWithBusinesses, setCategoriesWithBusinesses] = useState<FollowedCategoryWithBusinesses[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch followed categories with new business counts
      const { data: followedCategories, error: followedError } = await supabase
        .rpc('get_followed_categories_with_counts', { p_user_id: user.id });

      if (followedError || !followedCategories) {
        console.error('Error fetching followed categories:', followedError);
        setIsLoading(false);
        return;
      }

      // Filter to only categories with new businesses
      const categoriesWithNew = followedCategories.filter(
        (cat: { new_this_week: number }) => cat.new_this_week > 0
      );

      if (categoriesWithNew.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch new businesses for all followed categories in a single query (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const categoryIds = categoriesWithNew.map((c: { category_id: string }) => c.category_id);
      const { data: allNewBusinesses } = await supabase
        .from('businesses')
        .select(`
          id, name, slug, rating, category_id,
          regions:region_id (name),
          business_photos (image_url, is_primary)
        `)
        .in('category_id', categoryIds)
        .eq('is_active', true)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false });

      // Group by category_id, limit 6 per category
      const businessesByCategory = new Map<string, typeof allNewBusinesses>();
      for (const biz of (allNewBusinesses || [])) {
        const catId = biz.category_id;
        if (!catId) continue;
        const group = businessesByCategory.get(catId) || [];
        if (group.length < 6) {
          group.push(biz);
          businessesByCategory.set(catId, group);
        }
      }

      const categoriesWithBusinessesData: FollowedCategoryWithBusinesses[] = categoriesWithNew
        .filter((cat: { category_id: string }) => {
          const businesses = businessesByCategory.get(cat.category_id);
          return businesses && businesses.length > 0;
        })
        .map((cat: { category_id: string; category_name: string; category_slug: string; category_icon: string; new_this_week: number }) => ({
          ...cat,
          businesses: (businessesByCategory.get(cat.category_id) || []).map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            rating: b.rating,
            region_name: (b.regions as { name: string } | null)?.name || null,
            image_url: Array.isArray(b.business_photos)
              ? b.business_photos.find((p) => p.is_primary)?.image_url ||
                b.business_photos[0]?.image_url ||
                null
              : null,
          })),
        }));

      setCategoriesWithBusinesses(categoriesWithBusinessesData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || Folder;
  };

  // Don't show if user is not logged in
  if (!userId && !isLoading) {
    return null;
  }

  // Don't show if loading
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      </section>
    );
  }

  // Don't show if no categories with new businesses
  if (categoriesWithBusinesses.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <h2 className="text-section-title-lg font-bold text-gray-900">{t('newInCategories')}</h2>
      </div>

      {/* Categories with New Businesses */}
      <div className="space-y-6">
        {categoriesWithBusinesses.map((category) => {
          const Icon = getIcon(category.category_icon);

          return (
            <div key={category.category_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
                    <p className="text-sm text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('newThisWeek', { count: category.new_this_week })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/businesses?category=${category.category_id}`}
                  className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {t('recommendedViewAll')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* New Businesses - Horizontal scroll on mobile */}
              <div className="p-4">
                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden -mx-4 px-4">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {category.businesses.map((business) => (
                      <Link
                        key={business.id}
                        href={`/businesses/${business.slug}`}
                        className="group flex-shrink-0 w-[clamp(130px,38vw,160px)] snap-start"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                          <Image
                            src={business.image_url || getCategoryImage(category.category_slug)}
                            alt={business.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="140px"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full uppercase">
                            {t('newBadge')}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 group-hover:text-emerald-600 line-clamp-1">
                          {business.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {business.rating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium text-gray-600">
                                {business.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Desktop: Grid */}
                <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {category.businesses.map((business) => (
                    <Link
                      key={business.id}
                      href={`/businesses/${business.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={business.image_url || getCategoryImage(category.category_slug)}
                          alt={business.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 1024px) 33vw, 16vw"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">
                          {t('newBadge')}
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-emerald-600 line-clamp-1">
                        {business.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {business.rating && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {business.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {business.region_name && (
                          <div className="flex items-center gap-0.5 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{business.region_name}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
