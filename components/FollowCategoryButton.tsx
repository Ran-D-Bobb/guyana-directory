'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, Loader2, Plus, Check } from 'lucide-react'

interface FollowCategoryButtonProps {
  categoryId: string
  categoryName: string
  initialIsFollowing: boolean
  userId: string | null
  variant?: 'icon' | 'icon-label' | 'pill' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FollowCategoryButton({
  categoryId,
  categoryName,
  initialIsFollowing,
  userId,
  variant = 'icon-label',
  size = 'md',
  className = '',
}: FollowCategoryButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/')
      return
    }

    setIsLoading(true)

    // Optimistic update
    setIsFollowing(!isFollowing)

    const supabase = createClient()

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('followed_categories')
        .delete()
        .eq('category_id', categoryId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error unfollowing category:', error)
        setIsFollowing(true) // Revert on error
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('followed_categories')
        .insert({
          category_id: categoryId,
          user_id: userId,
        })

      if (error) {
        console.error('Error following category:', error)
        setIsFollowing(false) // Revert on error
      }
    }

    setIsLoading(false)
    startTransition(() => {
      router.refresh()
    })
  }

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const loading = isLoading || isPending

  // Pill variant - compact pill style for inline use
  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          isFollowing
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
        } ${loading ? 'opacity-70' : ''} ${className}`}
        aria-label={isFollowing ? `Unfollow ${categoryName}` : `Follow ${categoryName}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isFollowing ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      </button>
    )
  }

  // Compact variant - for sidebar/list use
  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          isFollowing
            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-teal-600'
        } ${loading ? 'opacity-70' : ''} ${className}`}
        aria-label={isFollowing ? `Unfollow ${categoryName}` : `Follow ${categoryName}`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          <BellOff className="w-3 h-3" />
        ) : (
          <Bell className="w-3 h-3" />
        )}
        <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
      </button>
    )
  }

  // Icon with label variant
  if (variant === 'icon-label') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
          isFollowing
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200'
        } ${loading ? 'opacity-70' : ''} ${className}`}
        aria-label={isFollowing ? `Unfollow ${categoryName}` : `Follow ${categoryName}`}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : isFollowing ? (
          <Bell className={`${iconSizes[size]} fill-current`} />
        ) : (
          <Bell className={`${iconSizes[size]}`} />
        )}
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      </button>
    )
  }

  // Default icon-only variant
  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        isFollowing
          ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-teal-500'
      } ${loading ? 'opacity-70' : ''} ${className}`}
      aria-label={isFollowing ? `Unfollow ${categoryName}` : `Follow ${categoryName}`}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isFollowing ? (
        <Bell className={`${iconSizes[size]} fill-current`} />
      ) : (
        <Bell className={`${iconSizes[size]}`} />
      )}
    </button>
  )
}
