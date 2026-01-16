'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'

interface SaveBusinessButtonProps {
  businessId: string
  initialIsSaved: boolean
  userId: string | null
  variant?: 'icon' | 'icon-label' | 'overlay'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SaveBusinessButton({
  businessId,
  initialIsSaved,
  userId,
  variant = 'icon',
  size = 'md',
  className = '',
}: SaveBusinessButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/')
      return
    }

    setIsLoading(true)

    // Optimistic update
    setIsSaved(!isSaved)

    const supabase = createClient()

    if (isSaved) {
      // Remove from saved
      const { error } = await supabase
        .from('saved_businesses')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing saved business:', error)
        setIsSaved(true) // Revert on error
      }
    } else {
      // Add to saved
      const { error } = await supabase
        .from('saved_businesses')
        .insert({
          business_id: businessId,
          user_id: userId,
        })

      if (error) {
        console.error('Error saving business:', error)
        setIsSaved(false) // Revert on error
      }
    }

    setIsLoading(false)
    startTransition(() => {
      router.refresh()
    })
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const loading = isLoading || isPending

  // Overlay variant - positioned absolutely in parent (bottom-right)
  if (variant === 'overlay') {
    return (
      <button
        onClick={handleToggleSave}
        disabled={loading}
        className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          isSaved
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-rose-500'
        } ${loading ? 'opacity-70' : ''} ${className}`}
        aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} transition-transform duration-200 hover:scale-110 ${
              isSaved ? 'fill-current' : ''
            }`}
          />
        )}
      </button>
    )
  }

  // Icon with label variant
  if (variant === 'icon-label') {
    return (
      <button
        onClick={handleToggleSave}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
          isSaved
            ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-rose-500'
        } ${loading ? 'opacity-70' : ''} ${className}`}
        aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} transition-transform duration-200 ${
              isSaved ? 'fill-current' : ''
            }`}
          />
        )}
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    )
  }

  // Default icon-only variant
  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        isSaved
          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-rose-500'
      } ${loading ? 'opacity-70' : ''} ${className}`}
      aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} transition-transform duration-200 hover:scale-110 ${
            isSaved ? 'fill-current' : ''
          }`}
        />
      )}
    </button>
  )
}
