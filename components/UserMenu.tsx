'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LayoutGrid, Heart, Shield, LogOut, ChevronRight, Building2, Star, BarChart3, Settings, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

interface UserMenuProps {
  user: User
  isAdmin: boolean
  accountType?: string | null
}

export function UserMenu({ user, isAdmin, accountType }: UserMenuProps) {
  const t = useTranslations('userMenu')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const userAvatar = user.user_metadata?.avatar_url
  const isBusiness = accountType === 'business'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--jungle-500))] focus-visible:ring-offset-2 rounded-full"
        aria-label={t('ariaLabel')}
      >
        <Avatar className="h-10 w-10 ring-2 ring-white/50 hover:ring-[hsl(var(--jungle-400))] transition-all duration-200 shadow-md cursor-pointer">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--jungle-500))] to-[hsl(var(--jungle-700))] text-white text-sm font-bold">
            {getInitials(user.user_metadata?.full_name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-2 shadow-2xl border border-gray-100 dark:border-white/10 bg-white/95 dark:bg-[hsl(0,0%,12%)]/95 backdrop-blur-xl rounded-2xl"
        sideOffset={12}
      >
        {/* Profile Link - Hero Style */}
        <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
          <Link
            href="/dashboard/profile"
            className="block p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--jungle-50))] to-white border border-[hsl(var(--jungle-100))] hover:border-[hsl(var(--jungle-200))] transition-all group mb-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-[hsl(var(--jungle-200))] shadow-sm">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--jungle-500))] to-[hsl(var(--jungle-700))] text-white font-bold">
                  {getInitials(user.user_metadata?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                <div className="flex items-center gap-1.5">
                  {accountType === 'business' && (
                    <Building2 className="w-3 h-3 text-[hsl(var(--jungle-600))]" />
                  )}
                  <p className="text-xs text-[hsl(var(--jungle-600))] font-medium">
                    {accountType === 'business' ? t('businessAccount') : t('personalAccount')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[hsl(var(--jungle-600))] group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </DropdownMenuItem>

        {/* Navigation - account type specific */}
        <div className="space-y-1">
          {isBusiness ? (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/my-business"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(var(--jungle-50))] transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[hsl(var(--jungle-100))] to-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="h-4.5 w-4.5 text-[hsl(var(--jungle-600))]" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('myBusiness')}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('manageListing')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/listings"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LayoutGrid className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('allListings')}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('allListingsDesc')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/my-business/analytics"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BarChart3 className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('dashboard')}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('analyticsInsights')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/saved"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart className="h-4.5 w-4.5 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('saved')}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('savedDesc')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Star className="h-4.5 w-4.5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('myReviews')}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('myReviewsDesc')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--jungle-600))] to-[hsl(var(--jungle-700))] hover:from-[hsl(var(--jungle-700))] hover:to-[hsl(var(--jungle-800))] transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shield className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-semibold text-white">{t('adminPanel')}</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-2" />

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
          }}
          className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/15 flex items-center justify-center transition-colors">
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-gray-500" />
            )}
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
            {resolvedTheme === 'dark' ? tCommon('lightMode') : tCommon('darkMode')}
          </span>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/15 flex items-center justify-center transition-colors">
              <Settings className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{t('settings')}</span>
          </Link>
        </DropdownMenuItem>

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/15 flex items-center justify-center transition-colors">
            <LogOut className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
