'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Calendar } from 'lucide-react'

export function TimelineBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <Link href="/events/timeline" className="block group">
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80"
              alt="Guyana Festivals"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-900/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated golden particles */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-amber-400/60"
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-amber-300/40"
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-yellow-400/50"
              animate={{
                y: [0, -25, 0],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            {/* Glowing orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Text Content */}
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 backdrop-blur-sm rounded-full text-amber-300 text-xs sm:text-sm font-semibold border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Experience
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white font-bold leading-tight mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200">
                    Journey Through
                  </span>
                  <br />
                  Guyana&apos;s Annual Festivals
                </h2>

                <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-xl mb-4 lg:mb-0">
                  Explore an immersive timeline of our nation&apos;s most celebrated events.
                  From Mashramani&apos;s vibrant parades to Diwali&apos;s festival of lights.
                </p>
              </div>

              {/* Featured Events Preview */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Mini event cards */}
                <div className="flex -space-x-3">
                  {[
                    { month: 'FEB', name: 'Mashramani', color: 'from-orange-500 to-pink-500' },
                    { month: 'MAR', name: 'Phagwah', color: 'from-pink-500 to-purple-500' },
                    { month: 'NOV', name: 'Diwali', color: 'from-yellow-400 to-orange-500' },
                  ].map((event, i) => (
                    <motion.div
                      key={event.name}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-gradient-to-br ${event.color}`}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ y: -5, zIndex: 10 }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-[10px] font-bold opacity-80">{event.month}</span>
                        <span className="text-[8px] font-medium opacity-60 text-center px-1">{event.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  className="flex items-center gap-3 px-6 py-3 bg-white text-emerald-900 font-bold rounded-xl shadow-lg group-hover:shadow-xl transition-all group-hover:bg-amber-50"
                  whileHover={{ scale: 1.02 }}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Explore Timeline</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-900 font-bold rounded-xl shadow-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Explore Timeline</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Animated border effect on hover */}
          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-white/0 group-hover:border-white/20 transition-colors duration-300" />

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-2xl lg:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
