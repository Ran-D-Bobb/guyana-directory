'use client'

import { useRouter } from 'next/navigation'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import KioskExperienceDetail from '@/components/kiosk/KioskExperienceDetail'
import type { KioskExperience } from '@/app/kiosk/KioskHomePage'

interface KioskExperiencePageProps {
  experience: KioskExperience
}

export default function KioskExperiencePage({ experience }: KioskExperiencePageProps) {
  const router = useRouter()

  useIdleTimer(() => {
    router.push('/kiosk')
  }, 120000)

  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--kiosk-bg-cinema)', position: 'relative' }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/kiosk')}
        className="kiosk-glass"
        style={{
          position: 'absolute',
          top: 'var(--kiosk-sp-24)',
          left: 'var(--kiosk-sp-32)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--kiosk-sp-8)',
          padding: 'var(--kiosk-sp-12) var(--kiosk-sp-20)',
          cursor: 'pointer',
          border: '1px solid var(--kiosk-glass-border)',
          color: 'white',
          fontSize: 'var(--kiosk-text-18)',
          fontWeight: 600,
          zIndex: 50,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Kiosk
      </button>

      <KioskExperienceDetail experience={experience} />
    </div>
  )
}
