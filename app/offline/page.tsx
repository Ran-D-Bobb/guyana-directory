'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home, Compass } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--jungle-50))] via-white to-[hsl(var(--gold-50))] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-[hsl(var(--jungle-100))] rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-[hsl(var(--jungle-500))]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[hsl(var(--gold-400))] rounded-full flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl text-[hsl(var(--jungle-800))] mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-[hsl(var(--jungle-600))] mb-8 text-lg">
          It looks like you&apos;re not connected to the internet. Some features may be limited, but you can still browse previously visited pages.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[hsl(var(--jungle-200))] hover:border-[hsl(var(--jungle-300))] text-[hsl(var(--jungle-700))] font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-4 bg-white/60 rounded-xl border border-[hsl(var(--jungle-100))]">
          <h2 className="font-semibold text-[hsl(var(--jungle-700))] mb-2">
            While you&apos;re offline:
          </h2>
          <ul className="text-sm text-[hsl(var(--jungle-600))] space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              Previously viewed pages may still be available
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              Search and new listings require a connection
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              Check your WiFi or mobile data settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
