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
import { User as UserIcon, Building2, Calendar, Compass, Shield, LogOut } from 'lucide-react'
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
      <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full">
        <div className="flex items-center gap-2 group">
          <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-emerald-500/50 transition-all cursor-pointer">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
              {getInitials(user.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
            {userName}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/my-business" className="cursor-pointer flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>My Business</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/my-events" className="cursor-pointer flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>My Events</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/my-tourism" className="cursor-pointer flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span>My Tourism</span>
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer flex items-center gap-2 text-emerald-600">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
