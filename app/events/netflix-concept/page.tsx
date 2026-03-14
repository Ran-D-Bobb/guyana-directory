'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Calendar, MapPin, ChevronLeft, ChevronRight,
  Info, Search, Flame, Music, Utensils, Palette,
  Heart, Users, Sparkles, PartyPopper, Star, TrendingUp,
  Baby, Ticket, X, Home, Zap, User, Bell, Download
} from 'lucide-react'
import { getFallbackImage } from '@/lib/category-images'

// ─── Mock Data ──────────────────────────────────────────────────────
const HERO_EVENTS = [
  {
    id: '1',
    title: 'Mashramani 2026',
    tagline: "Guyana's Republic Day Celebration",
    description: 'The biggest carnival and cultural festival in Guyana. Floats, music, dance, and celebration across Georgetown.',
    date: 'Feb 23, 2026',
    location: 'Georgetown, Guyana',
    image: '/images/defaults/event.jpg',
    category: 'Festival',
    interested: 2847,
  },
  {
    id: '2',
    title: 'Caribbean Beats Festival',
    tagline: 'Three days of non-stop music',
    description: 'International and local artists come together for the ultimate Caribbean music experience on the Demerara coast.',
    date: 'Mar 15-17, 2026',
    location: 'Providence Stadium',
    image: '/images/defaults/event.jpg',
    category: 'Music',
    interested: 1523,
  },
  {
    id: '3',
    title: 'Rupununi Rodeo',
    tagline: 'Wild West meets the Savannah',
    description: 'Experience the legendary cowboys of the Rupununi savannah in this annual rodeo and cultural showcase.',
    date: 'Apr 5, 2026',
    location: 'Lethem, Rupununi',
    image: '/images/defaults/event.jpg',
    category: 'Cultural',
    interested: 892,
  },
]

type MockEvent = {
  id: string
  title: string
  date: string
  location: string
  image: string
  category: string
  interested: number
  isLive?: boolean
  isFeatured?: boolean
  daysAway?: string
  price?: string
}

const MOCK_ROWS: { title: string; icon: React.ReactNode; events: MockEvent[] }[] = [
  {
    title: 'Happening This Weekend',
    icon: <Flame className="w-5 h-5 text-orange-400" />,
    events: [
      { id: 'w1', title: 'Friday Night Jazz at Backyard Cafe', date: 'Fri, Mar 13', location: 'Georgetown', image: '/images/defaults/event.jpg', category: 'Music', interested: 134, isLive: true, daysAway: 'Tonight' },
      { id: 'w2', title: 'Starbroek Market Food Festival', date: 'Sat, Mar 14', location: 'Stabroek', image: '/images/defaults/event.jpg', category: 'Food & Drink', interested: 287, daysAway: 'Tomorrow' },
      { id: 'w3', title: 'Yoga on the Seawall', date: 'Sat, Mar 14', location: 'Georgetown Seawall', image: '/images/defaults/event.jpg', category: 'Wellness', interested: 98, daysAway: 'Tomorrow', price: 'Free' },
      { id: 'w4', title: 'Dancehall Night at Palm Court', date: 'Sat, Mar 14', location: 'Palm Court', image: '/images/defaults/event.jpg', category: 'Nightlife', interested: 342, daysAway: 'Tomorrow' },
      { id: 'w5', title: 'Saturday Art Walk', date: 'Sat, Mar 14', location: 'Castellani House', image: '/images/defaults/event.jpg', category: 'Art', interested: 56, daysAway: 'Tomorrow', price: 'Free' },
      { id: 'w6', title: 'Sunday Brunch & Soca', date: 'Sun, Mar 15', location: 'Aagman Restaurant', image: '/images/defaults/event.jpg', category: 'Food & Drink', interested: 178, daysAway: 'In 2 days' },
      { id: 'w7', title: 'Kids Craft Workshop', date: 'Sun, Mar 15', location: 'National Library', image: '/images/defaults/event.jpg', category: 'Family', interested: 64, daysAway: 'In 2 days', price: '$500 GYD' },
    ],
  },
  {
    title: 'Trending in Georgetown',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    events: [
      { id: 't1', title: 'Guyana Fashion Week 2026', date: 'Mar 20-22', location: 'Marriott Hotel', image: '/images/defaults/event.jpg', category: 'Fashion', interested: 1204, isFeatured: true },
      { id: 't2', title: 'Tech Georgetown Meetup', date: 'Mar 18', location: 'Herdmanston Lodge', image: '/images/defaults/event.jpg', category: 'Tech', interested: 389 },
      { id: 't3', title: 'Comedy Night Live', date: 'Mar 21', location: 'Theatre Guild', image: '/images/defaults/event.jpg', category: 'Comedy', interested: 567 },
      { id: 't4', title: 'Georgetown Night Market', date: 'Mar 22', location: 'Promenade Gardens', image: '/images/defaults/event.jpg', category: 'Market', interested: 891 },
      { id: 't5', title: 'Fitness Bootcamp Challenge', date: 'Mar 19', location: 'National Park', image: '/images/defaults/event.jpg', category: 'Sports', interested: 234, price: '$2,000 GYD' },
      { id: 't6', title: 'Wine & Paint Night', date: 'Mar 20', location: 'Bistro Cafe', image: '/images/defaults/event.jpg', category: 'Art', interested: 156 },
    ],
  },
  {
    title: 'Live Music & Nightlife',
    icon: <Music className="w-5 h-5 text-purple-400" />,
    events: [
      { id: 'm1', title: 'Reggae on the River', date: 'Mar 28', location: 'Essequibo River', image: '/images/defaults/event.jpg', category: 'Music', interested: 743 },
      { id: 'm2', title: 'Soca Monarch Finals', date: 'Apr 2', location: 'National Stadium', image: '/images/defaults/event.jpg', category: 'Music', interested: 1567, isFeatured: true },
      { id: 'm3', title: 'Acoustic Sessions at 704', date: 'Every Wednesday', location: '704 Sports Bar', image: '/images/defaults/event.jpg', category: 'Music', interested: 89 },
      { id: 'm4', title: 'DJ Puffy Live', date: 'Mar 30', location: 'Club Privilege', image: '/images/defaults/event.jpg', category: 'Nightlife', interested: 456 },
      { id: 'm5', title: 'Chutney Music Night', date: 'Apr 5', location: 'Carib Hotel', image: '/images/defaults/event.jpg', category: 'Music', interested: 312 },
      { id: 'm6', title: 'Open Mic Poetry Slam', date: 'Mar 25', location: 'Sidewalk Cafe', image: '/images/defaults/event.jpg', category: 'Art', interested: 78 },
    ],
  },
  {
    title: 'Food & Drink',
    icon: <Utensils className="w-5 h-5 text-amber-400" />,
    events: [
      { id: 'f1', title: 'Berbice Curry Festival', date: 'Apr 12', location: 'New Amsterdam', image: '/images/defaults/event.jpg', category: 'Food', interested: 567 },
      { id: 'f2', title: 'Rum Tasting Experience', date: 'Mar 29', location: 'DDL Heritage Centre', image: '/images/defaults/event.jpg', category: 'Drink', interested: 234 },
      { id: 'f3', title: 'Vegan Cook-Off', date: 'Apr 8', location: 'Oasis Cafe', image: '/images/defaults/event.jpg', category: 'Food', interested: 189 },
      { id: 'f4', title: 'Street Food Crawl', date: 'Every Saturday', location: 'Sheriff Street', image: '/images/defaults/event.jpg', category: 'Food', interested: 445, price: '$3,000 GYD' },
      { id: 'f5', title: 'Cocktail Masterclass', date: 'Apr 3', location: 'Pegasus Hotel', image: '/images/defaults/event.jpg', category: 'Drink', interested: 123, price: '$5,000 GYD' },
    ],
  },
  {
    title: 'Cultural & Heritage',
    icon: <Palette className="w-5 h-5 text-rose-400" />,
    events: [
      { id: 'c1', title: 'Phagwah Festival 2026', date: 'Mar 14', location: 'Nationwide', image: '/images/defaults/event.jpg', category: 'Festival', interested: 2134, isFeatured: true },
      { id: 'c2', title: 'Amerindian Heritage Month Opening', date: 'Sep 1', location: 'Umana Yana', image: '/images/defaults/event.jpg', category: 'Cultural', interested: 876 },
      { id: 'c3', title: 'Diwali Night Market', date: 'Oct 20', location: 'Anna Regina', image: '/images/defaults/event.jpg', category: 'Festival', interested: 1456 },
      { id: 'c4', title: 'Heritage Walking Tour', date: 'Every Sunday', location: 'Georgetown', image: '/images/defaults/event.jpg', category: 'Cultural', interested: 67, price: '$1,000 GYD' },
      { id: 'c5', title: 'Indigenous Art Exhibition', date: 'Apr 15-30', location: 'Walter Roth Museum', image: '/images/defaults/event.jpg', category: 'Art', interested: 234 },
    ],
  },
  {
    title: 'Free Events',
    icon: <Ticket className="w-5 h-5 text-green-400" />,
    events: [
      { id: 'fr1', title: 'Sunrise Meditation Circle', date: 'Every Morning', location: 'Botanical Gardens', image: '/images/defaults/event.jpg', category: 'Wellness', interested: 145, price: 'Free' },
      { id: 'fr2', title: 'Beach Cleanup & Bonfire', date: 'Mar 22', location: 'Shell Beach', image: '/images/defaults/event.jpg', category: 'Community', interested: 234, price: 'Free' },
      { id: 'fr3', title: 'Open Air Cinema Night', date: 'Apr 10', location: 'National Park', image: '/images/defaults/event.jpg', category: 'Entertainment', interested: 567, price: 'Free' },
      { id: 'fr4', title: 'Community Sports Day', date: 'Mar 29', location: 'Everest Cricket Club', image: '/images/defaults/event.jpg', category: 'Sports', interested: 312, price: 'Free' },
      { id: 'fr5', title: 'Library Story Hour', date: 'Every Saturday', location: 'National Library', image: '/images/defaults/event.jpg', category: 'Family', interested: 89, price: 'Free' },
      { id: 'fr6', title: 'Farmers Market', date: 'Every Sunday', location: 'Bourda Market', image: '/images/defaults/event.jpg', category: 'Market', interested: 456, price: 'Free' },
    ],
  },
  {
    title: 'Family Friendly',
    icon: <Baby className="w-5 h-5 text-sky-400" />,
    events: [
      { id: 'k1', title: 'Guyana Zoo Family Day', date: 'Mar 22', location: 'Georgetown Zoo', image: '/images/defaults/event.jpg', category: 'Family', interested: 432 },
      { id: 'k2', title: 'Kids Science Fair', date: 'Apr 5', location: 'University of Guyana', image: '/images/defaults/event.jpg', category: 'Education', interested: 267 },
      { id: 'k3', title: 'Puppet Show Theatre', date: 'Mar 29', location: 'Theatre Guild', image: '/images/defaults/event.jpg', category: 'Entertainment', interested: 178 },
      { id: 'k4', title: 'Easter Egg Hunt 2026', date: 'Apr 6', location: 'Promenade Gardens', image: '/images/defaults/event.jpg', category: 'Family', interested: 567, isFeatured: true },
      { id: 'k5', title: 'Junior Cricket Camp', date: 'Apr 14-18', location: 'Bourda Ground', image: '/images/defaults/event.jpg', category: 'Sports', interested: 145, price: '$3,000 GYD' },
    ],
  },
]

// Category color map
const CATEGORY_COLORS: Record<string, string> = {
  Festival: 'bg-amber-500/90',
  Music: 'bg-purple-500/90',
  Cultural: 'bg-rose-500/90',
  'Food & Drink': 'bg-orange-500/90',
  Food: 'bg-orange-500/90',
  Drink: 'bg-amber-600/90',
  Nightlife: 'bg-violet-500/90',
  Wellness: 'bg-teal-500/90',
  Art: 'bg-pink-500/90',
  Market: 'bg-lime-600/90',
  Tech: 'bg-blue-500/90',
  Comedy: 'bg-yellow-500/90',
  Sports: 'bg-green-500/90',
  Fashion: 'bg-fuchsia-500/90',
  Family: 'bg-sky-500/90',
  Education: 'bg-indigo-500/90',
  Entertainment: 'bg-red-500/90',
  Community: 'bg-emerald-500/90',
}

// ─── Hero Banner ────────────────────────────────────────────────────
function HeroBanner() {
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
        setCurrent(prev => (prev + 1) % HERO_EVENTS.length)
      }
    }, 50)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current, startTimer])

  const goTo = (idx: number) => {
    setCurrent(idx)
  }

  const event = HERO_EVENTS[current]

  return (
    <>
      {/* ── Mobile Hero: Compact Netflix-style ── */}
      <div className="md:hidden relative w-full pt-14">
        {/* Featured card - compact */}
        <div className="relative mx-4 rounded-xl overflow-hidden aspect-[16/10]">
          {HERO_EVENTS.map((e, i) => (
            <div
              key={e.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={e.image || getFallbackImage(e.category, 'event')}
                alt={e.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw"
                priority={i === 0}
              />
            </div>
          ))}
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Badge */}
          <div className="absolute top-3 left-3 flex items-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${CATEGORY_COLORS[event.category] || 'bg-emerald-500/90'}`}>
              {event.category}
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4" key={event.id}>
            <h2 className="text-xl font-bold text-white leading-tight mb-1">
              {event.title}
            </h2>
            <p className="text-xs text-white/60 mb-3 line-clamp-1">
              {event.date} · {event.location}
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-md">
                <Ticket className="w-3.5 h-3.5" />
                Get Tickets
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-md border border-white/20">
                <Info className="w-3.5 h-3.5" />
                Info
              </button>
              <button className="ml-auto p-2 text-white/60">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {HERO_EVENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop Hero: Full cinematic ── */}
      <div className="hidden md:block relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        {HERO_EVENTS.map((e, i) => (
          <div
            key={e.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={e.image}
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
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-4 ${CATEGORY_COLORS[event.category] || 'bg-emerald-500/90'}`}>
              <PartyPopper className="w-3.5 h-3.5" />
              {event.category}
            </span>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {event.title}
            </h1>
            <p className="text-xl text-white/70 font-medium mb-4">{event.tagline}</p>
            <p className="text-base text-white/50 max-w-lg mb-6 line-clamp-2">{event.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" />
                {event.interested.toLocaleString()} interested
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-all text-sm">
                <Ticket className="w-5 h-5" />
                Get Tickets
              </button>
              <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all text-sm">
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-12 lg:left-16 flex items-center gap-2">
          {HERO_EVENTS.map((_, i) => (
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

// ─── Mobile Compact Card (Netflix landscape thumbnail) ──────────────
function MobileEventCard({ event }: { event: MockEvent }) {
  return (
    <div className="relative flex-shrink-0 w-[130px] cursor-pointer group">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden shadow-md shadow-black/40 group-active:scale-95 transition-transform">
        <Image
          src={event.image || getFallbackImage(event.category, 'event')}
          alt={event.title}
          fill
          className="object-cover"
          sizes="130px"
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Countdown / Live badge */}
        {event.isLive && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-bold rounded flex items-center gap-0.5">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1 w-1 bg-white" />
            </span>
            LIVE
          </div>
        )}
        {event.daysAway && !event.isLive && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-bold rounded">
            {event.daysAway}
          </div>
        )}

        {/* Featured / Price badges */}
        {event.isFeatured && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-amber-500 text-black text-[8px] font-bold rounded flex items-center gap-0.5">
            <Star className="w-2 h-2" />
            HOT
          </div>
        )}
        {event.price && !event.isFeatured && (
          <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold rounded ${event.price === 'Free' ? 'bg-green-500 text-white' : 'bg-white/90 text-black'}`}>
            {event.price}
          </div>
        )}

        {/* Bottom text */}
        <div className="absolute bottom-0 inset-x-0 p-2">
          <h3 className="text-white font-semibold text-[11px] leading-tight line-clamp-2">
            {event.title}
          </h3>
        </div>
      </div>
      {/* Category below card */}
      <p className="text-[10px] text-white/40 mt-1 truncate">{event.category}</p>
    </div>
  )
}

// ─── Desktop Poster Card (original style) ───────────────────────────
function DesktopEventPosterCard({ event }: { event: MockEvent }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 w-[200px] md:w-[220px] group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${hovered ? 'scale-105 shadow-2xl shadow-black/60 z-20 ring-2 ring-white/20' : 'shadow-lg shadow-black/40'}`}>
        <Image src={event.image} alt={event.title} fill className="object-cover" sizes="220px" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {event.daysAway && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md shadow-lg">
            {event.daysAway}
          </div>
        )}
        {event.isLive && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            LIVE
          </div>
        )}
        {event.isFeatured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-md shadow-lg flex items-center gap-1">
            <Star className="w-2.5 h-2.5" />
            HOT
          </div>
        )}
        {event.price && (
          <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md shadow-lg ${event.price === 'Free' ? 'bg-green-500 text-white' : 'bg-white/90 text-black'}`}>
            {event.price}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-3">
          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-2 ${CATEGORY_COLORS[event.category] || 'bg-emerald-500/90'}`}>
            {event.category}
          </span>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
            <Calendar className="w-3 h-3" />
            {event.date}
          </div>
        </div>

        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-3 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className={`inline-block w-fit px-2 py-0.5 rounded text-[9px] font-bold text-white mb-2 ${CATEGORY_COLORS[event.category] || 'bg-emerald-500/90'}`}>
            {event.category}
          </span>
          <h3 className="text-white font-bold text-sm leading-tight mb-2">{event.title}</h3>
          <div className="space-y-1 text-[11px] text-white/70 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {event.date}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              {event.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-rose-400" />
              {event.interested} interested
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-400 transition-colors">
              <Ticket className="w-3 h-3" />
              View
            </button>
            <button className="p-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition-colors border border-white/20">
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Scrollable Row ─────────────────────────────────────────────────
function EventRow({ title, icon, events }: { title: string; icon: React.ReactNode; events: MockEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  return (
    <div className="relative group/row mb-5 md:mb-10">
      {/* Row Header */}
      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 px-4 md:px-12 lg:px-16">
        <span className="md:block hidden">{icon}</span>
        <h2 className="text-sm md:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/30 group-hover/row:text-emerald-400 group-hover/row:translate-x-1 transition-all" />
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow - desktop only */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Right Arrow - desktop only */}
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
          {events.map(event => (
            <div key={event.id} style={{ scrollSnapAlign: 'start' }}>
              {/* Mobile: compact cards / Desktop: poster cards */}
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
function TopBar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filters = ['All', 'This Week', 'This Month', 'Free']

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 md:from-black/60 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 lg:px-16 h-12 md:h-16">
        {/* Left: Title */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile: Netflix-style profile title */}
          <h1 className="md:hidden text-lg font-bold text-white">
            For You
          </h1>
          {/* Desktop: Events with icon */}
          <h1 className="hidden md:flex text-xl font-bold text-white items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Events
          </h1>
          <div className="hidden md:flex items-center gap-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Mobile: Netflix-style icon row */}
          <button className="md:hidden p-2 text-white/80">
            <Bell className="w-5 h-5" />
          </button>
          <button className="md:hidden p-2 text-white/80">
            <Download className="w-5 h-5" />
          </button>

          {searchOpen ? (
            <div className="flex items-center bg-black/80 border border-white/20 rounded-lg overflow-hidden">
              <Search className="w-4 h-4 text-white/50 ml-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search events..."
                className="bg-transparent text-white text-sm px-3 py-2 w-40 md:w-64 outline-none placeholder:text-white/30"
              />
              <button onClick={() => setSearchOpen(false)} className="p-2 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-white/80 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Nav (Netflix-style) ──────────────────────────────
function MobileBottomNav() {
  const [active, setActive] = useState('home')

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5">
      <div className="flex items-center justify-around h-14 px-4">
        <button
          onClick={() => setActive('home')}
          className={`flex flex-col items-center gap-0.5 min-w-[60px] ${active === 'home' ? 'text-white' : 'text-white/40'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          onClick={() => setActive('new')}
          className={`flex flex-col items-center gap-0.5 min-w-[60px] ${active === 'new' ? 'text-white' : 'text-white/40'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-medium">New & Hot</span>
        </button>
        <button
          onClick={() => setActive('my')}
          className={`flex flex-col items-center gap-0.5 min-w-[60px] relative ${active === 'my' ? 'text-white' : 'text-white/40'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">My Events</span>
          {/* Notification dot */}
          <div className="absolute top-0 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        </button>
      </div>
      {/* Safe area spacer */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function NetflixEventsConceptPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Override bottom nav and header for this page */}
      <style jsx global>{`
        header, nav, footer,
        [class*="BottomNav"], [class*="bottom-nav"],
        [class*="Header"], [class*="header"] {
          display: none !important;
        }
        body {
          background: #0a0a0a !important;
          padding-bottom: 0 !important;
        }
        /* Hide scrollbar for rows */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <TopBar />
      <HeroBanner />

      {/* Event Rows */}
      <div className="relative z-10 mt-4 md:-mt-12 pt-2 md:pt-4 pb-20 md:pb-24">
        {MOCK_ROWS.map(row => (
          <EventRow key={row.title} {...row} />
        ))}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Mockup Watermark - desktop only */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 text-white/40 text-xs font-medium">
        Concept Mockup — Not Final
      </div>
    </div>
  )
}
