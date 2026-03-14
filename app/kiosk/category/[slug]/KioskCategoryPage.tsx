'use client'

import { useRouter } from 'next/navigation'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import KioskCategoryBrowser from '@/components/kiosk/KioskCategoryBrowser'
import KioskDetailOverlay from '@/components/kiosk/KioskDetailOverlay'
import KioskExperienceDetail from '@/components/kiosk/KioskExperienceDetail'
import { useState } from 'react'
import type { KioskExperience, KioskCategory } from '@/app/kiosk/KioskHomePage'

interface KioskCategoryPageProps {
  experiences: KioskExperience[]
  categoryName: string
  categorySlug: string
}

export default function KioskCategoryPage({ experiences, categoryName, categorySlug }: KioskCategoryPageProps) {
  const router = useRouter()
  const [selectedExperience, setSelectedExperience] = useState<KioskExperience | null>(null)

  useIdleTimer(() => {
    router.push('/kiosk')
  }, 90000)

  const category: KioskCategory = {
    id: '',
    slug: categorySlug,
    name: categoryName,
    icon: '',
    description: null,
    experience_count: experiences.length,
  }

  return (
    <>
      <KioskCategoryBrowser
        category={category}
        experiences={experiences}
        onOpenExperience={(exp) => setSelectedExperience(exp)}
        onBack={() => router.push('/kiosk')}
      />
      {selectedExperience && (
        <KioskDetailOverlay
          isExiting={false}
          onClose={() => setSelectedExperience(null)}
        >
          <KioskExperienceDetail experience={selectedExperience} />
        </KioskDetailOverlay>
      )}
    </>
  )
}
