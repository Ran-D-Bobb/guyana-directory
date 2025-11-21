'use client'

import { TrendingUp, Users, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatsBarProps {
  businesses: number
  experiences: number
  rentals: number
  events: number
}

export function StatsBar({ businesses, experiences, rentals, events }: StatsBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { label: 'Businesses', value: businesses, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { label: 'Experiences', value: experiences, icon: Zap, color: 'from-emerald-500 to-teal-500' },
    { label: 'Properties', value: rentals, icon: Users, color: 'from-blue-500 to-indigo-500' },
    { label: 'Events', value: events, icon: Star, color: 'from-purple-500 to-pink-500' },
  ]

  const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      let start = 0
      const end = value
      const increment = end / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }, [value, duration])

    return <span>{count.toLocaleString()}</span>
  }

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden mb-0">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Powering Guyana&apos;s Discovery
          </h2>
          <p className="text-gray-300 text-lg">
            Join thousands already connecting through Waypoint
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl ${
                isVisible ? 'animate-scale-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity blur-xl`} />

              <div className="relative">
                <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>

                <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">
                  {isVisible ? <AnimatedNumber value={stat.value} /> : '0'}
                  <span className="text-2xl md:text-3xl">+</span>
                </div>

                <p className="text-gray-300 text-sm md:text-base font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>100% Free to Browse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-2000" />
            <span>WhatsApp Connect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-4000" />
            <span>Verified Listings</span>
          </div>
        </div>
      </div>
    </section>
  )
}
