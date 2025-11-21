import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from './AuthButton'
import { UserMenu } from './UserMenu'
import { BottomNav } from './BottomNav'
import { isAdmin } from '@/lib/admin'
import { Plane, Calendar, Home as HomeIcon, Building2, Sparkles } from 'lucide-react'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userIsAdmin = isAdmin(user)

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-2xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section with Enhanced Design */}
            <Link
              href="/"
              className="flex items-center gap-3 group relative"
            >
              <div className="relative">
                {/* Animated gradient ring on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-gray-900 to-black shadow-lg shadow-black/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 border border-gray-700">
                  <Image
                    src="/waypoint-logo.png"
                    alt="Waypoint Logo"
                    width={80}
                    height={80}
                    className="h-16 w-16 md:h-20 md:w-20 object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Waypoint
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-500 tracking-wide uppercase hidden sm:block">
                  Discover Guyana
                </span>
              </div>
            </Link>

            {/* Center Navigation - Desktop Only */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 rounded-2xl px-2 py-2 border border-gray-200/50">
              <Link
                href="/businesses"
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-all duration-200 hover:bg-white hover:shadow-md"
              >
                <Building2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Businesses</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/tourism"
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-all duration-200 hover:bg-white hover:shadow-md"
              >
                <Plane className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Tourism</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/events"
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-white hover:shadow-md"
              >
                <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Events</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/rentals"
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-white hover:shadow-md"
              >
                <HomeIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Rentals</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {!user ? (
                // Guest User - Just Auth Button on Mobile
                <>
                  <AuthButton user={user} />
                </>
              ) : (
                // Authenticated User
                <>
                  {/* Featured Badge for Premium Users */}
                  {userIsAdmin && (
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg shadow-amber-500/30">
                      <Sparkles className="h-3 w-3" />
                      <span>Admin</span>
                    </div>
                  )}
                  <UserMenu user={user} isAdmin={userIsAdmin} />
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Sub-navigation bar with gradient accent */}
        <div className="hidden md:block h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-80" />
      </header>

      {/* Bottom Navigation - Mobile Only (All Users) */}
      <BottomNav isAdmin={userIsAdmin} />
    </>
  )
}
