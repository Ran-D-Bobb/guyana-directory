'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sparkles, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FeedCard, type FeedItem } from './FeedCard'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ForYouSectionProps {
  className?: string
}

export function ForYouSection({ className }: ForYouSectionProps) {
  const [recommendations, setRecommendations] = useState<FeedItem[]>([])
  const [basedOn, setBasedOn] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasActivity, setHasActivity] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { items: recentlyViewed, isLoaded: recentlyViewedLoaded } = useRecentlyViewed()

  // Aggregate recently viewed categories
  const recentlyViewedCategories = useMemo(() => {
    if (!recentlyViewedLoaded) return []

    const categoryCount = new Map<string, number>()

    // Only count business categories (as recommendations are for businesses)
    for (const item of recentlyViewed) {
      if (item.type === 'business' && item.category) {
        categoryCount.set(item.category, (categoryCount.get(item.category) || 0) + 1)
      }
    }

    return Array.from(categoryCount.entries()).map(([categoryName, count]) => ({
      categoryName,
      count,
    }))
  }, [recentlyViewed, recentlyViewedLoaded])

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Wait for recently viewed data to load
      if (!recentlyViewedLoaded) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recentlyViewedCategories,
            limit: 6,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setRecommendations(data.items || [])
        setBasedOn(data.basedOn || null)
        setHasActivity(data.hasActivity || false)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError('Unable to load recommendations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [recentlyViewedLoaded, recentlyViewedCategories])

  // Don't show if not logged in and no recently viewed activity
  if (!isLoggedIn && recentlyViewedCategories.length === 0) {
    return null
  }

  // Don't show while loading
  if (isLoading || !recentlyViewedLoaded) {
    return (
      <section className={cn('max-w-7xl mx-auto px-4 py-6', className)}>
        <div className="animate-pulse">
          <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Don't show if no recommendations and no error
  if (recommendations.length === 0 && !error) {
    return null
  }

  // Error state
  if (error) {
    return null // Silently fail, don't block the page
  }

  return (
    <section className={cn('max-w-7xl mx-auto px-4 py-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Recommended for You
            </h2>
          </div>
          {basedOn && hasActivity && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <span>Based on your interest in</span>
              <span className="font-medium text-emerald-600">{basedOn}</span>
            </p>
          )}
          {!hasActivity && (
            <p className="text-sm text-gray-500">
              Popular picks you might like
            </p>
          )}
        </div>

        {isLoggedIn && (
          <Link
            href="/businesses"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span className="hidden sm:inline">View all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Sign-in prompt for anonymous users */}
      {!isLoggedIn && hasActivity && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <User className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">
                Get personalized recommendations
              </p>
              <p className="text-xs text-amber-700">
                Sign in to save favorites and get better suggestions
              </p>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {recommendations.map((item, index) => (
          <FeedCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Activity hint for logged-in users without much activity */}
      {isLoggedIn && !hasActivity && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Save and review businesses to get personalized recommendations
          </p>
        </div>
      )}
    </section>
  )
}
