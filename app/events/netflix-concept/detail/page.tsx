'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar, MapPin, Clock, ChevronLeft, ChevronRight,
  Heart, Users, Share2, Ticket, Star, Plus,
  Building2, Phone, Mail, Globe, ArrowLeft, Check,
  Sparkles, TrendingUp, Music
} from 'lucide-react'
import { getFallbackImage } from '@/lib/category-images'

// ─── Mock Event Data ────────────────────────────────────────────────
const EVENT = {
  id: '1',
  title: 'Caribbean Beats Festival 2026',
  tagline: 'Three Days of Non-Stop Music on the Demerara Coast',
  description: `The Caribbean Beats Festival returns for its biggest year yet. Over three exhilarating days, the Providence Stadium transforms into the ultimate music destination, featuring over 40 artists from across the Caribbean, Latin America, and beyond.

From soca and reggae to dancehall and afrobeats, every genre that makes the Caribbean pulse with life will be represented on our five stages. Experience world-class sound systems, stunning light shows, and an electric atmosphere that only Guyana can deliver.

This year's lineup includes headliners from Trinidad, Jamaica, Barbados, and Guyana's own rising stars. Beyond the music, enjoy Caribbean street food from 30+ vendors, craft cocktail bars, art installations, and a cultural village celebrating the diversity of the region.

Whether you're a die-hard festival-goer or experiencing your first Caribbean music event, this is the weekend you don't want to miss.`,
  date: 'March 15-17, 2026',
  startDate: 'Saturday, March 15, 2026',
  endDate: 'Monday, March 17, 2026',
  time: '2:00 PM - 11:00 PM daily',
  location: 'Providence Stadium, East Bank Demerara',
  image: '/images/defaults/event.jpg',
  category: 'Music Festival',
  interested: 1523,
  views: 8742,
  isFeatured: true,
  organizer: {
    name: 'Caribbean Events Co.',
    type: 'business' as const,
    image: '/images/defaults/business-office.jpg',
    phone: '+592 222 3456',
    email: 'info@caribbeanbeats.gy',
    website: 'caribbeanbeats.gy',
  },
  schedule: [
    { day: 'Day 1 - Fri', title: 'Opening Night', desc: 'Local artists & DJs kick off the festival', time: '4 PM - 11 PM' },
    { day: 'Day 2 - Sat', title: 'Main Stage Takeover', desc: 'Headliners & international acts', time: '2 PM - 12 AM' },
    { day: 'Day 3 - Sun', title: 'Grand Finale', desc: 'All-star closing performances', time: '2 PM - 11 PM' },
  ],
  tags: ['Soca', 'Reggae', 'Dancehall', 'Afrobeats', 'Live Music', 'Festival', 'Outdoor'],
  pricing: [
    { tier: 'General Admission', price: '$8,000 GYD', perDay: '$3,500 GYD/day' },
    { tier: 'VIP Experience', price: '$25,000 GYD', perDay: 'Includes lounge access' },
    { tier: 'Premium Front Row', price: '$40,000 GYD', perDay: 'Meet & greet included' },
  ],
}

const RELATED_EVENTS = [
  { id: 'r1', title: 'Soca Monarch Finals', date: 'Apr 2', image: '/images/defaults/event.jpg', category: 'Music', interested: 1567, location: 'National Stadium' },
  { id: 'r2', title: 'Reggae on the River', date: 'Mar 28', image: '/images/defaults/event.jpg', category: 'Music', interested: 743, location: 'Essequibo River' },
  { id: 'r3', title: 'DJ Puffy Live', date: 'Mar 30', image: '/images/defaults/event.jpg', category: 'Nightlife', interested: 456, location: 'Club Privilege' },
  { id: 'r4', title: 'Chutney Music Night', date: 'Apr 5', image: '/images/defaults/event.jpg', category: 'Music', interested: 312, location: 'Carib Hotel' },
  { id: 'r5', title: 'Acoustic Sessions at 704', date: 'Every Wed', image: '/images/defaults/event.jpg', category: 'Music', interested: 89, location: '704 Sports Bar' },
  { id: 'r6', title: 'Open Mic Poetry Slam', date: 'Mar 25', image: '/images/defaults/event.jpg', category: 'Art', interested: 78, location: 'Sidewalk Cafe' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Music: 'bg-purple-500/90',
  Nightlife: 'bg-violet-500/90',
  Art: 'bg-pink-500/90',
  Festival: 'bg-amber-500/90',
  'Music Festival': 'bg-purple-500/90',
}

// ─── Sticky Header ──────────────────────────────────────────────────
function DetailHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-16 h-14">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/events/netflix-concept"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Show title on scroll */}
          <div className={`min-w-0 transition-all duration-300 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <span className="text-sm font-bold text-white truncate block">
              {EVENT.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hero Backdrop ──────────────────────────────────────────────────
function HeroBackdrop() {
  return (
    <div className="relative w-full h-[55vh] min-h-[400px] max-h-[600px]">
      <Image
        src={EVENT.image || getFallbackImage(EVENT.category, 'event')}
        alt={EVENT.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-transparent" />
    </div>
  )
}

// ─── Related Event Card (Poster) ────────────────────────────────────
function RelatedCard({ event }: { event: typeof RELATED_EVENTS[0] }) {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-black/60 hover:ring-2 hover:ring-white/20 hover:z-20 transition-all duration-300 shadow-lg shadow-black/40">
        <Image src={event.image || getFallbackImage(event.category, 'event')} alt={event.title} fill className="object-cover" sizes="180px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-3">
          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-2 ${CATEGORY_COLORS[event.category] || 'bg-emerald-500/90'}`}>
            {event.category}
          </span>
          <h3 className="text-white font-bold text-xs leading-tight line-clamp-2 mb-1">{event.title}</h3>
          <div className="flex items-center gap-1 text-white/50 text-[10px]">
            <Calendar className="w-2.5 h-2.5" />
            {event.date}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Scrollable Row ─────────────────────────────────────────────────
function ScrollRow({ children }: { children: React.ReactNode }) {
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
    scrollRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main Detail Page ───────────────────────────────────────────────
export default function NetflixEventDetailPage() {
  const [interested, setInterested] = useState(false)
  const [myList, setMyList] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Override app chrome */}
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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <DetailHeader />
      <HeroBackdrop />

      {/* Content overlapping hero */}
      <div className="relative z-10 -mt-32 md:-mt-40 px-4 md:px-8 lg:px-16 pb-20 max-w-6xl mx-auto">

        {/* ── Title & Actions Section ── */}
        <div className="mb-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-500/90 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              {EVENT.category}
            </span>
            {EVENT.isFeatured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold text-black bg-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
              Upcoming
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {EVENT.title}
          </h1>
          <p className="text-base md:text-lg text-white/50 mb-6 max-w-2xl">
            {EVENT.tagline}
          </p>

          {/* Quick meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {EVENT.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              {EVENT.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              {EVENT.location}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary CTA - full width on mobile */}
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-all text-sm shadow-lg shadow-emerald-500/20">
              <Ticket className="w-5 h-5" />
              Get Tickets
            </button>
            {/* Secondary actions row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInterested(!interested)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-lg border text-sm transition-all ${
                  interested
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {interested ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                {interested ? 'Interested' : "I'm Interested"}
              </button>
              <button
                onClick={() => setMyList(!myList)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-lg border text-sm transition-all ${
                  myList
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/20 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {myList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                My List
              </button>
              <button className="p-3 bg-white/5 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex-shrink-0">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Social Proof Bar ── */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
            <Users className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold">{EVENT.interested.toLocaleString()} interested</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold">{EVENT.views.toLocaleString()} views</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EVENT.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs font-medium text-white/40 bg-white/5 rounded-full border border-white/10">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">

          {/* Left: About & Schedule */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-amber-400 rounded-full" />
                About This Event
              </h2>
              <div className="text-white/60 leading-relaxed whitespace-pre-line text-sm">
                {EVENT.description}
              </div>
            </section>

            {/* Schedule */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                Festival Schedule
              </h2>
              <div className="space-y-3">
                {EVENT.schedule.map((day, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all group"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">{day.day}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm mb-0.5">{day.title}</h3>
                      <p className="text-xs text-white/40">{day.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {day.time}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                Location
              </h2>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-lg flex-shrink-0">
                    <MapPin className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-1">{EVENT.location}</h3>
                    <p className="text-sm text-white/40">East Bank Demerara, Guyana</p>
                  </div>
                </div>
                {/* Placeholder map area */}
                <div className="mt-4 h-40 bg-white/[0.03] rounded-lg border border-white/5 flex items-center justify-center">
                  <span className="text-white/20 text-sm">Map placeholder</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Pricing Card */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400" />
                Tickets
              </h3>
              <div className="space-y-3">
                {EVENT.pricing.map((tier, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-white/[0.07] ${
                      i === 0
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : i === 1
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-purple-500/30 bg-purple-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{tier.tier}</span>
                      {i === 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">POPULAR</span>}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">{tier.price}</span>
                      <span className="text-xs text-white/30">{tier.perDay}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4" />
                Get Tickets Now
              </button>
            </div>

            {/* Organizer Card */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Organizer
              </h3>
              <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.03] rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                  <Image src={EVENT.organizer.image} alt={EVENT.organizer.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{EVENT.organizer.name}</p>
                  <p className="text-xs text-white/40">Event Organizer</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href={`tel:${EVENT.organizer.phone}`} className="flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors text-sm">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70">{EVENT.organizer.phone}</span>
                </a>
                <a href={`mailto:${EVENT.organizer.email}`} className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors text-sm">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span className="text-white/70">{EVENT.organizer.email}</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors text-sm">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-white/70">{EVENT.organizer.website}</span>
                </a>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Duration</span>
                  <span className="text-white font-medium">3 days</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/40">Stages</span>
                  <span className="text-white font-medium">5 stages</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/40">Artists</span>
                  <span className="text-white font-medium">40+ performers</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/40">Food Vendors</span>
                  <span className="text-white font-medium">30+ vendors</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/40">Age</span>
                  <span className="text-white font-medium">All ages welcome</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── More Like This (horizontal row) ── */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg md:text-xl font-bold text-white">More Like This</h2>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>
          <ScrollRow>
            {RELATED_EVENTS.map(event => (
              <div key={event.id} style={{ scrollSnapAlign: 'start' }}>
                <RelatedCard event={event} />
              </div>
            ))}
          </ScrollRow>
        </section>
      </div>

      {/* Mockup Watermark */}
      <div className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 text-white/40 text-xs font-medium">
        Concept Mockup — Event Detail
      </div>
    </div>
  )
}
