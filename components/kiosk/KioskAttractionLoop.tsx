'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Pause, Play, Eye } from 'lucide-react'
import { useKioskConfig } from './KioskLayoutOptimized'
import { useRouter } from 'next/navigation'

interface Experience {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  duration: string | null
  price_from: number
  category_name: string
  difficulty_level: string | null
}

interface KioskAttractionLoopProps {
  experiences: Experience[]
  onTapToExplore: () => void
}

export default function KioskAttractionLoop({ experiences, onTapToExplore }: KioskAttractionLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  useKioskConfig()

  const SLIDE_DURATION = 8000 // 8 seconds per slide

  // Auto-rotate and progress bar
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0)
      return
    }

    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / SLIDE_DURATION) * 100

      if (newProgress >= 100) {
        setCurrentIndex((prev) => (prev + 1) % experiences.length)
        setProgress(0)
      } else {
        setProgress(newProgress)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [currentIndex, isPlaying, experiences.length])

  const currentExperience = experiences[currentIndex]

  // Show error state if no experiences
  if (!currentExperience) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center" style={{ background: 'var(--kiosk-bg-base)' }}>
        <div className="text-center" style={{ padding: 'var(--kiosk-space-4xl)' }}>
          <h1 className="font-black" style={{ fontSize: 'var(--kiosk-text-hero)', color: 'var(--kiosk-text-primary)', marginBottom: 'var(--kiosk-space-2xl)' }}>
            No Experiences Available
          </h1>
          <p style={{ fontSize: 'var(--kiosk-text-lg)', color: 'var(--kiosk-text-secondary)' }}>
            Please check back later for amazing tourism experiences in Guyana.
          </p>
        </div>
      </div>
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length)
    setProgress(0)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
    setProgress(0)
  }

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  // Get next 4 experiences for the carousel
  const getUpcomingExperiences = () => {
    const upcoming = []
    for (let i = 1; i <= 4; i++) {
      const index = (currentIndex + i) % experiences.length
      upcoming.push(experiences[index])
    }
    return upcoming
  }

  const upcomingExperiences = getUpcomingExperiences()

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Full-Screen Background Image */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-all duration-1000 ease-out animate-ken-burns"
          style={{
            backgroundImage: currentExperience.image_url
              ? `url('${currentExperience.image_url}')`
              : 'linear-gradient(135deg, #102210 0%, #115e59 50%, #0d9488 100%)',
            animation: 'kenBurns 15s ease-in-out infinite alternate'
          }}
        >
          {!currentExperience.image_url && (
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Overlay */}
      <main className="relative z-10 flex h-full flex-col">
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Text Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center text-white">
          {/* Text Overlay Content */}
          <div className="mb-12 max-w-4xl">
            <h2 className="text-4xl font-extrabold md:text-6xl drop-shadow-lg">{currentExperience.name}</h2>
            <p className="mt-4 text-lg md:text-xl font-medium drop-shadow-md" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              {currentExperience.description?.substring(0, 250)}{currentExperience.description && currentExperience.description.length > 250 ? '...' : ''}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-8">
              <button
                onClick={() => {
                  console.log('Navigating to:', `/kiosk/experience/${currentExperience.slug}`)
                  console.log('Current experience:', currentExperience)
                  router.push(`/kiosk/experience/${currentExperience.slug}`)
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-xl transition-all hover:scale-105"
              >
                <Eye size={28} strokeWidth={2} />
                <span>View Details</span>
              </button>

              <button
                onClick={onTapToExplore}
                className="inline-flex items-center gap-3 px-8 py-4 backdrop-blur-md rounded-full font-bold text-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #13ec13 0%, #22c55e 50%, #10c010 100%)',
                  color: 'var(--kiosk-bg-base)',
                  boxShadow: '0 0 40px rgba(19, 236, 19, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <Sparkles size={28} strokeWidth={2} />
                <span>Explore All Categories</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slideshow Controls - Above Progress Bar */}
        <div className="relative flex flex-col items-center pb-8 md:pb-12 text-white">
          <div className="flex w-full max-w-md items-center justify-between">
            <button
              onClick={goToPrevious}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft size={32} strokeWidth={2} />
            </button>

            <button
              onClick={togglePlayPause}
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-primary text-background-dark transition-transform hover:scale-105"
              style={{ background: 'var(--kiosk-primary-500)' }}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
            </button>

            <button
              onClick={goToNext}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next slide"
            >
              <ChevronRight size={32} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="w-full rounded-full bg-white/20">
            <div
              className="h-1 rounded-full bg-white transition-all duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </main>

      {/* Horizontal Carousel for upcoming attractions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 hidden md:block" style={{ bottom: '15%' }}>
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-4 mx-auto">
            {upcomingExperiences.map((exp, idx) => (
              <div
                key={exp.id}
                onClick={() => {
                  setCurrentIndex((currentIndex + idx + 1) % experiences.length)
                  setProgress(0)
                }}
                className="flex w-64 flex-col gap-3 rounded-xl bg-black/40 p-3 backdrop-blur-sm transition-all hover:bg-black/60 cursor-pointer"
              >
                <div
                  className="h-32 w-full rounded-lg bg-cover bg-center"
                  style={{
                    backgroundImage: exp.image_url
                      ? `url('${exp.image_url}')`
                      : 'linear-gradient(135deg, #102210 0%, #115e59 50%, #0d9488 100%)'
                  }}
                ></div>
                <div className="flex flex-col">
                  <p className="text-base font-bold text-white line-clamp-1">{exp.name}</p>
                  <p className="text-sm font-normal text-white/70 line-clamp-2">
                    {exp.description?.substring(0, 80)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
