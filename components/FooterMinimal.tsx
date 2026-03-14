import Link from 'next/link'
import { Mail, ArrowUpRight } from 'lucide-react'

const discoverLinks = [
  { label: 'Businesses', href: '/businesses' },
  { label: 'Experiences', href: '/tourism' },
  { label: 'Stays', href: '/rentals' },
  { label: 'Events', href: '/events' },
]

const listLinks = [
  { label: 'Add business', href: '/dashboard/my-business' },
  { label: 'Add experience', href: '/dashboard/my-tourism' },
  { label: 'List property', href: '/dashboard/my-rentals' },
  { label: 'Post event', href: '/dashboard/my-events' },
]

export function FooterMinimal() {
  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-28 lg:pb-10 relative z-10">
        {/* Top section: Brand + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-14">
          <div>
            <Link href="/" className="inline-block mb-2">
              <span className="text-xl md:text-2xl font-display font-semibold text-white">
                Waypoint
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Guyana&apos;s discovery platform for businesses, experiences, stays, and events.
            </p>
          </div>
          <a
            href="mailto:info@waypointguyana.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors text-sm font-medium self-start sm:self-auto"
          >
            <Mail className="w-4 h-4" />
            Contact us
          </a>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-14">
          {/* Discover */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Discover
            </h3>
            <ul className="space-y-3">
              {discoverLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* List with us */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              List with us
            </h3>
            <ul className="space-y-3">
              {listLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company - visible on md+ to fill the grid nicely */}
          <div className="hidden md:block">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay connected */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Stay connected
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Follow us for exclusive deals and updates.
            </p>
            <a
              href="mailto:info@waypointguyana.com"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Get in touch
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Made with pride in Guyana</span>
          </div>
          <div className="flex items-center gap-4 md:hidden text-gray-600 text-xs">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Waypoint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
