'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, Clock, Users, ChevronLeft, ChevronRight, Sparkles, Hand } from 'lucide-react'
import { useKioskConfig } from './KioskLayoutOptimized'

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
  const [isPulsing, setIsPulsing] = useState(true)
  const kioskConfig = useKioskConfig()

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % experiences.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [experiences.length])

  // Pulsing animation for tap button
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing((prev) => !prev)
    }, 2000)

    return () => clearInterval(pulseInterval)
  }, [])

  const currentExperience = experiences[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'challenging':
        return 'bg-orange-500'
      case 'difficult':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 transition-all duration-1000 ease-out">
        {currentExperience.image_url ? (
          <Image
            src={currentExperience.image_url}
            alt={currentExperience.name}
            fill
            className="object-cover animate-[kenBurns_20s_ease-in-out_infinite]"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

      {/* Navigation Arrows - Kiosk Optimized */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all rounded-full group kiosk-touch-md kiosk-shadow-md"
        style={{
          left: 'var(--kiosk-space-2xl)',
          padding: 'var(--kiosk-space-md)'
        }}
      >
        <ChevronLeft className="text-white group-hover:scale-110 transition-transform" size={64} strokeWidth={2.5} />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all rounded-full group kiosk-touch-md kiosk-shadow-md"
        style={{
          right: 'var(--kiosk-space-2xl)',
          padding: 'var(--kiosk-space-md)'
        }}
      >
        <ChevronRight className="text-white group-hover:scale-110 transition-transform" size={64} strokeWidth={2.5} />
      </button>

      {/* Content Overlay - Kiosk Optimized */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-between"
        style={{
          padding: 'var(--kiosk-space-4xl)',
          paddingTop: `calc(var(--kiosk-nav-height) + var(--kiosk-space-3xl))`,
          paddingBottom: `calc(var(--kiosk-space-6xl) + 40px)` // Extra space for button
        }}
      >
        {/* Top Section - Branding - Kiosk Optimized */}
        <div className="text-center kiosk-space-lg kiosk-animate-fade-in">
          <div
            className="flex items-center justify-center mb-4"
            style={{ gap: 'var(--kiosk-space-md)' }}
          >
            <Sparkles className="text-yellow-400 animate-pulse" size={kioskConfig.resolution === '4k' ? 96 : 64} strokeWidth={2} />
            <h1
              className="font-black text-white tracking-tight"
              style={{ fontSize: 'var(--kiosk-text-hero)' }}
            >
              Discover Guyana
            </h1>
            <Sparkles className="text-yellow-400 animate-pulse" size={kioskConfig.resolution === '4k' ? 96 : 64} strokeWidth={2} />
          </div>
          <p
            className="text-white/90 font-light"
            style={{ fontSize: 'var(--kiosk-text-lg)' }}
          >
            Unforgettable Adventures Await
          </p>
        </div>

        {/* Middle Section - Experience Info - Kiosk Optimized */}
        <div className="max-w-6xl mx-auto text-center kiosk-space-3xl kiosk-animate-slide-up">
          {/* Category Badge */}
          <div
            className="inline-flex items-center kiosk-gradient-ocean rounded-full"
            style={{
              padding: `var(--kiosk-space-md) var(--kiosk-space-2xl)`,
              marginBottom: 'var(--kiosk-space-lg)'
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: 'var(--kiosk-text-base)' }}>
              {currentExperience.category_name}
            </span>
          </div>

          {/* Experience Name */}
          <h2
            className="font-black text-white leading-tight drop-shadow-2xl"
            style={{
              fontSize: 'var(--kiosk-text-hero)',
              marginBottom: 'var(--kiosk-space-xl)'
            }}
          >
            {currentExperience.name}
          </h2>

          {/* Description */}
          <p
            className="text-white/95 max-w-4xl mx-auto leading-relaxed line-clamp-3"
            style={{
              fontSize: 'var(--kiosk-text-lg)',
              marginBottom: 'var(--kiosk-space-2xl)'
            }}
          >
            {currentExperience.description?.substring(0, 200)}...
          </p>

          {/* Stats Row - Responsive cards */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-8 flex-wrap">
            {/* Rating */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 fill-yellow-400" />
              <div className="text-left">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.rating.toFixed(1)}</div>
                <div className="text-xs sm:text-sm text-white/70">{currentExperience.review_count} reviews</div>
              </div>
            </div>

            {/* Duration */}
            {currentExperience.duration && (
              <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400" />
                <div className="text-left">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.duration}</div>
                  <div className="text-xs sm:text-sm text-white/70">Duration</div>
                </div>
              </div>
            )}

            {/* Difficulty */}
            {currentExperience.difficulty_level && (
              <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full ${getDifficultyColor(currentExperience.difficulty_level)}`} />
                <div className="text-left">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white capitalize">{currentExperience.difficulty_level}</div>
                  <div className="text-xs sm:text-sm text-white/70">Difficulty</div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl">
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-emerald-400">GYD</span>
              <div className="text-left">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{currentExperience.price_from.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-white/70">From</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - CTA Button - Kiosk Optimized */}
        <div className="text-center kiosk-space-2xl">
          <button
            onClick={onTapToExplore}
            className="kiosk-btn-primary"
            tabIndex={0}
            aria-label="Tap to explore tourism experiences"
            data-testid="tap-to-explore-button"
            style={{
              marginBottom: 'var(--kiosk-space-2xl)'
            }}
          >
            <Hand size={40} strokeWidth={2.5} />
            <span style={{ position: 'relative', zIndex: 1 }}>TAP TO EXPLORE</span>
            <Sparkles size={40} strokeWidth={2.5} />
          </button>

          {/* Progress Dots - Kiosk Optimized (32px for active indicator) */}
          <div
            className="flex justify-center"
            style={{ gap: 'var(--kiosk-space-md)' }}
          >
            {experiences.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  transition-all duration-300 rounded-full
                  ${index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/40 hover:bg-white/70'
                  }
                `}
                style={{
                  width: index === currentIndex ? '64px' : '16px',
                  height: '16px'
                }}
              />
            ))}
          </div>

          <p
            className="text-white/70 animate-pulse"
            style={{
              fontSize: 'var(--kiosk-text-base)',
              marginTop: 'var(--kiosk-space-lg)'
            }}
          >
            Touch anywhere to discover amazing experiences
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.1) translate(-2%, -2%);
          }
          100% {
            transform: scale(1) translate(0, 0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }
        .animate-bounce-slow {
          animation: slide-up 1s ease-out 0.6s both;
        }
      `}</style>
    </div>
  )
}
