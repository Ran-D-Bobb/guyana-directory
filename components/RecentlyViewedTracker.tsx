'use client'

import { useEffect } from 'react'
import { useRecentlyViewed, type RecentlyViewedItemType } from '@/hooks/useRecentlyViewed'

interface RecentlyViewedTrackerProps {
  type: RecentlyViewedItemType
  id: string
  slug: string
  name: string
  image: string
  category?: string
  location?: string
}

/**
 * Client component that tracks page views for the Recently Viewed feature.
 * Drop this into any detail page to record the view.
 * Renders nothing - purely for side effects.
 */
export function RecentlyViewedTracker({
  type,
  id,
  slug,
  name,
  image,
  category,
  location,
}: RecentlyViewedTrackerProps) {
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    // Add to recently viewed on mount
    addItem({
      type,
      id,
      slug,
      name,
      image,
      category,
      location,
    })
  }, [addItem, type, id, slug, name, image, category, location])

  // This component renders nothing
  return null
}
