'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

interface AuthButtonProps {
  user: User | null
}

export function AuthButton({ user }: AuthButtonProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
      setIsLoading(false)
    }
  }

  // Don't render anything for authenticated users (UserMenu handles that)
  if (user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isLoading}
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 active:scale-95 text-sm md:text-base px-4 py-2 md:px-6 md:py-2.5 h-9 md:h-10 border-0 font-semibold tracking-wide"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative flex items-center gap-2">
            <svg
              className="h-4 w-4 md:h-4 md:w-4 transition-transform group-hover:rotate-12 duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-semibold">Sign In</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem
          onClick={() => handleSignIn('google')}
          disabled={isLoading}
          className="group cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-950/30 dark:hover:to-red-950/30 focus:bg-gradient-to-r focus:from-blue-50 focus:to-red-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Continue with Google</span>
            <span className="text-xs text-muted-foreground">Fast & secure</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSignIn('facebook')}
          disabled={true}
          className="group cursor-not-allowed opacity-50 flex items-center gap-3 p-3 rounded-lg mt-1"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1877F2] shadow-sm">
            <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Continue with Facebook</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
