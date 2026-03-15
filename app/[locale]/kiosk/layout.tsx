import { ReactNode } from 'react'
import KioskLayoutOptimized from '@/components/kiosk/KioskLayoutOptimized'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tourism Kiosk - Discover Guyana',
  description: 'Interactive tourism kiosk showcasing the best experiences in Guyana',
}

export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <KioskLayoutOptimized>
      <div className="relative min-h-screen overflow-hidden kiosk-no-select kiosk-burn-protect">
        {children}
      </div>
    </KioskLayoutOptimized>
  )
}
