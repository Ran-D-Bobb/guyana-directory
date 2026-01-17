'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Sparkles, ArrowRight, X, Play, Volume2, VolumeX } from 'lucide-react'
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/youtube'

// Timeline Event Type
export interface TimelineEvent {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  month: string
  month_short: string
  day: string
  location: string | null
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url: string | null
  gradient_colors: string
  accent_color: string
  category: string
  highlights: string[]
  display_order: number
  is_active: boolean
}

// Pre-computed stable positions to avoid hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 5, top: 12, duration: 3.2, delay: 0.1 },
  { left: 15, top: 45, duration: 4.1, delay: 1.2 },
  { left: 25, top: 78, duration: 3.5, delay: 0.5 },
  { left: 35, top: 23, duration: 4.5, delay: 1.8 },
  { left: 45, top: 67, duration: 3.8, delay: 0.3 },
  { left: 55, top: 34, duration: 4.2, delay: 1.5 },
  { left: 65, top: 89, duration: 3.3, delay: 0.7 },
  { left: 75, top: 56, duration: 4.8, delay: 1.1 },
  { left: 85, top: 15, duration: 3.6, delay: 0.9 },
  { left: 95, top: 42, duration: 4.3, delay: 1.4 },
  { left: 8, top: 58, duration: 3.9, delay: 0.2 },
  { left: 18, top: 81, duration: 4.0, delay: 1.6 },
  { left: 28, top: 29, duration: 3.4, delay: 0.6 },
  { left: 38, top: 72, duration: 4.6, delay: 1.9 },
  { left: 48, top: 18, duration: 3.7, delay: 0.4 },
  { left: 58, top: 63, duration: 4.4, delay: 1.3 },
  { left: 68, top: 91, duration: 3.1, delay: 0.8 },
  { left: 78, top: 37, duration: 4.7, delay: 1.7 },
  { left: 88, top: 52, duration: 3.0, delay: 1.0 },
  { left: 98, top: 85, duration: 4.9, delay: 0.0 },
]

// Floating tropical elements
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Golden particles */}
    {PARTICLE_POSITIONS.map((particle, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
        style={{
          left: `${particle.left}%`,
          top: `${particle.top}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: particle.duration,
          repeat: Infinity,
          delay: particle.delay,
        }}
      />
    ))}
    {/* Larger glowing orbs */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`orb-${i}`}
        className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl"
        style={{
          left: `${20 + i * 20}%`,
          top: `${30 + (i % 2) * 40}%`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5 + i,
          repeat: Infinity,
        }}
      />
    ))}
  </div>
)

// Video Background Component
const VideoBackground = ({
  src,
  isActive,
  isHovered
}: {
  src: string
  isActive: boolean
  isHovered: boolean
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive || isHovered) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive, isHovered])

  // Handle YouTube URLs
  if (isYouTubeUrl(src)) {
    return (
      <iframe
        src={getYouTubeEmbedUrl(src) || ''}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '177.77%', minHeight: '100%' }}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    )
  }

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}

// Event Card Component
const EventCard = ({
  event,
  index,
  isActive,
  onClick
}: {
  event: TimelineEvent
  index: number
  isActive: boolean
  onClick: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[55vw] lg:w-[45vw] xl:w-[38vw] h-[75vh] sm:h-[80vh] cursor-pointer group`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isActive ? 1 : 0.92,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Card */}
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Background Media with Ken Burns */}
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isHovered ? 1.1 : 1.05,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {event.media_type === 'video' ? (
            <VideoBackground
              src={event.media_url}
              isActive={isActive}
              isHovered={isHovered}
            />
          ) : (
            <Image
              src={event.media_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 35vw"
              priority={index < 3}
            />
          )}
        </motion.div>

        {/* Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-t ${event.gradient_colors} opacity-60 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Video indicator */}
        {event.media_type === 'video' && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
            <Play size={12} className="text-white" fill="white" />
            <span className="text-white text-xs font-medium">Video</span>
          </div>
        )}

        {/* Animated border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-[2rem] border-2 border-white/0"
          animate={{
            borderColor: isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0)',
            boxShadow: isHovered
              ? '0 0 60px rgba(255,255,255,0.1), inset 0 0 60px rgba(255,255,255,0.05)'
              : '0 0 0px rgba(255,255,255,0)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            {/* Date Badge */}
            <motion.div
              className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20"
              animate={{
                scale: isHovered ? 1.05 : 1,
                backgroundColor: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-white/80 text-xs font-bold tracking-widest">{event.month_short}</span>
              <span className="text-white text-2xl sm:text-3xl font-bold font-display">{event.day}</span>
            </motion.div>

            {/* Category Tag */}
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">{event.category}</span>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-4">
            {/* Title Block */}
            <div className="space-y-2">
              <motion.h3
                className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-bold leading-none tracking-tight"
                animate={{ y: isHovered ? -5 : 0 }}
              >
                {event.title}
              </motion.h3>
              {event.subtitle && (
                <motion.p
                  className="text-lg sm:text-xl text-white/80 font-medium"
                  animate={{ y: isHovered ? -5 : 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {event.subtitle}
                </motion.p>
              )}
            </div>

            {/* Description - shows on hover */}
            {event.description && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  height: isHovered ? 'auto' : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {event.description}
                </p>
              </motion.div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {/* Highlights Tags */}
            {event.highlights && event.highlights.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.7 }}
              >
                {event.highlights.slice(0, 3).map((highlight, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/10"
                  >
                    {highlight}
                  </span>
                ))}
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.button
              className="flex items-center gap-2 text-white font-semibold group/btn mt-2"
              animate={{ x: isHovered ? 5 : 0 }}
            >
              <span>Explore Event</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </motion.button>
          </div>
        </div>

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
      </div>
    </motion.div>
  )
}

// Modal for event details
const EventModal = ({
  event,
  onClose
}: {
  event: TimelineEvent | null
  onClose: () => void
}) => {
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  if (!event) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Hero Media */}
          <div className="relative h-64 sm:h-80">
            {event.media_type === 'video' ? (
              <>
                {isYouTubeUrl(event.media_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(event.media_url, { controls: true }) || ''}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={event.media_url}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Mute toggle - only for non-YouTube videos */}
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </>
                )}
              </>
            ) : (
              <Image
                src={event.media_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-t ${event.gradient_colors} opacity-50 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                  {event.month} {event.day}
                </span>
                <span className="px-4 py-1.5 text-sm font-medium bg-white/10 text-white/80 rounded-full">
                  {event.category}
                </span>
                {event.media_type === 'video' && (
                  <span className="px-4 py-1.5 text-sm font-medium bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-1.5">
                    <Play size={12} fill="currentColor" />
                    Video
                  </span>
                )}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-white font-bold mb-2">
                {event.title}
              </h2>
              {event.subtitle && (
                <p className="text-xl text-white/70">{event.subtitle}</p>
              )}
            </div>

            {event.description && (
              <p className="text-white/80 text-lg leading-relaxed">
                {event.description}
              </p>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Event Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {event.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-xl border border-white/10"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>View All Events</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Month navigation dots
const MonthDots = ({
  events,
  activeIndex,
  onDotClick
}: {
  events: TimelineEvent[]
  activeIndex: number
  onDotClick: (index: number) => void
}) => (
  <div className="flex items-center gap-2 justify-center mt-6">
    {events.map((event, i) => (
      <button
        key={event.id}
        onClick={() => onDotClick(i)}
        className="group relative"
      >
        <motion.div
          className={`w-2 h-2 rounded-full transition-all ${
            i === activeIndex
              ? 'bg-emerald-500 w-8'
              : 'bg-white/30 hover:bg-white/50'
          }`}
          layoutId="activeDot"
        />
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
            {event.month_short}
          </div>
        </div>
      </button>
    ))}
  </div>
)

// Main Timeline Component
interface EventsTimelineProps {
  events: TimelineEvent[]
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Handle scroll to update active index
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cards = container.querySelectorAll('[data-event-card]')
    if (cards.length === 0) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Infinity

    cards.forEach((card, index) => {
      const cardElement = card as HTMLElement
      const cardCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2
      const distance = Math.abs(containerCenter - cardCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    setActiveIndex(closestIndex)
  }

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cards = container.querySelectorAll('[data-event-card]')
    if (cards.length === 0 || index >= cards.length) return

    const card = cards[index] as HTMLElement
    const cardCenter = card.offsetLeft + card.offsetWidth / 2
    const containerCenter = container.clientWidth / 2

    container.scrollTo({
      left: cardCenter - containerCenter,
      behavior: 'smooth'
    })
  }

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1)
    scrollToIndex(newIndex)
  }, [activeIndex])

  const handleNext = useCallback(() => {
    const newIndex = Math.min(events.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }, [activeIndex, events.length])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape' && selectedEvent) setSelectedEvent(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext, selectedEvent])

  // If no events, show empty state
  if (!events || events.length === 0) {
    return (
      <section className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
          <Calendar className="w-16 h-16 text-emerald-500/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Timeline Events</h2>
          <p className="text-white/60 mb-6">Check back soon for annual events!</p>
          <Link
            href="/events"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Events
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <FloatingElements />

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen py-4 sm:py-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 mb-4 sm:mb-6">
          {/* Back to Events Link */}
          <Link
            href="/events"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium hidden sm:inline">Back to Events</span>
          </Link>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              disabled={activeIndex === events.length - 1}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Timeline Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-[7.5vw] sm:pl-[15vw] md:pl-[22.5vw] lg:pl-[27.5vw] xl:pl-[31vw] pb-8 cursor-grab active:cursor-grabbing flex-1 items-center"
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              data-event-card
              className="snap-center"
              style={{ scrollSnapAlign: 'center' }}
            >
              <EventCard
                event={event}
                index={index}
                isActive={index === activeIndex}
                onClick={() => setSelectedEvent(event)}
              />
            </div>
          ))}
          {/* End spacer to allow last card to center */}
          <div className="flex-shrink-0 w-[7.5vw] sm:w-[15vw] md:w-[22.5vw] lg:w-[27.5vw] xl:w-[31vw]" />
        </div>

        {/* Month Navigation Dots */}
        <MonthDots
          events={events}
          activeIndex={activeIndex}
          onDotClick={scrollToIndex}
        />

        {/* Scroll Hint (mobile) */}
        <motion.div
          className="flex sm:hidden justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <ChevronLeft className="w-3 h-3" />
            <span>Swipe to explore</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  )
}

export default EventsTimeline
