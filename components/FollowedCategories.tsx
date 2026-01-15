'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, BellOff, Loader2, Sparkles, Folder, Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, Home, Heart, Laptop, GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package, type LucideIcon } from 'lucide-react'

interface FollowedCategory {
  category_id: string
  category_name: string
  category_slug: string
  category_icon: string
  new_this_week: number
  followed_at: string
}

interface FollowedCategoriesProps {
  categories: FollowedCategory[]
  userId: string
  variant?: 'grid' | 'list' | 'compact'
  className?: string
}

export function FollowedCategories({
  categories,
  userId,
  variant = 'grid',
  className = '',
}: FollowedCategoriesProps) {
  const [followedCategories, setFollowedCategories] = useState(categories)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  // Map icon names to actual Lucide components
  const iconMap: Record<string, LucideIcon> = {
    Store, ShoppingBag, UtensilsCrossed, Wrench, Briefcase, Shirt, Home, Heart, Laptop,
    GraduationCap, Music, Camera, Dumbbell, Leaf, Car, Plane, PawPrint, Baby, Gift, Coffee, Package, Folder
  }

  const handleUnfollow = async (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoadingId(categoryId)

    // Optimistic update
    setFollowedCategories(prev => prev.filter(c => c.category_id !== categoryId))

    const supabase = createClient()

    const { error } = await supabase
      .from('followed_categories')
      .delete()
      .eq('category_id', categoryId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error unfollowing category:', error)
      // Revert on error
      setFollowedCategories(categories)
    }

    setLoadingId(null)
    router.refresh()
  }

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || Folder
  }

  if (followedCategories.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">You&apos;re not following any categories yet</p>
        <Link
          href="/businesses"
          className="inline-block mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
        >
          Browse categories to follow
        </Link>
      </div>
    )
  }

  // Compact variant - horizontal scrollable list
  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
        {followedCategories.map((category) => {
          const Icon = getIcon(category.category_icon)
          const isLoading = loadingId === category.category_id

          return (
            <Link
              key={category.category_id}
              href={`/businesses?category=${category.category_slug}`}
              className="flex-shrink-0 group relative flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Icon className="w-4 h-4 text-gray-500 group-hover:text-teal-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">
                {category.category_name}
              </span>
              {category.new_this_week > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <Sparkles className="w-3 h-3" />
                  {category.new_this_week}
                </span>
              )}
              <button
                onClick={(e) => handleUnfollow(category.category_id, e)}
                disabled={isLoading}
                className="ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                aria-label={`Unfollow ${category.category_name}`}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <BellOff className="w-3 h-3" />
                )}
              </button>
            </Link>
          )
        })}
      </div>
    )
  }

  // List variant - vertical list
  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {followedCategories.map((category) => {
          const Icon = getIcon(category.category_icon)
          const isLoading = loadingId === category.category_id

          return (
            <div
              key={category.category_id}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-colors group"
            >
              <Link
                href={`/businesses?category=${category.category_slug}`}
                className="flex items-center gap-3 flex-1"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <Icon className="w-4.5 h-4.5 text-gray-600 group-hover:text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-teal-700 truncate">
                    {category.category_name}
                  </p>
                  {category.new_this_week > 0 && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {category.new_this_week} new this week
                    </p>
                  )}
                </div>
              </Link>
              <button
                onClick={(e) => handleUnfollow(category.category_id, e)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label={`Unfollow ${category.category_name}`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <BellOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Unfollow</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  // Default grid variant
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {followedCategories.map((category) => {
        const Icon = getIcon(category.category_icon)
        const isLoading = loadingId === category.category_id

        return (
          <div
            key={category.category_id}
            className="relative p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 hover:shadow-md transition-all group"
          >
            <Link
              href={`/businesses?category=${category.category_slug}`}
              className="block"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 group-hover:from-teal-100 group-hover:to-emerald-100 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-teal-700 truncate">
                    {category.category_name}
                  </p>
                  {category.new_this_week > 0 ? (
                    <p className="text-sm text-emerald-600 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {category.new_this_week} new this week
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-0.5">
                      No new listings
                    </p>
                  )}
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => handleUnfollow(category.category_id, e)}
              disabled={isLoading}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Unfollow ${category.category_name}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
