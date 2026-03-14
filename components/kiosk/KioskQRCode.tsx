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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg kiosk-animate-fade-in" role="dialog" aria-modal="true" aria-label="QR code to save on your phone">
      <div
        className="bg-white mx-auto kiosk-shadow-xl relative kiosk-animate-slide-up overflow-y-auto"
        style={{
          padding: 'var(--kiosk-sp-48)',
          maxWidth: 'calc(800px * var(--kiosk-scale))',
          maxHeight: '90vh',
          width: '90%',
          borderRadius: 'var(--kiosk-radius-lg)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close QR code"
          className="absolute bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          style={{
            top: 'var(--kiosk-sp-24)',
            right: 'var(--kiosk-sp-24)',
            padding: 'var(--kiosk-sp-16)',
            zIndex: 10
          }}
        >
          <X className="text-gray-600" size={32} strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kiosk-sp-32)' }}>
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                background: 'var(--kiosk-gradient-ocean)',
                padding: 'var(--kiosk-sp-24)'
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
                fontSize: 'var(--kiosk-text-48)',
                marginBottom: 'var(--kiosk-sp-16)'
              }}
            >
              Save to Your Phone
            </h2>
            <p
              className="text-gray-600"
              style={{ fontSize: 'var(--kiosk-text-24)' }}
            >
              Scan this QR code to view on your device
            </p>
          </div>

          {/* QR Code */}
          <div
            className="flex justify-center bg-gray-50 mx-auto"
            style={{
              padding: 'var(--kiosk-sp-32)',
              borderRadius: 'var(--kiosk-radius-md)',
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
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300"
            style={{
              padding: 'var(--kiosk-sp-24)',
              borderRadius: 'var(--kiosk-radius-md)',
            }}
          >
            <p
              className="font-semibold text-gray-900 line-clamp-2"
              style={{ fontSize: 'var(--kiosk-text-24)' }}
            >
              {title}
            </p>
          </div>

          {/* Instructions */}
          <div
            className="text-left bg-blue-50 border-2 border-blue-300"
            style={{
              padding: 'var(--kiosk-sp-24)',
              borderRadius: 'var(--kiosk-radius-md)',
            }}
          >
            <p
              className="font-bold text-blue-900"
              style={{
                fontSize: 'var(--kiosk-text-24)',
                marginBottom: 'var(--kiosk-sp-16)'
              }}
            >
              How to scan:
            </p>
            <ol
              className="text-blue-800 list-decimal list-inside"
              style={{ fontSize: 'var(--kiosk-text-20)', display: 'flex', flexDirection: 'column', gap: 'var(--kiosk-sp-8)' }}
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
