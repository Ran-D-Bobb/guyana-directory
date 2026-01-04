'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Sparkles, ArrowRight, X } from 'lucide-react'

// Guyana's Major Annual Events - Demo Data with stunning imagery
const ANNUAL_EVENTS = [
  {
    id: 'mashramani',
    month: 'February',
    monthShort: 'FEB',
    day: '23',
    title: 'Mashramani',
    subtitle: 'Republic Day Celebrations',
    description: 'The ultimate expression of Guyanese culture! Vibrant costumes, pulsating music, and the famous float parade transform the streets into a kaleidoscope of color and rhythm.',
    location: 'Georgetown & Nationwide',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=90',
    color: 'from-orange-500 via-pink-500 to-purple-600',
    accentColor: 'orange',
    highlights: ['Float Parade', 'Costume Bands', 'Steel Pan', 'Calypso'],
    category: 'Cultural Festival',
  },
  {
    id: 'phagwah',
    month: 'March',
    monthShort: 'MAR',
    day: '25',
    title: 'Phagwah (Holi)',
    subtitle: 'Festival of Colors',
    description: 'Experience the joyous Hindu spring festival where streets erupt in clouds of vibrant colored powder. Music, dancing, and the triumph of good over evil.',
    location: 'Nationwide',
    image: 'https://images.unsplash.com/photo-1576983844349-f95c28c0cd51?w=1600&q=90',
    color: 'from-pink-500 via-purple-500 to-indigo-500',
    accentColor: 'pink',
    highlights: ['Color Throwing', 'Chowtal Singing', 'Traditional Sweets', 'Spring Celebration'],
    category: 'Religious Festival',
  },
  {
    id: 'easter-regatta',
    month: 'April',
    monthShort: 'APR',
    day: '20',
    title: 'Easter Regatta',
    subtitle: 'Bartica Sailing Festival',
    description: 'The riverside town of Bartica comes alive with boat races, water sports, and festivities. A beloved Guyanese tradition drawing thousands to the waterfront.',
    location: 'Bartica, Region 7',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=90',
    color: 'from-cyan-500 via-blue-500 to-indigo-600',
    accentColor: 'cyan',
    highlights: ['Boat Racing', 'Swimming Competitions', 'Live Music', 'River Festival'],
    category: 'Sports & Recreation',
  },
  {
    id: 'arrival-day',
    month: 'May',
    monthShort: 'MAY',
    day: '5',
    title: 'Arrival Day',
    subtitle: 'Celebrating Heritage',
    description: 'Commemorating the arrival of indentured workers from India, this day honors the contributions of the Indian diaspora to Guyana\'s rich multicultural tapestry.',
    location: 'Nationwide',
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=1600&q=90',
    color: 'from-amber-500 via-orange-500 to-red-500',
    accentColor: 'amber',
    highlights: ['Cultural Programs', 'Traditional Food', 'Heritage Sites', 'Community Gatherings'],
    category: 'National Holiday',
  },
  {
    id: 'amerindian-heritage',
    month: 'September',
    monthShort: 'SEP',
    day: '1-30',
    title: 'Amerindian Heritage Month',
    subtitle: 'Indigenous Celebrations',
    description: 'A month-long celebration of Guyana\'s nine indigenous nations. Traditional crafts, ancestral foods, storytelling, and sacred ceremonies connect past with present.',
    location: 'Indigenous Communities',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=90',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    accentColor: 'emerald',
    highlights: ['Heritage Village', 'Traditional Crafts', 'Cassava Bread Making', 'Indigenous Games'],
    category: 'Cultural Heritage',
  },
  {
    id: 'diwali',
    month: 'November',
    monthShort: 'NOV',
    day: '12',
    title: 'Diwali',
    subtitle: 'Festival of Lights',
    description: 'As darkness falls, thousands of diyas (oil lamps) illuminate homes and streets. The Hindu festival of lights creates a magical atmosphere across the country.',
    location: 'Nationwide',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1600&q=90',
    color: 'from-yellow-400 via-amber-500 to-orange-600',
    accentColor: 'yellow',
    highlights: ['Diya Lighting', 'Fireworks', 'Sweets & Delicacies', 'Lakshmi Puja'],
    category: 'Religious Festival',
  },
  {
    id: 'christmas',
    month: 'December',
    monthShort: 'DEC',
    day: '25',
    title: 'Christmas Season',
    subtitle: 'Tropical Holiday Magic',
    description: 'Guyanese Christmas is unique! Garlic pork, pepperpot, and black cake. Masquerade bands dance through streets while families gather for traditional celebrations.',
    location: 'Nationwide',
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1600&q=90',
    color: 'from-red-500 via-rose-500 to-pink-500',
    accentColor: 'red',
    highlights: ['Masquerade Dancing', 'Pepperpot', 'Carol Singing', 'Family Gatherings'],
    category: 'National Holiday',
  },
  {
    id: 'rupununi-rodeo',
    month: 'March',
    monthShort: 'MAR',
    day: '15-16',
    title: 'Rupununi Rodeo',
    subtitle: 'Wild West of Guyana',
    description: 'In the vast savannahs of the Rupununi, skilled vaqueros showcase horsemanship at this legendary rodeo. Cowboys, cattle, and the spirit of the frontier.',
    location: 'Lethem, Region 9',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=90',
    color: 'from-amber-600 via-yellow-600 to-lime-500',
    accentColor: 'lime',
    highlights: ['Bull Riding', 'Horse Racing', 'Lasso Competitions', 'Ranch Culture'],
    category: 'Sports & Recreation',
  },
]

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

// Event Card Component
const EventCard = ({
  event,
  index,
  isActive,
  onClick
}: {
  event: typeof ANNUAL_EVENTS[0]
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
        {/* Background Image with Ken Burns */}
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isHovered ? 1.1 : 1.05,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 35vw"
            priority={index < 3}
          />
        </motion.div>

        {/* Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-t ${event.color} opacity-60 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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
              <span className="text-white/80 text-xs font-bold tracking-widest">{event.monthShort}</span>
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
              <motion.p
                className="text-lg sm:text-xl text-white/80 font-medium"
                animate={{ y: isHovered ? -5 : 0 }}
                transition={{ delay: 0.05 }}
              >
                {event.subtitle}
              </motion.p>
            </div>

            {/* Description - shows on hover */}
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

            {/* Location */}
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>

            {/* Highlights Tags */}
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
  event: typeof ANNUAL_EVENTS[0] | null
  onClose: () => void
}) => {
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

          {/* Hero Image */}
          <div className="relative h-64 sm:h-80">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${event.color} opacity-50 mix-blend-multiply`} />
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
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-white font-bold mb-2">
                {event.title}
              </h2>
              <p className="text-xl text-white/70">{event.subtitle}</p>
            </div>

            <p className="text-white/80 text-lg leading-relaxed">
              {event.description}
            </p>

            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>

            {/* Highlights */}
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
  events: typeof ANNUAL_EVENTS
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
            {event.monthShort}
          </div>
        </div>
      </button>
    ))}
  </div>
)

// Main Timeline Component
export function EventsTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<typeof ANNUAL_EVENTS[0] | null>(null)
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
    const newIndex = Math.min(ANNUAL_EVENTS.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }, [activeIndex])

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
              disabled={activeIndex === ANNUAL_EVENTS.length - 1}
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
          {ANNUAL_EVENTS.map((event, index) => (
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
          events={ANNUAL_EVENTS}
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
