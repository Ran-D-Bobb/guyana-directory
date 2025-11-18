import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from './AuthButton'
import { UserMenu } from './UserMenu'
import { BottomNav } from './BottomNav'
import { isAdmin } from '@/lib/admin'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userIsAdmin = isAdmin(user)

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform hover:scale-105"
            >
              <Image
                src="/waypoint-logo.png"
                alt="Waypoint Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Waypoint
              </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {!user ? (
                // Guest User Navigation
                <>
                  <Link
                    href="/tourism"
                    className="hidden sm:block text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50"
                  >
                    Tourism
                  </Link>
                  <Link
                    href="/events"
                    className="hidden sm:block text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50"
                  >
                    Events
                  </Link>
                  <AuthButton user={user} />
                </>
              ) : (
                // Authenticated User Navigation (Desktop only)
                <>
                  <Link
                    href="/tourism"
                    className="hidden lg:block text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50"
                  >
                    Tourism
                  </Link>
                  <Link
                    href="/events"
                    className="hidden lg:block text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50"
                  >
                    Events
                  </Link>
                  <UserMenu user={user} isAdmin={userIsAdmin} />
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Bottom Navigation - Mobile Only (Authenticated Users) */}
      {user && <BottomNav isAdmin={userIsAdmin} />}
    </>
  )
}
