'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Maximize } from 'lucide-react'

interface Resolution {
  name: string
  width: number
  height: number
  icon: 'monitor' | 'smartphone' | 'maximize'
}

const RESOLUTIONS: Resolution[] = [
  { name: 'Full HD (1920x1080)', width: 1920, height: 1080, icon: 'monitor' },
  { name: 'HD (1366x768)', width: 1366, height: 768, icon: 'monitor' },
  { name: 'Portrait (1080x1920)', width: 1080, height: 1920, icon: 'smartphone' },
  { name: '4K (3840x2160)', width: 3840, height: 2160, icon: 'maximize' },
]

export default function KioskResolutionPicker() {
  const [isVisible, setIsVisible] = useState(true)
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(RESOLUTIONS[0])
  const [zoom, setZoom] = useState(100)

  // Only show in development
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDev) return

    // Calculate zoom to fit resolution in viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const zoomWidth = (viewportWidth / selectedResolution.width) * 100
    const zoomHeight = (viewportHeight / selectedResolution.height) * 100
    const calculatedZoom = Math.min(zoomWidth, zoomHeight, 100)
    setZoom(Math.floor(calculatedZoom))
  }, [selectedResolution, isDev])

  if (!isDev) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow-2xl transition-all flex items-center gap-2 font-semibold"
        style={{ fontSize: '14px' }}
      >
        <Monitor size={20} />
        {isVisible ? 'Hide' : 'Resolution Picker'}
      </button>

      {/* Resolution Picker Panel */}
      {isVisible && (
        <div className="fixed top-4 right-4 z-[9999] bg-gray-900 text-white rounded-xl shadow-2xl border-2 border-purple-500 overflow-hidden" style={{ width: '320px' }}>
          {/* Header */}
          <div className="bg-purple-600 px-4 py-3 font-bold text-lg flex items-center justify-between">
            <span>Kiosk Resolution</span>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:bg-purple-700 rounded px-2 py-1 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Current Resolution Info */}
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Current Resolution</div>
              <div className="font-bold text-purple-400">{selectedResolution.name}</div>
              <div className="text-sm text-gray-300 mt-1">
                {selectedResolution.width} × {selectedResolution.height}
              </div>
            </div>

            {/* Suggested Zoom */}
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
              <div className="text-xs text-yellow-400 mb-1">Suggested Browser Zoom</div>
              <div className="font-bold text-yellow-300 text-2xl">{zoom}%</div>
              <div className="text-xs text-yellow-200 mt-1">
                Set your browser zoom to {zoom}% to see the full kiosk view
              </div>
            </div>

            {/* Resolution Buttons */}
            <div className="space-y-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Select Resolution</div>
              {RESOLUTIONS.map((resolution) => {
                const Icon = resolution.icon === 'monitor' ? Monitor : resolution.icon === 'smartphone' ? Smartphone : Maximize
                return (
                  <button
                    key={resolution.name}
                    onClick={() => setSelectedResolution(resolution)}
                    className={`w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedResolution.name === resolution.name
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">{resolution.name.split('(')[0]}</div>
                      <div className="text-xs opacity-70">{resolution.width} × {resolution.height}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3">
              <div className="text-xs text-blue-300 leading-relaxed">
                <strong>How to use:</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Select a resolution above</li>
                  <li>Set browser zoom to {zoom}%</li>
                  <li>Press F11 for fullscreen (optional)</li>
                  <li>Test the kiosk interface</li>
                </ol>
              </div>
            </div>

            {/* Actual Viewport Info */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-800">
              Viewport: {window.innerWidth} × {window.innerHeight}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
