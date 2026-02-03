'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Compass, Calendar, Navigation, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin?: boolean
}

export function BottomNav({}: BottomNavProps) {
  const pathname = usePathname()

  // Hide bottom nav on form creation/edit pages for better UX
  const hideOnPaths = [
    '/dashboard/my-business/create',
    '/dashboard/my-business/edit',
    '/dashboard/my-events/create',
    '/dashboard/my-events/edit',
    '/dashboard/my-rentals/create',
    '/dashboard/my-rentals/edit',
  ]

  if (hideOnPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      name: 'Near Me',
      href: '/discover',
      icon: Navigation,
      isActive: pathname.startsWith('/discover'),
      highlight: true,
    },
    {
      name: 'Shopping',
      href: '/businesses',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/businesses'),
    },
    {
      name: 'Explore',
      href: '/tourism',
      icon: Compass,
      isActive: pathname.startsWith('/tourism'),
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      isActive: pathname.startsWith('/events') && !pathname.includes('my-events'),
    },
    {
      name: 'Stays',
      href: '/rentals',
      icon: Key,
      isActive: pathname.startsWith('/rentals'),
    },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 pb-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive
          const isHighlight = 'highlight' in item && item.highlight

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-colors',
                'min-w-[48px] min-h-[48px] active:scale-95 touch-manipulation',
                isActive
                  ? isHighlight
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-500 active:text-gray-700'
              )}
            >
              <Icon
                className={cn(
                  'h-[22px] w-[22px] transition-all',
                  isActive && 'transform scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[11px] leading-tight transition-colors',
                  isActive
                    ? 'font-semibold'
                    : 'font-medium'
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
