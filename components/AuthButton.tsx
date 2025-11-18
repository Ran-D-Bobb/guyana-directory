'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthButtonProps {
  user: User | null
}

export function AuthButton({ user }: AuthButtonProps) {
  const supabase = createClient()

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  // Don't render anything for authenticated users (UserMenu handles that)
  if (user) {
    return null
  }

  return (
    <Button
      onClick={handleSignIn}
      className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all active:scale-95"
    >
      <span className="relative flex items-center gap-2">
        <LogIn className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline">Sign In with Google</span>
        <span className="sm:hidden">Sign In</span>
      </span>
    </Button>
  )
}
