import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from './AuthButton'
import { UserMenu } from './UserMenu'
import { BottomNav } from './BottomNav'
import { isAdmin } from '@/lib/admin'
import { Compass, Calendar, Key, ShoppingBag, Sparkles, Navigation } from 'lucide-react'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userIsAdmin = isAdmin(user)

  // Fetch account type for authenticated users
  let accountType: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    accountType = profile?.account_type ?? null
  }

  return (
    <>
      {/* Top Header - Mobile: 56px, Desktop: 72px */}
      <header
        className="bg-white/95 backdrop-blur-xl shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-[72px]">
            {/* Logo Section - Compact on mobile */}
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 group relative"
            >
              <div className="relative">
                {/* Animated gradient ring on hover - desktop only */}
                <div className="absolute inset-0 rounded-lg md:rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 hidden md:block" />
                <div className="relative h-9 w-9 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-gradient-to-br from-gray-900 to-black shadow-md md:shadow-lg shadow-black/20 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 border border-gray-700">
                  <Image
                    src="/waypoint-logo.png"
                    alt="Waypoint Logo"
                    width={44}
                    height={44}
                    className="h-10 w-10 md:h-12 md:w-12 object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Waypoint
                </span>
                <span className="text-[10px] md:text-xs font-medium text-gray-500 tracking-wide uppercase hidden sm:block">
                  Discover Guyana
                </span>
              </div>
            </Link>

            {/* Center Navigation - Desktop Only */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 rounded-2xl px-2 py-2 border border-gray-200/50">
              <Link
                href="/discover"
                className="group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors hover:bg-white hover:shadow-md min-h-[44px]"
              >
                <Navigation className="h-4 w-4" />
                <span>Near Me</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/businesses"
                className="group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors hover:bg-white hover:shadow-md min-h-[44px]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shopping</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/tourism"
                className="group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors hover:bg-white hover:shadow-md min-h-[44px]"
              >
                <Compass className="h-4 w-4" />
                <span>Explore</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/events"
                className="group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors hover:bg-white hover:shadow-md min-h-[44px]"
              >
                <Calendar className="h-4 w-4" />
                <span>Events</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/rentals"
                className="group relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors hover:bg-white hover:shadow-md min-h-[44px]"
              >
                <Key className="h-4 w-4" />
                <span>Stays</span>
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
                  <UserMenu user={user} isAdmin={userIsAdmin} accountType={accountType} />
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Sub-navigation bar with gradient accent - desktop only */}
        <div className="hidden md:block h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-80" />
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      {/* Mobile: 56px + safe area, Desktop: 74px (72px + 2px gradient bar) */}
      <div
        className="h-14 md:h-[74px]"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      />

      {/* Bottom Navigation - Mobile Only (All Users) */}
      <BottomNav isAdmin={userIsAdmin} />
    </>
  )
}
