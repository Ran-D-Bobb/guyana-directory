'use client'

import { useState, useEffect } from 'react'
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
  duration: string | null
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
  featuredAttractions: Experience[]
}

export default function KioskHomePage({ experiences, categories, featuredAttractions }: KioskHomePageProps) {
  const [mode, setMode] = useState<'attraction' | 'categories'>('attraction')

  // Prioritize featured attractions in the loop - show featured first, then other experiences
  const prioritizedExperiences = featuredAttractions && featuredAttractions.length > 0
    ? [...featuredAttractions, ...experiences.filter(exp => !featuredAttractions.find(f => f.id === exp.id))]
    : experiences

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

  const handleBackToAttractionLoop = () => {
    setMode('attraction')
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
          experiences={prioritizedExperiences}
          onTapToExplore={handleTapToExplore}
        />
      ) : (
        <KioskCategoryGrid
          categories={categories}
          featuredAttractions={featuredAttractions}
          onBack={handleBackToAttractionLoop}
        />
      )}
    </div>
  )
}
