'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/youtube'

// Fallback videos if none are in the database
const fallbackVideos = [
  {
    video_url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Natural Paradise'
  }
]

export interface HeroVideo {
  id?: string
  title: string
  video_url: string
  thumbnail_url?: string | null
  display_order?: number
  is_active?: boolean
}

interface TourismHeroProps {
  totalExperiences?: number
  videos?: HeroVideo[]
}

export function TourismHero({ totalExperiences = 0, videos }: TourismHeroProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showVideoA, setShowVideoA] = useState(true) // Toggle between video A and B
  const [videoAIndex, setVideoAIndex] = useState(0)
  const [videoBIndex, setVideoBIndex] = useState(0) // Will be set properly after heroVideos is known
  const [hasLoaded, setHasLoaded] = useState(false)

  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)

  // Use provided videos or fallback
  const heroVideos = videos && videos.length > 0 ? videos : fallbackVideos
  const hasMultipleVideos = heroVideos.length > 1

  // Play video helper
  const playVideo = useCallback((videoEl: HTMLVideoElement | null) => {
    if (videoEl) {
      videoEl.play().catch(() => {})
    }
  }, [])

  // Handle initial video load
  const handleInitialLoad = useCallback(() => {
    if (!hasLoaded) {
      setHasLoaded(true)
      playVideo(videoARef.current)
    }
  }, [hasLoaded, playVideo])

  // Auto-cycle videos
  useEffect(() => {
    if (!hasLoaded) return

    const cycleInterval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % heroVideos.length

      if (showVideoA) {
        // Video A is showing, prepare B and fade to it
        setVideoBIndex(nextIndex)
        // Small delay to let src load
        setTimeout(() => {
          const videoB = videoBRef.current
          if (videoB) {
            videoB.currentTime = 0
            playVideo(videoB)
          }
          setShowVideoA(false)
        }, 100)
      } else {
        // Video B is showing, prepare A and fade to it
        setVideoAIndex(nextIndex)
        setTimeout(() => {
          const videoA = videoARef.current
          if (videoA) {
            videoA.currentTime = 0
            playVideo(videoA)
          }
          setShowVideoA(true)
        }, 100)
      }
      setActiveIndex(nextIndex)
    }, 10000)

    return () => clearInterval(cycleInterval)
  }, [hasLoaded, activeIndex, showVideoA, playVideo])

  // Manual video switch
  const switchToVideo = useCallback((index: number) => {
    if (index === activeIndex) return

    if (showVideoA) {
      setVideoBIndex(index)
      setTimeout(() => {
        const videoB = videoBRef.current
        if (videoB) {
          videoB.currentTime = 0
          playVideo(videoB)
        }
        setShowVideoA(false)
      }, 100)
    } else {
      setVideoAIndex(index)
      setTimeout(() => {
        const videoA = videoARef.current
        if (videoA) {
          videoA.currentTime = 0
          playVideo(videoA)
        }
        setShowVideoA(true)
      }, 100)
    }
    setActiveIndex(index)
  }, [activeIndex, showVideoA, playVideo])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }
    router.push(`/tourism?${params.toString()}`)
  }

  return (
    <section className="relative h-[75vh] min-h-[550px] max-h-[850px] overflow-hidden">
      {/* Background Container */}
      <div className="absolute inset-0 bg-emerald-900">
        {/* Video A */}
        {isYouTubeUrl(heroVideos[videoAIndex].video_url) ? (
          <iframe
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none ${
              showVideoA ? 'opacity-100' : 'opacity-0'
            }`}
            src={getYouTubeEmbedUrl(heroVideos[videoAIndex].video_url) || ''}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 0, width: '100vw', height: '56.25vw', minHeight: '100%', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            onLoad={() => { if (!hasLoaded) { setHasLoaded(true) } }}
          />
        ) : (
          <video
            ref={videoARef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              showVideoA ? 'opacity-100' : 'opacity-0'
            }`}
            src={heroVideos[videoAIndex].video_url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onCanPlayThrough={handleInitialLoad}
          />
        )}

        {/* Video B - only rendered if there are multiple videos to cycle */}
        {hasMultipleVideos && heroVideos[videoBIndex] && (
          isYouTubeUrl(heroVideos[videoBIndex].video_url) ? (
            <iframe
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none ${
                showVideoA ? 'opacity-0' : 'opacity-100'
              }`}
              src={getYouTubeEmbedUrl(heroVideos[videoBIndex].video_url) || ''}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 0, width: '100vw', height: '56.25vw', minHeight: '100%', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          ) : (
            <video
              ref={videoBRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                showVideoA ? 'opacity-0' : 'opacity-100'
              }`}
              src={heroVideos[videoBIndex].video_url}
              muted
              loop
              playsInline
              preload="auto"
              crossOrigin="anonymous"
            />
          )
        )}
      </div>

      {/* Gradient Overlays - minimal for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Video Indicators */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-sm rounded-full">
          {heroVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => switchToVideo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70 w-2'
              }`}
              aria-label={`Switch to video ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col justify-end pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Badge */}
        <div className="mb-4 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {totalExperiences > 0 ? `${totalExperiences} Unique Experiences` : 'Discover Adventures'}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-white font-bold leading-[1.1] mb-4 animate-fade-up delay-100">
          Explore the
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 animate-text-shimmer">
            Land of Many Waters
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8 animate-fade-up delay-200">
          From pristine rainforests to majestic waterfalls, discover unforgettable adventures in Guyana&apos;s untouched wilderness
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="animate-fade-up delay-300">
          <div className="relative max-w-2xl">
            <div className="absolute inset-0 bg-white/15 backdrop-blur-xl rounded-2xl" />
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiences, locations, activities..."
                className="w-full pl-14 pr-32 py-4 bg-transparent text-white placeholder-white/50 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Search
              </button>
            </div>
          </div>
        </form>

      </div>

    </section>
  )
}
