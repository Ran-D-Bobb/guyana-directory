'use client'

import { Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface AdPlaceholderProps {
  variant?: 'horizontal' | 'vertical' | 'square'
  title?: string
  subtitle?: string
  theme?: 'gradient' | 'emerald' | 'amber' | 'blue' | 'purple'
}

export function AdPlaceholder({
  variant = 'horizontal',
  title = 'Your Business Here',
  subtitle = 'Reach thousands of customers',
  theme = 'gradient'
}: AdPlaceholderProps) {
  const themes = {
    gradient: 'from-purple-600 via-pink-600 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600'
  }

  const dimensions = {
    horizontal: 'min-h-[200px] md:min-h-[250px]',
    vertical: 'min-h-[400px] md:min-h-[500px]',
    square: 'aspect-square min-h-[300px]'
  }

  return (
    <section className={`relative ${dimensions[variant]} overflow-hidden rounded-3xl group cursor-pointer`}>
      <Link href="/dashboard/my-business" className="block h-full">
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themes[theme]} animate-gradient-shift`} />

        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        {/* Animated orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center p-8 md:p-12">
          {/* Icon */}
          <div className="w-20 h-20 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
          </div>

          {/* Text */}
          <h3 className="text-3xl md:text-4xl font-black text-white mb-3 drop-shadow-lg">
            {title}
          </h3>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-md drop-shadow">
            {subtitle}
          </p>

          {/* CTA Button */}
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all shadow-2xl group-hover:scale-105 group-hover:shadow-3xl">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            <span className="text-white font-bold text-lg">Feature Your Business</span>
          </div>

          {/* Pricing hint */}
          <p className="mt-4 text-white/70 text-sm">
            Starting at <span className="font-bold text-white">GYD 10,000/month</span>
          </p>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </Link>
    </section>
  )
}
