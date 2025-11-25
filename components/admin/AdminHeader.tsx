'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  userName?: string
  userEmail?: string
}

export function AdminHeader({
  title,
  subtitle,
  userName = 'Admin',
  userEmail = 'admin@guyana.com'
}: AdminHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, index) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      href: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1
    }))
  }

  const breadcrumbs = generateBreadcrumbs()

  const notifications = [
    { id: 1, title: 'New business pending approval', time: '5 min ago', unread: true },
    { id: 2, title: '3 new reviews submitted', time: '1 hour ago', unread: true },
    { id: 3, title: 'Tourism experience flagged', time: '3 hours ago', unread: false },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
      <div className="px-4 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-300">/</span>}
                {crumb.isLast ? (
                  <span className="font-medium text-slate-900">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 hover:text-slate-900 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Center: Search */}
          <div className={cn(
            'flex-1 max-w-md transition-all duration-200',
            searchFocused && 'max-w-xl'
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search businesses, events, users..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm',
                  'placeholder:text-slate-400',
                  'focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
                  'transition-all duration-200'
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-200/50 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-600/25">
                <Plus size={16} />
                <span className="hidden sm:inline">Add New</span>
                <ChevronDown size={14} className="hidden sm:inline" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <Link href="/admin/businesses/create" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">
                    Business
                  </Link>
                  <Link href="/admin/events/create" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">
                    Event
                  </Link>
                  <Link href="/admin/tourism/create" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">
                    Tourism Experience
                  </Link>
                </div>
              </div>
            </div>

            {/* View Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm transition-colors"
            >
              <ExternalLink size={16} />
              <span>View Site</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileOpen(false)
                }}
                className="relative flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        <button className="text-xs text-emerald-600 hover:text-emerald-700">Mark all read</button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={cn(
                            'w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left',
                            notif.unread && 'bg-emerald-50/50'
                          )}
                        >
                          <div className={cn(
                            'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                            notif.unread ? 'bg-emerald-500' : 'bg-slate-200'
                          )} />
                          <div>
                            <p className="text-sm text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{notif.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-slate-100">
                      <button className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationsOpen(false)
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0)}
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{userName}</p>
                          <p className="text-sm text-slate-500">{userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <User size={18} className="text-slate-400" />
                        <span className="text-sm">Profile</span>
                      </Link>
                      <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <Settings size={18} className="text-slate-400" />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <HelpCircle size={18} className="text-slate-400" />
                        <span className="text-sm">Help & Support</span>
                      </Link>
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Title Bar */}
        <div className="flex items-center justify-between py-4 lg:py-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
