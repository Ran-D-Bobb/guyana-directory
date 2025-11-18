'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Star, Loader2 } from 'lucide-react'

interface EventInterestButtonProps {
  eventId: string
  initialIsInterested: boolean
  initialInterestCount: number
  userId: string | null
}

export function EventInterestButton({
  eventId,
  initialIsInterested,
  initialInterestCount,
  userId,
}: EventInterestButtonProps) {
  const [isInterested, setIsInterested] = useState(initialIsInterested)
  const [interestCount, setInterestCount] = useState(initialInterestCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleInterest = async () => {
    if (!userId) {
      // Redirect to login if not authenticated
      router.push('/')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    if (isInterested) {
      // Remove interest
      const { error } = await supabase
        .from('event_interests')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (!error) {
        setIsInterested(false)
        setInterestCount((prev) => Math.max(prev - 1, 0))
      } else {
        console.error('Error removing interest:', error)
      }
    } else {
      // Add interest
      const { error } = await supabase
        .from('event_interests')
        .insert({
          event_id: eventId,
          user_id: userId,
        })

      if (!error) {
        setIsInterested(true)
        setInterestCount((prev) => prev + 1)
      } else {
        console.error('Error adding interest:', error)
      }
    }

    setIsLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleToggleInterest}
        disabled={isLoading || !userId}
        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
          isInterested
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Star className={`w-6 h-6 transition-transform duration-300 hover:scale-110 ${isInterested ? 'fill-white' : ''}`} />
        )}
        {isInterested ? 'You\'re Interested!' : 'Mark as Interested'}
      </button>
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 rounded-xl border border-purple-100">
        <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
        <span className="text-sm font-bold text-purple-700">
          {interestCount} {interestCount === 1 ? 'person is' : 'people are'} interested
        </span>
      </div>
    </div>
  )
}
