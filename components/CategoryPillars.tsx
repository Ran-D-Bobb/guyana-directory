import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Compass, Home, Calendar, ArrowRight } from 'lucide-react'

interface CategoryPillarsProps {
  counts: {
    businesses: number
    experiences: number
    rentals: number
    events: number
  }
}

const pillars = [
  {
    icon: TrendingUp,
    title: 'Businesses',
    description: 'Local shops, restaurants, services & more',
    href: '/businesses',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    gradient: 'from-amber-500 to-orange-500',
    countKey: 'businesses' as const,
  },
  {
    icon: Compass,
    title: 'Experiences',
    description: 'Tours, adventures & cultural activities',
    href: '/tourism',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
    gradient: 'from-emerald-500 to-teal-500',
    countKey: 'experiences' as const,
  },
  {
    icon: Home,
    title: 'Stays',
    description: 'Rentals, apartments & vacation homes',
    href: '/rentals',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    gradient: 'from-blue-500 to-indigo-500',
    countKey: 'rentals' as const,
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Concerts, festivals & happenings',
    href: '/events',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
    gradient: 'from-purple-500 to-pink-500',
    countKey: 'events' as const,
  },
]

export function CategoryPillars({ counts }: CategoryPillarsProps) {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 animate-fade-up">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
            Browse by category
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-gray-900 mb-6">
            Explore Guyana
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to discover, book, and connect — all in one place
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group relative block rounded-3xl overflow-hidden aspect-[3/4] animate-fade-up"
              style={{ animationDelay: `${100 + index * 100}ms` }}
            >
              {/* Background image */}
              <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Colored tint on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t ${pillar.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${pillar.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <pillar.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-display font-semibold text-white mb-2">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm font-medium">
                    {counts[pillar.countKey].toLocaleString()} listings
                  </span>
                  <div className="flex items-center gap-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-up delay-500">
          <p className="text-gray-500 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
          >
            Search everything
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
