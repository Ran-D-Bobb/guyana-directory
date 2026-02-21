import Link from 'next/link'
import { Mail, ArrowUpRight } from 'lucide-react'

export function FooterMinimal() {
  return (
    <footer className="gradient-mesh-dark text-white relative overflow-hidden">
      {/* Decorative elements - smaller on mobile */}
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 pb-28 lg:pb-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-10 md:mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl font-display font-semibold text-white">
                Waypoint
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-4 md:mb-6 max-w-sm text-sm md:text-base">
              Guyana&apos;s premier discovery platform. Find businesses, experiences,
              stays, and events — all in one place.
            </p>

            {/* Email CTA */}
            <a
              href="mailto:info@waypointguyana.com"
              className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg md:rounded-xl transition-all duration-300 group text-sm md:text-base"
            >
              <Mail className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">Contact us</span>
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all hidden md:block" />
            </a>
          </div>

          {/* Discover column */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-semibold text-white mb-3 md:mb-5 text-xs md:text-sm uppercase tracking-wider">
              Discover
            </h3>
            <ul className="space-y-2 md:space-y-4">
              {[
                { label: 'Businesses', href: '/businesses' },
                { label: 'Experiences', href: '/tourism' },
                { label: 'Stays', href: '/rentals' },
                { label: 'Events', href: '/events' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-1 group text-sm md:text-base"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* List with us column */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="font-semibold text-white mb-3 md:mb-5 text-xs md:text-sm uppercase tracking-wider">
              List with us
            </h3>
            <ul className="space-y-2 md:space-y-4">
              {[
                { label: 'Add business', href: '/dashboard/my-business' },
                { label: 'Add experience', href: '/dashboard/my-tourism' },
                { label: 'List property', href: '/dashboard/my-rentals' },
                { label: 'Post event', href: '/dashboard/my-events' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-1 group text-sm md:text-base"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Highlight column - hidden on small mobile */}
          <div className="col-span-2 md:col-span-3">
            <h3 className="font-semibold text-white mb-3 md:mb-5 text-xs md:text-sm uppercase tracking-wider">
              Stay connected
            </h3>
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
              Follow us on social media for exclusive deals and updates.
            </p>
            <a
              href="mailto:info@waypointguyana.com"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-xs md:text-sm transition-colors group"
            >
              Get in touch
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} Waypoint. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-xs md:text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Made with pride in Guyana</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
