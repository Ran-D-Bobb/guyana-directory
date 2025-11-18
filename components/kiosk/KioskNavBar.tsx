'use client'

import Link from 'next/link'
import { Home, Globe } from 'lucide-react'
import { useState } from 'react'
import { useKioskConfig } from './KioskLayoutOptimized'

export default function KioskNavBar() {
  const [showLanguages, setShowLanguages] = useState(false)
  const kioskConfig = useKioskConfig()

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇾' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  return (
    <>
      {/* Static Header - matching reference design */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 md:p-10">
        <div className="flex items-center gap-4 text-white">
          {/* Logo SVG */}
          <div className="h-8 w-8">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
            </svg>
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      {showLanguages && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-lg"
          style={{ background: 'rgba(16, 34, 16, 0.95)' }}
          onClick={() => setShowLanguages(false)}
        >
          <div
            className="rounded-3xl kiosk-shadow-xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 'var(--kiosk-space-5xl)',
              maxWidth: '1000px',
              width: '90%',
              background: 'var(--kiosk-bg-overlay)',
              border: '2px solid rgba(59, 84, 59, 1)'
            }}
          >
            <h2
              className="font-black text-center"
              style={{
                fontSize: 'var(--kiosk-text-4xl)',
                marginBottom: 'var(--kiosk-space-4xl)',
                color: 'var(--kiosk-text-primary)'
              }}
            >
              Select Language
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: 'var(--kiosk-space-2xl)' }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    console.log('Selected language:', lang.code)
                    setShowLanguages(false)
                  }}
                  className="flex items-center backdrop-blur-md rounded-2xl transition-all hover:scale-105 group kiosk-touch-lg kiosk-shadow-md"
                  style={{
                    gap: 'var(--kiosk-space-lg)',
                    padding: 'var(--kiosk-space-2xl)',
                    background: 'var(--kiosk-bg-elevated)',
                    border: '2px solid rgba(59, 84, 59, 1)'
                  }}
                >
                  <span style={{ fontSize: '72px' }}>{lang.flag}</span>
                  <div className="text-left">
                    <p
                      className="font-bold group-hover:translate-x-2 transition-transform"
                      style={{
                        fontSize: 'var(--kiosk-text-xl)',
                        color: 'var(--kiosk-text-primary)'
                      }}
                    >
                      {lang.name}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--kiosk-text-base)',
                        color: 'var(--kiosk-text-tertiary)'
                      }}
                    >
                      {lang.code.toUpperCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
