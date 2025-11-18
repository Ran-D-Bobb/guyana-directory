'use client'

import { useRouter } from 'next/navigation'
import KioskCategorySlideshow from '@/components/kiosk/KioskCategorySlideshow'
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
  max_group_size: number | null
  price_from: number
  difficulty_level: string | null
  location: string | null
  region_name: string | null
}

interface FeaturedExperience {
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
}

interface KioskCategoryPageProps {
  experiences: Experience[]
  categoryName: string
  featuredExperiences?: FeaturedExperience[]
}

export default function KioskCategoryPage({ experiences, categoryName, featuredExperiences }: KioskCategoryPageProps) {
  const router = useRouter()

  // Auto-return to home after 90 seconds of inactivity
  useIdleTimer(() => {
    router.push('/kiosk')
  }, 90000) // 90 seconds

  const handleBack = () => {
    router.push('/kiosk')
  }

  return (
    <KioskCategorySlideshow
      experiences={experiences}
      categoryName={categoryName}
      featuredExperiences={featuredExperiences}
      onBack={handleBack}
    />
  )
}
