'use client'

import { useState, useEffect, useCallback } from 'react'

export type RecentlyViewedItemType = 'business' | 'event' | 'tourism' | 'rental'

export interface RecentlyViewedItem {
  type: RecentlyViewedItemType
  id: string
  slug: string
  name: string
  image: string
  viewedAt: number
  category?: string
  location?: string
}

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 20

/**
 * Hook to manage recently viewed items in localStorage
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[]
        // Sort by viewedAt descending (most recent first)
        const sorted = parsed.sort((a, b) => b.viewedAt - a.viewedAt)
        setItems(sorted)
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error)
    }
    setIsLoaded(true)
  }, [])

  // Add an item to recently viewed
  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems((prev) => {
      // Remove existing entry for the same item (same type and id)
      const filtered = prev.filter(
        (i) => !(i.type === item.type && i.id === item.id)
      )

      // Create new item with current timestamp
      const newItem: RecentlyViewedItem = {
        ...item,
        viewedAt: Date.now(),
      }

      // Add to beginning and limit to MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving recently viewed:', error)
      }

      return updated
    })
  }, [])

  // Remove an item from recently viewed
  const removeItem = useCallback((type: RecentlyViewedItemType, id: string) => {
    setItems((prev) => {
      const updated = prev.filter(
        (i) => !(i.type === type && i.id === id)
      )

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving recently viewed:', error)
      }

      return updated
    })
  }, [])

  // Clear all recently viewed items
  const clearAll = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing recently viewed:', error)
    }
  }, [])

  // Get items by type
  const getByType = useCallback(
    (type: RecentlyViewedItemType) => {
      return items.filter((item) => item.type === type)
    },
    [items]
  )

  // Get limited items for display
  const getRecentItems = useCallback(
    (limit: number = 10) => {
      return items.slice(0, limit)
    },
    [items]
  )

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    clearAll,
    getByType,
    getRecentItems,
  }
}
