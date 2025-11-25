import Link from 'next/link'

export function FooterMinimal() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold">
              Waypoint
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Guyana&apos;s discovery platform. Find businesses, experiences, stays, and events — connect instantly via WhatsApp.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/businesses" className="hover:text-white transition-colors">
                  Businesses
                </Link>
              </li>
              <li>
                <Link href="/tourism" className="hover:text-white transition-colors">
                  Experiences
                </Link>
              </li>
              <li>
                <Link href="/rentals" className="hover:text-white transition-colors">
                  Stays
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* List with us */}
          <div>
            <h3 className="font-semibold mb-4">List with us</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/dashboard/my-business" className="hover:text-white transition-colors">
                  Add your business
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-tourism" className="hover:text-white transition-colors">
                  Add your experience
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-rentals" className="hover:text-white transition-colors">
                  List your property
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-events" className="hover:text-white transition-colors">
                  Post an event
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a
                  href="https://wa.me/5925551234?text=Hi, I have a question about Waypoint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Waypoint. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <span>Made in Guyana</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
