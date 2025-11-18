'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Smartphone, X } from 'lucide-react'
import { useKioskConfig } from './KioskLayoutOptimized'

interface KioskQRCodeProps {
  url: string
  title: string
  onClose: () => void
}

export default function KioskQRCode({ url, title, onClose }: KioskQRCodeProps) {
  const kioskConfig = useKioskConfig()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg kiosk-animate-fade-in">
      <div
        className="bg-white rounded-3xl mx-auto kiosk-shadow-xl relative kiosk-animate-slide-up"
        style={{
          padding: 'var(--kiosk-space-5xl)',
          maxWidth: '1200px',
          width: '90%'
        }}
      >
        {/* Close Button - MEGA size for easy touch */}
        <button
          onClick={onClose}
          className="absolute bg-gray-100 hover:bg-gray-200 rounded-full transition-colors kiosk-touch-md"
          style={{
            top: 'var(--kiosk-space-2xl)',
            right: 'var(--kiosk-space-2xl)',
            padding: 'var(--kiosk-space-lg)'
          }}
        >
          <X className="text-gray-600" size={48} strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="text-center kiosk-space-3xl">
          {/* Icon */}
          <div className="flex justify-center" style={{ marginBottom: 'var(--kiosk-space-2xl)' }}>
            <div
              className="kiosk-gradient-ocean rounded-full kiosk-icon-lg flex items-center justify-center"
              style={{ padding: 'var(--kiosk-space-xl)' }}
            >
              <Smartphone className="text-white" size={96} strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 'var(--kiosk-space-3xl)' }}>
            <h2
              className="font-black text-gray-900"
              style={{
                fontSize: 'var(--kiosk-text-4xl)',
                marginBottom: 'var(--kiosk-space-md)'
              }}
            >
              Save to Your Phone
            </h2>
            <p
              className="text-gray-600"
              style={{ fontSize: 'var(--kiosk-text-lg)' }}
            >
              Scan this QR code to view on your device
            </p>
          </div>

          {/* QR Code - 400x400px (scannable from 3 feet) */}
          <div
            className="flex justify-center bg-gray-50 rounded-2xl kiosk-qr-container"
            style={{
              padding: 'var(--kiosk-space-3xl)',
              marginBottom: 'var(--kiosk-space-3xl)'
            }}
          >
            <QRCodeSVG
              value={url}
              size={kioskConfig.qrCodeSize}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Experience Title */}
          <div
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-4 border-emerald-300 rounded-2xl"
            style={{
              padding: 'var(--kiosk-space-2xl)',
              marginBottom: 'var(--kiosk-space-3xl)'
            }}
          >
            <p
              className="font-semibold text-gray-900 line-clamp-2"
              style={{ fontSize: 'var(--kiosk-text-xl)' }}
            >
              {title}
            </p>
          </div>

          {/* Instructions - Large, clear text (48px) */}
          <div
            className="text-left bg-blue-50 rounded-2xl border-4 border-blue-300 kiosk-space-lg"
            style={{ padding: 'var(--kiosk-space-2xl)' }}
          >
            <p
              className="font-bold text-blue-900"
              style={{
                fontSize: 'var(--kiosk-text-xl)',
                marginBottom: 'var(--kiosk-space-lg)'
              }}
            >
              How to scan:
            </p>
            <ol
              className="text-blue-800 list-decimal list-inside kiosk-space-md"
              style={{ fontSize: 'var(--kiosk-text-lg)' }}
            >
              <li>Open your phone's camera app</li>
              <li>Point it at the QR code above</li>
              <li>Tap the notification to open the link</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
