'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KioskAttractionLoop from '@/components/kiosk/KioskAttractionLoop'
import KioskCategoryGrid from '@/components/kiosk/KioskCategoryGrid'
import { useIdleTimer } from '@/hooks/useIdleTimer'

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  duration_hours: number | null
  price_from: number
  category_name: string
  difficulty_level: string | null
}

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  description: string | null
  experience_count: number
}

interface KioskHomePageProps {
  experiences: Experience[]
  categories: Category[]
}

export default function KioskHomePage({ experiences, categories }: KioskHomePageProps) {
  const [mode, setMode] = useState<'attraction' | 'categories'>('attraction')
  const router = useRouter()

  // Auto-return to attraction loop after 60 seconds of inactivity
  const { resetTimer } = useIdleTimer(() => {
    if (mode === 'categories') {
      setMode('attraction')
    }
  }, 60000) // 60 seconds

  const handleTapToExplore = () => {
    setMode('categories')
    resetTimer()
  }

  // Track kiosk session analytics
  useEffect(() => {
    // Log kiosk session start
    console.log('Kiosk session started')

    // You can add analytics tracking here
    // Example: track to your analytics service
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden">
      {mode === 'attraction' ? (
        <KioskAttractionLoop
          experiences={experiences}
          onTapToExplore={handleTapToExplore}
        />
      ) : (
        <KioskCategoryGrid categories={categories} />
      )}
    </div>
  )
}
