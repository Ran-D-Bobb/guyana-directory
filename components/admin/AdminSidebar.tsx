'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Compass,
  Home,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Menu,
  X,
  Users,
  Star,
  Activity,
  Clock,
  ClipboardList,
  ImageIcon,
  FolderOpen,
  MapPin,
  FileWarning,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  badgeColor?: string
}

interface AdminSidebarProps {
  pendingTourism?: number
  flaggedRentals?: number
  flaggedPhotos?: number
}

export function AdminSidebar({ pendingTourism = 0, flaggedRentals = 0, flaggedPhotos = 0 }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Businesses', href: '/admin/businesses', icon: Building2 },
    { label: 'Events', href: '/admin/events', icon: Calendar },
    { label: 'Timeline', href: '/admin/timeline', icon: Clock },
    {
      label: 'Tourism',
      href: '/admin/tourism',
      icon: Compass,
      badge: pendingTourism > 0 ? pendingTourism : undefined,
      badgeColor: 'bg-orange-500'
    },
    {
      label: 'Rentals',
      href: '/admin/rentals',
      icon: Home,
      badge: flaggedRentals > 0 ? flaggedRentals : undefined,
      badgeColor: 'bg-red-500'
    },
  ]

  const secondaryNavItems: NavItem[] = [
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    {
      label: 'Photos',
      href: '/admin/photos',
      icon: ImageIcon,
      badge: flaggedPhotos > 0 ? flaggedPhotos : undefined,
      badgeColor: 'bg-orange-500'
    },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Regions', href: '/admin/regions', icon: MapPin },
    { label: 'Data Quality', href: '/admin/data-quality', icon: FileWarning },
    { label: 'Audit Log', href: '/admin/audit-log', icon: ClipboardList },
    { label: 'Analytics', href: '/admin/analytics', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <Link
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          'hover:bg-white/10',
          active && 'bg-white/15 shadow-lg shadow-white/5',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
          active ? 'bg-white text-slate-900' : 'text-slate-300 group-hover:text-white'
        )}>
          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
          {item.badge && (
            <span className={cn(
              'absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center',
              'text-[10px] font-bold text-white rounded-full px-1',
              item.badgeColor || 'bg-red-500'
            )}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>

        {!collapsed && (
          <>
            <span className={cn(
              'font-medium transition-colors',
              active ? 'text-white' : 'text-slate-300 group-hover:text-white'
            )}>
              {item.label}
            </span>
            {active && (
              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
            {item.label}
            {item.badge && (
              <span className={cn('ml-2 px-1.5 py-0.5 text-xs rounded-full', item.badgeColor)}>
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section with Collapse Toggle */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-6 border-b border-white/10',
        collapsed && 'flex-col gap-4 px-2'
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
            <Building2 className="text-white" size={22} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight">Guyana</span>
              <span className="text-xs text-slate-400">Admin Panel</span>
            </div>
          )}
        </div>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors',
            !collapsed && 'ml-auto'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Search */}
      {!collapsed && (
        <div className="px-4 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 text-sm transition-colors">
            <Search size={16} />
            <span>Quick search...</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-white/10 rounded">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Main Navigation - Fully Scrollable */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className={cn('mb-4', !collapsed && 'px-1')}>
          {!collapsed && (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Main Menu
            </span>
          )}
        </div>
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <div className={cn('pt-6 mb-4', !collapsed && 'px-1')}>
          {!collapsed && (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </span>
          )}
        </div>
        {secondaryNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/5 transition-all duration-300 flex-shrink-0 overflow-y-auto',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
