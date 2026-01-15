import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Compass, Key, Calendar, ArrowRight } from 'lucide-react'

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
    icon: ShoppingBag,
    title: 'Shopping',
    description: 'Shops, restaurants, services & more',
    href: '/businesses',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    gradient: 'from-amber-500 to-orange-500',
    countKey: 'businesses' as const,
  },
  {
    icon: Compass,
    title: 'Explore',
    description: 'Tours, adventures & cool things to do',
    href: '/tourism',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
    gradient: 'from-emerald-500 to-teal-500',
    countKey: 'experiences' as const,
  },
  {
    icon: Key,
    title: 'Stays',
    description: 'Places to crash, short or long term',
    href: '/rentals',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    gradient: 'from-blue-500 to-indigo-500',
    countKey: 'rentals' as const,
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'What\'s happening around you',
    href: '/events',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
    gradient: 'from-purple-500 to-pink-500',
    countKey: 'events' as const,
  },
]

export function CategoryPillars({ counts }: CategoryPillarsProps) {
  return (
    <section className="py-12 md:py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Decorative background elements - smaller on mobile */}
      <div className="absolute top-0 left-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[150px] md:w-[400px] h-[150px] md:h-[400px] bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header - more compact on mobile */}
        <div className="max-w-3xl mb-8 md:mb-16 animate-fade-up">
          <span className="text-emerald-600 font-semibold text-xs md:text-sm uppercase tracking-wider mb-2 md:mb-3 block">
            Browse by category
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display text-gray-900 mb-2 md:mb-6">
            Explore Guyana
          </h2>
          <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
            Everything you need to discover, book, and connect
          </p>
        </div>

        {/* Pillars grid - 2 cols mobile, 4 cols tablet+ with fluid gaps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {pillars.map((pillar, index) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group relative block rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden aspect-[3/4] animate-fade-up touch-manipulation active:scale-[0.98]"
              style={{ animationDelay: `${100 + index * 100}ms` }}
            >
              {/* Background image */}
              <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Colored tint on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t ${pillar.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              {/* Content - more compact on mobile */}
              <div className="absolute inset-0 p-3 md:p-5 lg:p-6 flex flex-col justify-end">
                {/* Icon - smaller on mobile */}
                <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${pillar.gradient} rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <pillar.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-base md:text-xl lg:text-2xl font-display font-semibold text-white mb-0.5 md:mb-2">
                  {pillar.title}
                </h3>

                {/* Description - hidden on small mobile */}
                <p className="text-white/80 text-[10px] md:text-sm mb-2 md:mb-4 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">
                  {pillar.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-[10px] md:text-sm font-medium">
                    {counts[pillar.countKey].toLocaleString()} listings
                  </span>
                  <div className="hidden md:flex items-center gap-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA - more compact on mobile */}
        <div className="mt-8 md:mt-16 text-center animate-fade-up delay-500">
          <p className="text-gray-500 mb-2 md:mb-4 text-sm md:text-base">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group text-sm md:text-base"
          >
            Search everything
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
