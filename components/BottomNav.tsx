'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home as HomeIcon, Calendar, Plane, Home, Building2 } from 'lucide-react'
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
      icon: HomeIcon,
      gradient: 'from-emerald-500 to-teal-500',
      isActive: pathname === '/',
    },
    {
      name: 'Businesses',
      href: '/businesses',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-500',
      isActive: pathname.startsWith('/businesses'),
    },
    {
      name: 'Tourism',
      href: '/tourism',
      icon: Plane,
      gradient: 'from-emerald-500 to-teal-500',
      isActive: pathname.startsWith('/tourism'),
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      isActive: pathname.startsWith('/events') && !pathname.includes('my-events'),
    },
    {
      name: 'Rentals',
      href: '/rentals',
      icon: Home,
      gradient: 'from-blue-500 to-indigo-500',
      isActive: pathname.startsWith('/rentals') && !pathname.includes('my-rentals'),
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-inset-bottom">
      {/* Gradient top border for premium feel */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-60" />

      <div className="flex items-center justify-around px-1 py-2.5 pb-safe max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl transition-all group relative',
                'min-w-[64px] active:scale-95 touch-manipulation',
                isActive && 'scale-105'
              )}
            >
              {/* Active indicator background */}
              {isActive && (
                <div className={cn(
                  'absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br',
                  item.gradient
                )} />
              )}

              {/* Icon container with gradient on active */}
              <div
                className={cn(
                  'relative p-2.5 rounded-xl transition-all duration-300',
                  isActive
                    ? cn('bg-gradient-to-br shadow-lg', item.gradient)
                    : 'bg-gray-100 group-hover:bg-gray-200'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Glow effect for active state */}
                {isActive && (
                  <div className={cn(
                    'absolute inset-0 rounded-xl blur-md opacity-50 bg-gradient-to-br',
                    item.gradient
                  )} />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-semibold transition-all relative z-10',
                  isActive
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-500 group-hover:text-gray-700'
                )}
              >
                {item.name}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div className={cn(
                  'absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gradient-to-r',
                  item.gradient,
                  'animate-pulse'
                )} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
