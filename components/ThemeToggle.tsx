'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations('common')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="h-11 w-11 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10"
        aria-label={t('themeToggle')}
      >
        <Sun className="h-[18px] w-[18px] text-gray-400" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="h-11 w-11 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
      aria-label={t('switchToMode', { mode: resolvedTheme === 'dark' ? t('lightMode') : t('darkMode') })}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[18px] w-[18px] text-amber-400" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-gray-600" />
      )}
    </button>
  )
}
