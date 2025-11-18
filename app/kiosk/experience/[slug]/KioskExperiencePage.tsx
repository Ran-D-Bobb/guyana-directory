'use client'

import { useRouter } from 'next/navigation'
import KioskExperienceShowcase from '@/components/kiosk/KioskExperienceShowcase'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { useEffect } from 'react'

interface ExperiencePhoto {
  id: string
  image_url: string
  is_primary: boolean
}

interface ExperienceReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: {
    name: string
  } | null
}

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  category_name: string
  region_name: string | null
  location: string | null
  duration_hours: number | null
  difficulty_level: string | null
  max_group_size: number | null
  min_age: number | null
  price_from: number
  rating: number
  review_count: number
  whatsapp_number: string | null
  phone: string | null
  languages_offered: string[] | null
  what_to_bring: string[] | null
  accessibility_info: string | null
  safety_information: string | null
  included_items: string[] | null
  excluded_items: string[] | null
  tourism_photos: ExperiencePhoto[]
  tourism_reviews: ExperienceReview[]
}

interface KioskExperiencePageProps {
  experience: Experience
}

export default function KioskExperiencePage({ experience }: KioskExperiencePageProps) {
  const router = useRouter()

  // Auto-return to home after 2 minutes of inactivity
  useIdleTimer(() => {
    router.push('/kiosk')
  }, 120000) // 120 seconds (2 minutes)

  const handleBack = () => {
    router.back()
  }

  // Track experience view in kiosk mode
  useEffect(() => {
    // Log kiosk experience view
    console.log('Kiosk view:', experience.name)

    // You can add analytics tracking here
    // Example: track to your analytics service with device_type: 'kiosk'
  }, [experience.id, experience.name])

  return (
    <KioskExperienceShowcase
      experience={experience}
      onBack={handleBack}
    />
  )
}
