'use client'

import { useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

interface EventShareButtonProps {
  title: string
  slug: string
  variant?: 'default' | 'compact'
}

export function EventShareButton({ title, slug, variant = 'default' }: EventShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const url = `https://waypointgy.com/events/${slug}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled or share failed, fall back to copy
        await copyToClipboard()
      }
    } else {
      await copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        title="Share event"
      >
        {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all duration-200"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-600">Link Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="w-5 h-5" />
          <span>Share Event</span>
        </>
      )}
    </button>
  )
}
