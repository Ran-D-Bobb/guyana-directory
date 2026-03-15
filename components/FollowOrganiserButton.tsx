'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, Loader2, Plus, Check, UserPlus } from 'lucide-react'

interface FollowOrganiserButtonProps {
  /** Business ID if the organiser is a business */
  businessId?: string | null
  /** User ID if the organiser is a community organiser */
  organiserUserId?: string | null
  organiserName: string
  initialIsFollowing: boolean
  userId: string | null
  variant?: 'icon' | 'icon-label' | 'pill' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FollowOrganiserButton({
  businessId,
  organiserUserId,
  organiserName,
  initialIsFollowing,
  userId: serverUserId,
  variant = 'pill',
  size = 'md',
  className = '',
}: FollowOrganiserButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [userId, setUserId] = useState<string | null>(serverUserId)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Resolve auth and follow status client-side when not provided by server
  useEffect(() => {
    if (serverUserId) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      let query = supabase
        .from('followed_organisers')
        .select('id')
        .eq('user_id', user.id)

      if (businessId) {
        query = query.eq('business_id', businessId)
      } else if (organiserUserId) {
        query = query.eq('organiser_user_id', organiserUserId)
      } else {
        return
      }

      query.single().then(({ data }) => {
        if (data) setIsFollowing(true)
      })
    })
  }, [serverUserId, businessId, organiserUserId])

  // Don't render if no organiser target
  if (!businessId && !organiserUserId) return null

  // Don't show follow button if the user IS the organiser
  if (userId && organiserUserId && userId === organiserUserId) return null

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/')
      return
    }

    setIsLoading(true)
    setIsFollowing(!isFollowing)

    const supabase = createClient()

    if (isFollowing) {
      // Unfollow
      let query = supabase
        .from('followed_organisers')
        .delete()
        .eq('user_id', userId)

      if (businessId) {
        query = query.eq('business_id', businessId)
      } else {
        query = query.eq('organiser_user_id', organiserUserId!)
      }

      const { error } = await query

      if (error) {
        console.error('Error unfollowing organiser:', error)
        setIsFollowing(true)
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('followed_organisers')
        .insert({
          user_id: userId,
          business_id: businessId || null,
          organiser_user_id: businessId ? null : organiserUserId!,
        })

      if (error) {
        console.error('Error following organiser:', error)
        setIsFollowing(false)
      }
    }

    setIsLoading(false)
    startTransition(() => {
      router.refresh()
    })
  }

  const loading = isLoading || isPending
  const label = isFollowing ? 'Following' : 'Follow'
  const ariaLabel = isFollowing
    ? `Unfollow ${organiserName}`
    : `Follow ${organiserName} to see their events on your homepage`

  const sizeClasses = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }

  // Pill variant
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
        aria-label={ariaLabel}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isFollowing ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <UserPlus className="w-3.5 h-3.5" />
        )}
        <span>{label}</span>
      </button>
    )
  }

  // Compact variant
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
        aria-label={ariaLabel}
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

  // Icon-label variant
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
        aria-label={ariaLabel}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : isFollowing ? (
          <Bell className={`${iconSizes[size]} fill-current`} />
        ) : (
          <UserPlus className={`${iconSizes[size]}`} />
        )}
        <span>{label}</span>
      </button>
    )
  }

  // Icon-only variant
  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        isFollowing
          ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-teal-500'
      } ${loading ? 'opacity-70' : ''} ${className}`}
      aria-label={ariaLabel}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isFollowing ? (
        <Bell className={`${iconSizes[size]} fill-current`} />
      ) : (
        <UserPlus className={`${iconSizes[size]}`} />
      )}
    </button>
  )
}
