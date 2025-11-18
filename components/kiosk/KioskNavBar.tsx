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
      {/* Fixed Corner Navigation Buttons - Kiosk Optimized */}
      {/* Home Button - Top Left (200x80px MEGA button) */}
      <Link
        href="/kiosk"
        className="fixed z-50 flex items-center bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full transition-all hover:scale-105 group kiosk-shadow-xl border-2 border-white/20 kiosk-touch-lg"
        style={{
          top: 'var(--kiosk-space-2xl)',
          left: 'var(--kiosk-space-2xl)',
          gap: 'var(--kiosk-space-md)',
          padding: `var(--kiosk-space-lg) var(--kiosk-space-2xl)`,
          minWidth: '200px',
          minHeight: '80px'
        }}
      >
        <Home className="text-white group-hover:scale-110 transition-transform" size={48} strokeWidth={2.5} />
        <span className="font-bold text-white" style={{ fontSize: 'var(--kiosk-text-lg)' }}>
          Home
        </span>
      </Link>

      {/* Language Button - Top Right (200x80px MEGA button) */}
      <button
        onClick={() => setShowLanguages(!showLanguages)}
        className="fixed z-50 flex items-center bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full transition-all hover:scale-105 group kiosk-shadow-xl border-2 border-white/20 kiosk-touch-lg"
        style={{
          top: 'var(--kiosk-space-2xl)',
          right: 'var(--kiosk-space-2xl)',
          gap: 'var(--kiosk-space-md)',
          padding: `var(--kiosk-space-lg) var(--kiosk-space-2xl)`,
          minWidth: '220px',
          minHeight: '80px'
        }}
      >
        <Globe className="text-white group-hover:rotate-12 transition-transform" size={48} strokeWidth={2.5} />
        <span className="font-bold text-white" style={{ fontSize: 'var(--kiosk-text-lg)' }}>
          Language
        </span>
      </button>

      {/* Language Selection Modal - Kiosk Optimized */}
      {showLanguages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg kiosk-p-4xl"
          onClick={() => setShowLanguages(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-xl rounded-3xl border-2 border-white/20 kiosk-shadow-xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 'var(--kiosk-space-5xl)',
              maxWidth: '1000px',
              width: '90%'
            }}
          >
            <h2
              className="font-black text-white text-center"
              style={{
                fontSize: 'var(--kiosk-text-4xl)',
                marginBottom: 'var(--kiosk-space-4xl)'
              }}
            >
              Select Language / Seleccionar idioma
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: 'var(--kiosk-space-2xl)' }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    // TODO: Implement language switching
                    console.log('Selected language:', lang.code)
                    setShowLanguages(false)
                  }}
                  className="flex items-center bg-white/20 hover:bg-white/35 backdrop-blur-md rounded-2xl transition-all hover:scale-105 group kiosk-touch-lg kiosk-shadow-md"
                  style={{
                    gap: 'var(--kiosk-space-lg)',
                    padding: 'var(--kiosk-space-2xl)'
                  }}
                >
                  <span style={{ fontSize: '72px' }}>{lang.flag}</span>
                  <div className="text-left">
                    <p
                      className="font-bold text-white group-hover:translate-x-2 transition-transform"
                      style={{ fontSize: 'var(--kiosk-text-xl)' }}
                    >
                      {lang.name}
                    </p>
                    <p
                      className="text-white/70"
                      style={{ fontSize: 'var(--kiosk-text-base)' }}
                    >
                      {lang.code.toUpperCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center" style={{ marginTop: 'var(--kiosk-space-4xl)' }}>
              <p
                className="text-white/60"
                style={{ fontSize: 'var(--kiosk-text-base)' }}
              >
                Multi-language support coming soon
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
