'use client'

import { useState } from 'react'
import { Share2, Check, Link2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text: string
  url: string
  variant?: 'icon' | 'mobile-action'
}

export function ShareButton({ title, text, url, variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : url

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
      } catch (err) {
        // User cancelled or share failed — fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl)
        }
      }
    } else {
      await copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (variant === 'mobile-action') {
    return (
      <button onClick={handleShare} className="flex flex-col items-center gap-1.5 min-w-[52px] group">
        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--jungle-100))] flex items-center justify-center group-active:scale-95 transition-transform">
          {copied ? (
            <Check className="w-5 h-5 text-emerald-600" />
          ) : (
            <Share2 className="w-5 h-5 text-[hsl(var(--jungle-600))]" />
          )}
        </div>
        <span className="text-[11px] font-medium text-[hsl(var(--jungle-700))]">
          {copied ? 'Copied!' : 'Share'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--jungle-600))] hover:bg-[hsl(var(--jungle-50))] transition-colors"
      aria-label="Share this business"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-600">Link copied!</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </button>
  )
}
