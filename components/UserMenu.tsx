'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserIcon, Building2, Calendar, Compass, Home, Shield, LogOut, ChevronDown, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  user: User
  isAdmin: boolean
}

export function UserMenu({ user, isAdmin }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-full"
        aria-label="User menu"
      >
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 group">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 group-hover:ring-emerald-500 transition-all duration-200 shadow-sm">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold">
              {getInitials(user.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex items-center gap-1.5">
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors leading-none">
                {userName}
              </span>
              <span className="text-xs text-gray-500 leading-none mt-0.5">View profile</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-3 shadow-2xl border border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200"
        sideOffset={8}
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-3 bg-gray-50 border border-gray-100 rounded-xl mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-emerald-100 shadow-sm">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                {getInitials(user.user_metadata?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        {/* Navigation Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                <UserIcon className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/my-business"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                <Building2 className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">My Business</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/my-events"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-purple-200 group-hover:bg-purple-50 flex items-center justify-center transition-colors">
                <Calendar className="h-4 w-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">My Events</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/my-interested-events"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-amber-200 group-hover:bg-amber-50 flex items-center justify-center transition-colors">
                <Star className="h-4 w-4 text-gray-500 group-hover:text-amber-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">Interested Events</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/my-tourism"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-teal-200 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                <Compass className="h-4 w-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">My Tourism</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/my-rentals"
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <Home className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">My Rentals</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-emerald-700">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-2" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 hover:border-red-100 border border-transparent transition-colors group"
        >
          <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 flex items-center justify-center transition-colors">
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
