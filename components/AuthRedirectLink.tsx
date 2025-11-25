'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, ReactNode } from 'react'

interface AuthRedirectLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function AuthRedirectLink({ href, children, className }: AuthRedirectLinkProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [supabase])

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // If already logged in, navigate directly
    if (isLoggedIn) {
      router.push(href)
      return
    }

    // Check auth again in case session changed
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      router.push(href)
    } else {
      // Show a message and scroll to top where login button is
      alert('Please sign in to access this feature')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
}
