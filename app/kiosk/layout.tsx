import { ReactNode } from 'react'
import KioskNavBar from '@/components/kiosk/KioskNavBar'
import KioskLayoutOptimized from '@/components/kiosk/KioskLayoutOptimized'
import KioskResolutionPicker from '@/components/kiosk/KioskResolutionPicker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tourism Kiosk - Discover Guyana',
  description: 'Interactive tourism kiosk showcasing the best experiences in Guyana',
}

export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <KioskLayoutOptimized showDebugInfo={process.env.NODE_ENV === 'development'}>
      <div className="relative min-h-screen overflow-hidden">
        {children}
        <KioskNavBar />
        <KioskResolutionPicker />
      </div>
    </KioskLayoutOptimized>
  )
}
