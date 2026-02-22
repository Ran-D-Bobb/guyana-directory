import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup', 'recovery', etc.
  const accountType = requestUrl.searchParams.get('account_type') // 'personal' or 'business' (OAuth signup)
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://waypointgy.com'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                  path: '/',
                })
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      const errorUrl = new URL(`${origin}/auth/error`)
      errorUrl.searchParams.set('message', error.message)
      const response = NextResponse.redirect(errorUrl)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }

    // Handle account_type for OAuth signups (Google, etc.)
    // The profile trigger creates the profile with default 'personal',
    // so we update it here if the user chose 'business' during signup.
    if (accountType && ['personal', 'business'].includes(accountType)) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Double-check: verify the auth user was recently created (within 2 minutes)
          const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity
          if (userAge > 120000) {
            // Skip account_type update for returning users
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('created_at')
              .eq('id', user.id)
              .single()

            if (profile) {
              // Only update for newly created profiles (within 2 minutes)
              const profileAge = Date.now() - new Date(profile.created_at!).getTime()
              if (profileAge < 120000) {
                await supabase
                  .from('profiles')
                  .update({ account_type: accountType })
                  .eq('id', user.id)
              }
            }
          }
        }
      } catch (e) {
        console.error('Error setting account_type for OAuth user:', e)
      }
    }

    // Handle password recovery - redirect to reset password page
    if (type === 'recovery') {
      const response = NextResponse.redirect(`${origin}/auth/reset-password`)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }

    // Handle email verification (signup confirmation)
    if (type === 'signup') {
      const response = NextResponse.redirect(`${origin}/auth/callback-redirect?verified=true`)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }
  }

  // Default: Redirect to intermediate page for OAuth or other cases
  const response = NextResponse.redirect(`${origin}/auth/callback-redirect`)

  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, max-age=0')

  return response
}
