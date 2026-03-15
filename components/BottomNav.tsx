'use client'

import Link from 'next/link'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin?: boolean
}

// Custom SVG icons for each nav item
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V19a1 1 0 001 1h4v-5a1 1 0 011-1h2a1 1 0 011 1v5h4a1 1 0 001-1V9.5" />
    </svg>
  )
}

function NearMeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 018 8c0 5.4-8 12-8 12S4 15.4 4 10a8 8 0 018-8z" />
    </svg>
  )
}

function BusinessesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <path d="M12 12v.01" />
      <path d="M2 12h20" />
    </svg>
  )
}

function ExperiencesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <circle cx="12" cy="12" r="9" />
      <polygon points="14.5,9.5 9.5,14.5 10.5,10.5 14.5,9.5" fill="currentColor" stroke="none" />
      <path d="M16.24 7.76l-4.24 2.48-2.48 4.24 4.24-2.48z" />
    </svg>
  )
}

function EventsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function StaysIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M2 17v3h20v-3" />
      <path d="M2 17V10a1 1 0 011-1h3v5h12V9h3a1 1 0 011 1v7" />
      <path d="M6 9V6a2 2 0 012-2h8a2 2 0 012 2v3" />
      <path d="M6 14h12" />
    </svg>
  )
}

const NAV_ICON_MAP: Record<string, React.ComponentType<{ active: boolean }>> = {
  home: HomeIcon,
  nearMe: NearMeIcon,
  businesses: BusinessesIcon,
  experiences: ExperiencesIcon,
  events: EventsIcon,
  stays: StaysIcon,
}

export function BottomNav({}: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

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
      key: 'home' as const,
      href: '/',
      isActive: pathname === '/',
    },
    {
      key: 'nearMe' as const,
      href: '/discover',
      isActive: pathname.startsWith('/discover'),
    },
    {
      key: 'businesses' as const,
      href: '/businesses',
      isActive: pathname.startsWith('/businesses'),
    },
    {
      key: 'experiences' as const,
      href: '/tourism',
      isActive: pathname.startsWith('/tourism'),
    },
    {
      key: 'events' as const,
      href: '/events',
      isActive: pathname.startsWith('/events') && !pathname.includes('my-events'),
    },
    {
      key: 'stays' as const,
      href: '/rentals',
      isActive: pathname.startsWith('/rentals'),
    },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.isActive
          const Icon = NAV_ICON_MAP[item.key]

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg transition-all',
                'w-[52px] h-[52px] active:scale-95 touch-manipulation',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <Icon active={isActive} />
              <span
                className={cn(
                  'text-[10px] leading-none transition-colors',
                  isActive ? 'font-bold' : 'font-medium'
                )}
              >
                {t(item.key)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
