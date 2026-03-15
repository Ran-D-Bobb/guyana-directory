'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar, MapPin, ChevronLeft, ChevronRight, ArrowLeft,
  Info, Search, Flame, Music, Utensils, Palette,
  Heart, Users, Sparkles, Star, TrendingUp,
  Baby, Ticket, X, Zap, Tag,
  Dumbbell, BookOpen, Briefcase, Gift, Drama, GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import type { MappedEvent } from '@/lib/events'
import { ScrollReveal } from '@/components/ScrollReveal'
import { getFallbackImage } from '@/lib/category-images'
import { getLocalizedName } from '@/lib/i18n-helpers'

// ─── Types ──────────────────────────────────────────────────────────
export interface EventRowData {
  title: string
  icon: string
  iconColor: string
  events: MappedEvent[]
}

export interface EventCategory {
  name: string
  name_es?: string | null
  slug: string
  icon: string | null
}

export interface EventRegion {
  id: string
  name: string
  slug: string
}

interface EventsNetflixPageProps {
  heroEvents: MappedEvent[]
  eventRows: EventRowData[]
  listEvents?: MappedEvent[]  // If provided, shows a grid instead of rows
  categories?: EventCategory[]
  regions?: EventRegion[]
  searchQuery?: string
  basePath?: string   // e.g. '/events' or '/events/category/music'
  pageTitle?: string  // e.g. 'Music Events'
  activeCategory?: string // slug of the currently active category
  activeRegion?: string // id of the currently active region
}

// ─── Icon Map ───────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  flame: Flame,
  trending_up: TrendingUp,
  music: Music,
  utensils: Utensils,
  palette: Palette,
  baby: Baby,
  ticket: Ticket,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  tag: Tag,
  dumbbell: Dumbbell,
  book_open: BookOpen,
  briefcase: Briefcase,
  gift: Gift,
  drama: Drama,
  graduation_cap: GraduationCap,
  users: Users,
  heart: Heart,
  calendar: Calendar,
  map_pin: MapPin,
}

function getIcon(iconName: string): LucideIcon {
  const normalized = iconName.toLowerCase().replace(/[-\s]/g, '_')
  return ICON_MAP[normalized] || Sparkles
}

// ─── Category Colors ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Festival: 'bg-amber-500/90',
  Music: 'bg-purple-500/90',
  Concert: 'bg-purple-500/90',
  Cultural: 'bg-rose-500/90',
  'Art & Culture': 'bg-rose-500/90',
  'Food & Drink': 'bg-orange-500/90',
  Nightlife: 'bg-violet-500/90',
  Wellness: 'bg-teal-500/90',
  Sports: 'bg-green-500/90',
  Workshop: 'bg-blue-500/90',
  Community: 'bg-emerald-500/90',
  Business: 'bg-sky-500/90',
  'Business Networking': 'bg-sky-500/90',
  Charity: 'bg-pink-500/90',
  Other: 'bg-gray-500/90',
  Promotion: 'bg-fuchsia-500/90',
}

function getCategoryColor(category: string | null): string {
  if (!category) return 'bg-emerald-500/90'
  return CATEGORY_COLORS[category] || 'bg-emerald-500/90'
}

// ─── Helpers ────────────────────────────────────────────────────────
function getEventHref(event: MappedEvent): string {
  if (event.source_type === 'business' && event.business_slug) {
    return `/businesses/${event.business_slug}`
  }
  return `/events/${event.slug}`
}

function getEventCategoryName(event: MappedEvent): string {
  if (event.source_type === 'business') return event.event_type_name || 'Promotion'
  return event.event_categories?.name || event.category_name || 'Event'
}

function formatEventDate(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const isSameDay = start.toDateString() === end.toDateString()

  const formatShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (isSameDay) return formatShort(start)
  return `${formatShort(start)} - ${formatShort(end)}`
}

function getTimingBadge(startDate: string, endDate: string): { label: string; color: string } | null {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start <= now && end >= now) {
    return { label: 'LIVE', color: 'bg-red-600' }
  }

  const diffMs = start.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return null
  if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-emerald-600' }
  if (diffDays <= 3) return { label: `In ${diffDays} days`, color: 'bg-emerald-600' }
  if (diffDays <= 7) return { label: 'This Week', color: 'bg-sky-600' }
  return null
}

// ─── Hero Banner ────────────────────────────────────────────────────
function HeroBanner({ events, hasCategories }: { events: MappedEvent[]; hasCategories?: boolean }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const DURATION = 8000

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(0)
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (elapsed >= DURATION) {
        setCurrent(prev => (prev + 1) % events.length)
      }
    }, 50)
  }, [events.length])

  useEffect(() => {
    if (events.length === 0) return
    startTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current, startTimer, events.length])

  const goTo = (idx: number) => setCurrent(idx)

  if (events.length === 0) return null

  const event = events[current]
  const categoryName = getEventCategoryName(event)
  const dateStr = formatEventDate(event.start_date, event.end_date)
  const href = getEventHref(event)

  return (
    <>
      {/* Mobile Hero */}
      <div className={`md:hidden relative w-full ${hasCategories ? 'pt-[5.5rem]' : 'pt-14'}`}>
        <Link href={href} className="relative mx-4 rounded-xl overflow-hidden aspect-[16/10] block">
          {events.map((e, i) => (
            <div
              key={e.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={e.image_url || getFallbackImage(e.event_categories?.name || e.category_name, 'event')}
                alt={e.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw"
                priority={i === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute top-3 left-3 flex items-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getCategoryColor(categoryName)}`}>
              {categoryName}
            </span>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4" key={event.id}>
            <h2 className="text-xl font-bold text-white leading-tight mb-1">{event.title}</h2>
            <p className="text-xs text-white/60 mb-3 line-clamp-1">
              {dateStr} · {event.location || 'Guyana'}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-md">
                <Info className="w-3.5 h-3.5" />
                View Details
              </span>
              {event.interest_count > 0 && (
                <span className="flex items-center gap-1 px-3 py-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-md border border-white/20">
                  <Heart className="w-3.5 h-3.5" />
                  {event.interest_count}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="hidden md:block relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        {events.map((e, i) => (
          <div
            key={e.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={e.image_url || getFallbackImage(e.event_categories?.name || e.category_name, 'event')}
              alt={e.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />

        <div className="absolute inset-0 flex items-end pb-20 px-12 lg:px-16">
          <div className="max-w-2xl" key={event.id}>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-4 ${getCategoryColor(categoryName)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              {categoryName}
            </span>

            <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight tracking-tight">
              {event.title}
            </h1>
            {event.description && (
              <p className="text-base text-white/50 max-w-lg mb-6 line-clamp-2">{event.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {dateStr}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {event.location}
                </span>
              )}
              {event.interest_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-rose-400" />
                  {event.interest_count.toLocaleString()} interested
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={href}
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-all text-sm"
              >
                <Ticket className="w-5 h-5" />
                View Event
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-12 lg:left-16 flex items-center gap-2">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === current ? 48 : 20 }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              {i === current && (
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Mobile Compact Card ────────────────────────────────────────────
function MobileEventCard({ event }: { event: MappedEvent }) {
  const categoryName = getEventCategoryName(event)
  const timing = getTimingBadge(event.start_date, event.end_date)
  const href = getEventHref(event)

  return (
    <Link href={href} className="relative flex-shrink-0 w-[130px] block group">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden shadow-md shadow-black/40 group-active:scale-95 transition-transform">
        <Image
          src={event.image_url || getFallbackImage(event.event_categories?.name || event.category_name, 'event')}
          alt={event.title}
          fill
          className="object-cover"
          sizes="130px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Timing badge */}
        {timing && (
          <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-white text-[8px] font-bold rounded flex items-center gap-0.5 ${timing.color}`}>
            {timing.label === 'LIVE' && (
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1 w-1 bg-white" />
              </span>
            )}
            {timing.label}
          </div>
        )}

        {/* Featured badge */}
        {event.is_featured && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-amber-500 text-black text-[8px] font-bold rounded flex items-center gap-0.5">
            <Star className="w-2 h-2" />
            HOT
          </div>
        )}

        {/* Promotion badge */}
        {event.source_type === 'business' && !event.is_featured && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-fuchsia-500 text-white text-[8px] font-bold rounded">
            PROMO
          </div>
        )}

        {/* Title */}
        <div className="absolute bottom-0 inset-x-0 p-2">
          <h3 className="text-white font-semibold text-[11px] leading-tight line-clamp-2">
            {event.title}
          </h3>
        </div>
      </div>
      <p className="text-[10px] text-white/40 mt-1 truncate">{categoryName}</p>
    </Link>
  )
}

// ─── Desktop Poster Card ────────────────────────────────────────────
function DesktopEventPosterCard({ event }: { event: MappedEvent }) {
  const [hovered, setHovered] = useState(false)
  const categoryName = getEventCategoryName(event)
  const dateStr = formatEventDate(event.start_date, event.end_date)
  const timing = getTimingBadge(event.start_date, event.end_date)
  const href = getEventHref(event)

  return (
    <Link
      href={href}
      className="relative flex-shrink-0 w-[200px] md:w-[220px] block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${hovered ? 'scale-105 shadow-2xl shadow-black/60 z-20 ring-2 ring-white/20' : 'shadow-lg shadow-black/40'}`}>
        <Image
          src={event.image_url || getFallbackImage(event.event_categories?.name || event.category_name, 'event')}
          alt={event.title}
          fill
          className="object-cover"
          sizes="220px"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Timing badge */}
        {timing && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1 ${timing.color}`}>
            {timing.label === 'LIVE' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            {timing.label}
          </div>
        )}

        {/* Featured badge */}
        {event.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <Star className="w-2.5 h-2.5" />
            HOT
          </div>
        )}

        {/* Promotion badge */}
        {event.source_type === 'business' && !event.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-fuchsia-500 text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            PROMO
          </div>
        )}

        {/* Default bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-2 ${getCategoryColor(categoryName)}`}>
            {categoryName}
          </span>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
            <Calendar className="w-3 h-3" />
            {dateStr}
          </div>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-3 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className={`inline-block w-fit px-2 py-0.5 rounded text-[9px] font-bold text-white mb-2 ${getCategoryColor(categoryName)}`}>
            {categoryName}
          </span>
          <h3 className="text-white font-bold text-sm leading-tight mb-2">{event.title}</h3>
          <div className="space-y-1 text-[11px] text-white/70 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {dateStr}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                {event.location}
              </div>
            )}
            {event.interest_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-rose-400" />
                {event.interest_count} interested
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-400 transition-colors">
              <Ticket className="w-3 h-3" />
              View
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── List/Grid Card ────────────────────────────────────────────────
function EventGridCard({ event }: { event: MappedEvent }) {
  const [hovered, setHovered] = useState(false)
  const categoryName = getEventCategoryName(event)
  const dateStr = formatEventDate(event.start_date, event.end_date)
  const timing = getTimingBadge(event.start_date, event.end_date)
  const href = getEventHref(event)

  return (
    <Link
      href={href}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative aspect-[16/10] rounded-lg overflow-hidden transition-all duration-300 ${hovered ? 'scale-[1.02] shadow-2xl shadow-black/60 ring-1 ring-white/20' : 'shadow-lg shadow-black/40'}`}>
        <Image
          src={event.image_url || getFallbackImage(event.event_categories?.name || event.category_name, 'event')}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {timing && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1 ${timing.color}`}>
            {timing.label === 'LIVE' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            {timing.label}
          </div>
        )}

        {event.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <Star className="w-2.5 h-2.5" />
            HOT
          </div>
        )}

        {event.source_type === 'business' && !event.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-fuchsia-500 text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            PROMO
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-3">
          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1.5 ${getCategoryColor(categoryName)}`}>
            {categoryName}
          </span>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{event.title}</h3>
        </div>
      </div>

      <div className="mt-2 space-y-0.5 px-0.5">
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Calendar className="w-3 h-3 text-emerald-400" />
          {dateStr}
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.interest_count > 0 && (
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Heart className="w-3 h-3 text-rose-400" />
            {event.interest_count} interested
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Events Grid ───────────────────────────────────────────────────
function EventsGrid({ events, title }: { events: MappedEvent[]; title?: string }) {
  if (events.length === 0) return null

  return (
    <div className="px-4 md:px-12 lg:px-16 pb-8">
      {title && (
        <h2 className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {events.map((event, index) => (
          <ScrollReveal
            key={event.id}
            variant="fade-up"
            delay={Math.min((index % 5) * 60, 240)}
            duration={500}
          >
            <EventGridCard event={event} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

// ─── Scrollable Row ─────────────────────────────────────────────────
function EventRow({ row }: { row: EventRowData }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const IconComponent = getIcon(row.icon)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => { if (el) el.removeEventListener('scroll', checkScroll) }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (row.events.length === 0) return null

  return (
    <div className="relative group/row mb-5 md:mb-10">
      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 px-4 md:px-12 lg:px-16">
        <span className="md:block hidden">
          <IconComponent className={`w-5 h-5 ${row.iconColor}`} />
        </span>
        <h2 className="text-sm md:text-xl font-bold text-white tracking-tight">
          {row.title}
        </h2>
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/30 group-hover/row:text-emerald-400 group-hover/row:translate-x-1 transition-all" />
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 lg:px-16 pb-1 md:pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {row.events.map(event => (
            <div key={event.id} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <div className="md:hidden">
                <MobileEventCard event={event} />
              </div>
              <div className="hidden md:block">
                <DesktopEventPosterCard event={event} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Top Bar ────────────────────────────────────────────────────────
function TopBar({ searchQuery, basePath = '/events', pageTitle = 'Events', categories = [], regions = [], activeCategory, activeRegion }: { searchQuery?: string; basePath?: string; pageTitle?: string; categories?: EventCategory[]; regions?: EventRegion[]; activeCategory?: string; activeRegion?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(!!searchQuery)
  const [searchValue, setSearchValue] = useState(searchQuery || '')
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const activeFilter = searchParams.get('time') || 'all'

  const setFilter = (time: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (time === 'all') {
      params.delete('time')
    } else {
      params.set('time', time)
    }
    params.delete('page')
    router.push(`${basePath}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue.trim()) {
      params.set('q', searchValue.trim())
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`${basePath}?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchValue('')
    setSearchOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    router.push(`${basePath}?${params.toString()}`)
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
  ]

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 md:from-black/60 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 lg:px-16 h-12 md:h-16">
        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          <Link href="/events" className="md:hidden text-lg font-bold text-white">
            {pageTitle}
          </Link>
          <Link href="/events" className="hidden md:flex text-xl font-bold text-white items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Events
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f.key || (f.key === 'all' && !searchParams.get('time'))
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Region filter */}
          {regions && regions.length > 0 && (
            <div className="relative">
              <select
                value={activeRegion || ''}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (e.target.value) {
                    params.set('region', e.target.value)
                  } else {
                    params.delete('region')
                  }
                  params.delete('page')
                  router.push(`${basePath}?${params.toString()}`)
                }}
                className="appearance-none bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs md:text-sm rounded-full pl-7 pr-6 py-1.5 md:py-2 outline-none cursor-pointer transition-colors [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                <option value="">All Locations</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400 pointer-events-none" />
            </div>
          )}

          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center bg-black/80 border border-white/20 rounded-lg overflow-hidden">
              <Search className="w-4 h-4 text-white/50 ml-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search events..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-transparent text-white text-sm px-3 py-2 w-40 md:w-64 outline-none placeholder:text-white/30"
              />
              <button type="button" onClick={clearSearch} className="p-2 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-white/80 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category nav links */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 md:gap-2 px-4 md:px-12 lg:px-16 pb-2 overflow-x-auto scrollbar-hide">
          <Link
            href="/events"
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-emerald-500 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            All
          </Link>
          {categories.map(cat => {
            const isActive = activeCategory === cat.slug
            const IconComp = cat.icon ? getIcon(cat.icon) : null
            return (
              <Link
                key={cat.slug}
                href={`/events/category/${cat.slug}`}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {IconComp && <IconComp className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                {getLocalizedName(cat, locale)}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────────────
function EmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-full blur-2xl scale-150" />
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-white/10">
          <Calendar className="w-12 h-12 text-emerald-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        {searchQuery ? 'No events found' : 'No upcoming events'}
      </h3>
      <p className="text-white/40 text-lg max-w-md mb-8">
        {searchQuery
          ? `No events match "${searchQuery}". Try a different search.`
          : 'Check back soon for upcoming events and festivals in Guyana.'}
      </p>
      {searchQuery && (
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-colors"
        >
          Browse All Events
        </Link>
      )}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────
export function EventsNetflixPage({ heroEvents, eventRows, listEvents, categories, searchQuery, basePath = '/events', pageTitle = 'Events', activeCategory, regions, activeRegion }: EventsNetflixPageProps) {
  const isListMode = !!listEvents
  const hasAnyEvents = isListMode
    ? listEvents!.length > 0
    : heroEvents.length > 0 || eventRows.some(r => r.events.length > 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20 lg:pb-0 dark">
      {/* Hide global header + spacer, dark body for BottomNav, hide scrollbar */}
      <style>{`
        header { display: none !important; }
        header + div[class*="h-14"] { display: none !important; }
        body { background: #0a0a0a !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <TopBar searchQuery={searchQuery} basePath={basePath} pageTitle={pageTitle} categories={categories} activeCategory={activeCategory} regions={regions} activeRegion={activeRegion} />

      {hasAnyEvents ? (
        isListMode ? (
          <div className={`relative z-10 ${categories && categories.length > 0 ? 'pt-[5.5rem] md:pt-24' : 'pt-14 md:pt-20'}`}>
            <EventsGrid events={listEvents!} title={`All ${pageTitle} Events`} />
          </div>
        ) : (
          <>
            <HeroBanner events={heroEvents} hasCategories={categories && categories.length > 0} />

            <div className="relative z-10 mt-4 md:-mt-12 pt-2 md:pt-4 pb-6 md:pb-12">
              {eventRows.map(row => (
                <EventRow key={row.title} row={row} />
              ))}
            </div>
          </>
        )
      ) : (
        <div className="pt-16">
          <EmptyState searchQuery={searchQuery} />
        </div>
      )}
    </div>
  )
}
