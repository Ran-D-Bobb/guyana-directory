import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup', 'recovery', etc.
  const origin = requestUrl.origin

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
                cookieStore.set(name, value, options)
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
