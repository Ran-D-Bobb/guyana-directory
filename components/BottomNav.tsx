'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home as HomeIcon, Calendar, User, Plane, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin: boolean
}

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      isActive: pathname === '/',
    },
    {
      name: 'Tourism',
      href: '/tourism',
      icon: Plane,
      isActive: pathname.startsWith('/tourism'),
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      isActive: pathname.startsWith('/events') && !pathname.includes('my-events'),
    },
    {
      name: 'Rentals',
      href: '/rentals',
      icon: Home,
      isActive: pathname.startsWith('/rentals') && !pathname.includes('my-rentals'),
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      isActive: pathname.startsWith('/dashboard'),
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all group min-w-[60px]',
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600 active:scale-95'
              )}
            >
              <div
                className={cn(
                  'relative transition-all',
                  isActive && 'scale-110'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive && 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-600" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-all',
                  isActive ? 'text-emerald-600 font-semibold' : 'text-gray-600'
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
