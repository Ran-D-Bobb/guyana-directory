import Link from 'next/link'
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
    description: 'Local shops, restaurants, and services',
    href: '/businesses',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    countKey: 'businesses' as const,
  },
  {
    icon: Compass,
    title: 'Experiences',
    description: 'Tours, adventures, and cultural activities',
    href: '/tourism',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    countKey: 'experiences' as const,
  },
  {
    icon: Home,
    title: 'Stays',
    description: 'Rentals, apartments, and vacation homes',
    href: '/rentals',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    countKey: 'rentals' as const,
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Concerts, festivals, and happenings',
    href: '/events',
    gradient: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50',
    countKey: 'events' as const,
  },
]

export function CategoryPillars({ counts }: CategoryPillarsProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by category
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to discover, book, and connect in Guyana
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className={`group block ${pillar.bgLight} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <pillar.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {pillar.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {pillar.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {counts[pillar.countKey].toLocaleString()} listings
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
