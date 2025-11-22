'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, MapPin, Calendar, Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)

  const rotatingWords = ['Businesses', 'Experiences', 'Rentals', 'Events']

  // Curated Guyana images from Unsplash
  const backgroundImages = [
    
    {
      url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80',
      alt: 'Guyana Rainforest',
      credit: 'Guyanese Rainforest'
    },
    {
      url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80',
      alt: 'Tropical Paradise',
      credit: 'Tropical Landscape'
    },
    {
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80',
      alt: 'Tropical Waterfall',
      credit: 'Tropical Waterfall'
    },
    {
      url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
      alt: 'Tropical Beach Paradise',
      credit: 'Caribbean Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
      alt: 'Mountain Landscape',
      credit: 'Natural Beauty'
    },
    {
      url: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=1920&q=80',
      alt: 'River Through Rainforest',
      credit: 'River Landscape'
    },
    {
      url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1920&q=80',
      alt: 'Tropical Sunset',
      credit: 'Golden Hour'
    },
    {
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
      alt: 'Lakeside Serenity',
      credit: 'Peaceful Waters'
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length)
    }, 8000) // Change image every 8 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const quickLinks = [
    { icon: TrendingUp, label: 'Businesses', href: '/businesses', color: 'from-amber-500 to-orange-500' },
    { icon: MapPin, label: 'Tourism', href: '/tourism', color: 'from-emerald-500 to-teal-500' },
    { icon: HomeIcon, label: 'Rentals', href: '/rentals', color: 'from-blue-500 to-indigo-500' },
    { icon: Calendar, label: 'Events', href: '/events', color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <section className="relative min-h-[65vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Rotating Background Images */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={image.url}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              quality={80}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Enhanced overlay for better text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-900/40 to-slate-950/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6 bg-white/15 backdrop-blur-md border border-white/30 rounded-full text-white text-xs md:text-sm font-medium animate-fade-in shadow-lg">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-300" />
          <span>Discover Guyana&apos;s Best</span>
        </div>

        {/* Main headline - optimized for mobile */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 md:mb-8 animate-fade-in leading-tight px-2">
          Discover Guyana&apos;s
          <br />
          <span className="relative inline-block mt-1 md:mt-2">
            <span className="bg-gradient-to-r from-green-600 via-amber-400 via-yellow-300 via-gray-900 via-white to-red-600 bg-clip-text text-transparent animate-scale-in drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" style={{ backgroundSize: '200% 100%' }}>
              {rotatingWords[currentWord]}
            </span>
            <div className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-green-600 via-amber-400 via-yellow-300 via-gray-900 via-white to-red-600 rounded-full animate-pulse" style={{ backgroundSize: '200% 100%' }} />
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg md:text-2xl text-gray-200 mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in font-light drop-shadow-lg px-4">
          Connect instantly via WhatsApp
        </p>

        {/* Quick links - optimized spacing for mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto animate-fade-in px-2">
          {quickLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/25 rounded-xl md:rounded-2xl p-4 md:p-8 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 hover:shadow-2xl touch-manipulation"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-110`}>
                  <link.icon className="w-6 h-6 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-white font-bold text-sm md:text-xl">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll indicator - hidden on small mobile */}
        <div className="mt-8 md:mt-16 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
