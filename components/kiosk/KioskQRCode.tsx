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
  useKioskConfig()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg kiosk-animate-fade-in">
      <div
        className="bg-white rounded-3xl mx-auto kiosk-shadow-xl relative kiosk-animate-slide-up overflow-y-auto"
        style={{
          padding: '48px',
          maxWidth: '800px',
          maxHeight: '90vh',
          width: '90%'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          style={{
            top: '24px',
            right: '24px',
            padding: '16px',
            zIndex: 10
          }}
        >
          <X className="text-gray-600" size={32} strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                background: 'var(--kiosk-gradient-ocean)',
                padding: '24px'
              }}
            >
              <Smartphone className="text-white" size={64} strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2
              className="font-black text-gray-900"
              style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}
            >
              Save to Your Phone
            </h2>
            <p
              className="text-gray-600"
              style={{ fontSize: '24px' }}
            >
              Scan this QR code to view on your device
            </p>
          </div>

          {/* QR Code */}
          <div
            className="flex justify-center bg-gray-50 rounded-2xl mx-auto"
            style={{
              padding: '32px'
            }}
          >
            <QRCodeSVG
              value={url}
              size={300}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Experience Title */}
          <div
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl"
            style={{
              padding: '24px'
            }}
          >
            <p
              className="font-semibold text-gray-900 line-clamp-2"
              style={{ fontSize: '24px' }}
            >
              {title}
            </p>
          </div>

          {/* Instructions */}
          <div
            className="text-left bg-blue-50 rounded-2xl border-2 border-blue-300"
            style={{ padding: '24px' }}
          >
            <p
              className="font-bold text-blue-900"
              style={{
                fontSize: '24px',
                marginBottom: '16px'
              }}
            >
              How to scan:
            </p>
            <ol
              className="text-blue-800 list-decimal list-inside"
              style={{ fontSize: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <li>Open your phone&apos;s camera app</li>
              <li>Point it at the QR code above</li>
              <li>Tap the notification to open the link</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
