'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10"
        aria-label="Toggle theme"
      >
        <Sun className="h-[18px] w-[18px] text-gray-400" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[18px] w-[18px] text-amber-400" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-gray-600" />
      )}
    </button>
  )
}
