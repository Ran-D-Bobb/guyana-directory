'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home, Compass } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function OfflinePage() {
  const t = useTranslations('offline')
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--jungle-50))] via-white to-[hsl(var(--gold-50))] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-[hsl(var(--jungle-100))] dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-[hsl(var(--jungle-500))] dark:text-emerald-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[hsl(var(--gold-400))] rounded-full flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl text-[hsl(var(--jungle-800))] dark:text-gray-100 mb-4">
          {t('title')}
        </h1>

        {/* Description */}
        <p className="text-[hsl(var(--jungle-600))] dark:text-gray-300 mb-8 text-lg">
          {t('body')}
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-700))] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t('tryAgain')}
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-[hsl(var(--jungle-200))] dark:border-gray-700 hover:border-[hsl(var(--jungle-300))] dark:hover:border-gray-600 text-[hsl(var(--jungle-700))] dark:text-gray-200 font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            {t('goHome')}
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-[hsl(var(--jungle-100))] dark:border-gray-700">
          <h2 className="font-semibold text-[hsl(var(--jungle-700))] dark:text-gray-200 mb-2">
            {t('whileOffline')}
          </h2>
          <ul className="text-sm text-[hsl(var(--jungle-600))] dark:text-gray-400 space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              {t('hint1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              {t('hint2')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--gold-500))]">•</span>
              {t('hint3')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
