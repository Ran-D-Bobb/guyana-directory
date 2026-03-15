'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface KioskMediaProps {
  /** Video URL (MP4/WebM) — preferred if present */
  videoUrl?: string | null
  /** Fallback image URL */
  imageUrl?: string | null
  /** Poster / thumbnail for video */
  posterUrl?: string | null
  /** Alt text for accessibility */
  alt: string
  /** Image sizes hint for Next.js Image optimization */
  sizes?: string
  /** Apply Ken Burns animation to images (ignored for video) */
  kenBurns?: boolean
  /** Ken Burns duration in seconds */
  kenBurnsDuration?: number
  /** Custom Ken Burns keyframes (from/to transforms) */
  kenBurnsStyle?: { from: string; to: string }
  /** Whether to prioritize loading */
  priority?: boolean
  /** Callback when video naturally ends */
  onVideoEnd?: () => void
  /** Extra className for the media element */
  className?: string
  /** Extra inline styles for the media element */
  style?: React.CSSProperties
}

/**
 * Unified media component for kiosk screens.
 * Renders <video> if videoUrl is available, otherwise <Image>.
 * Videos autoplay muted, loop, and play inline (kiosk context).
 */
export default function KioskMedia({
  videoUrl,
  imageUrl,
  posterUrl,
  alt,
  sizes = '100vw',
  kenBurns = false,
  kenBurnsDuration = 12,
  kenBurnsStyle,
  priority = false,
  onVideoEnd,
  className = '',
  style,
}: KioskMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  // Restart video when src changes
  useEffect(() => {
    if (videoUrl && videoRef.current && !videoError) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {
        // Autoplay blocked — fall back to image
        setVideoError(true)
      })
    }
  }, [videoUrl, videoError])

  // Handle video end callback
  useEffect(() => {
    const video = videoRef.current
    if (!video || !onVideoEnd) return

    const handleEnded = () => onVideoEnd()
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [onVideoEnd])

  const hasVideo = videoUrl && !videoError
  const hasImage = imageUrl

  // Determine Ken Burns animation style
  const kenBurnsAnimation = kenBurns && !hasVideo
    ? {
        animation: `kiosk-ken-burns-slow ${kenBurnsDuration}s ease-in-out forwards`,
        ...(kenBurnsStyle ? {
          '--kb-from': kenBurnsStyle.from,
          '--kb-to': kenBurnsStyle.to,
        } as React.CSSProperties : {}),
      }
    : undefined

  // Video rendering
  if (hasVideo) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || imageUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        className={`${className}`}
        onError={() => setVideoError(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
      />
    )
  }

  // Image rendering
  if (hasImage) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        sizes={sizes}
        priority={priority}
        style={{
          ...kenBurnsAnimation,
          ...style,
        }}
      />
    )
  }

  // Fallback gradient
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--kiosk-gradient-tropical)',
        animation: 'kiosk-gradient-shift 8s ease-in-out infinite',
        backgroundSize: '200% 200%',
      }}
    />
  )
}
