import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/admin'

// Helper to check if user is blocked (suspended or banned)
async function checkUserStatus(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<{
  isBlocked: boolean
  status: 'active' | 'suspended' | 'banned'
  reason: string | null
  expiresAt: string | null
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, status_reason, status_expires_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { isBlocked: false, status: 'active', reason: null, expiresAt: null }
  }

  const status = (profile.status as 'active' | 'suspended' | 'banned') || 'active'

  // Check if suspension has expired
  if (status === 'suspended' && profile.status_expires_at) {
    const expiresAt = new Date(profile.status_expires_at)
    if (expiresAt < new Date()) {
      // Suspension expired - user should be reactivated
      // Note: actual reactivation happens via a scheduled job or on next login
      // For now, we treat expired suspensions as still blocked to maintain consistency
      return {
        isBlocked: true,
        status: 'suspended',
        reason: profile.status_reason,
        expiresAt: profile.status_expires_at
      }
    }
  }

  return {
    isBlocked: status === 'suspended' || status === 'banned',
    status,
    reason: profile.status_reason,
    expiresAt: profile.status_expires_at,
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add pathname to headers so layout can check if we're in kiosk mode
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Preserve pathname header after recreating response
          supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check user status for authenticated users on protected routes
  // Skip check for blocked page to prevent redirect loops
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/admin')
  const isBlockedPage = request.nextUrl.pathname === '/blocked'

  if (user && isProtectedRoute && !isBlockedPage) {
    const userStatus = await checkUserStatus(supabase, user.id)

    if (userStatus.isBlocked) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/blocked'
      redirectUrl.searchParams.set('status', userStatus.status)
      if (userStatus.reason) {
        redirectUrl.searchParams.set('reason', userStatus.reason)
      }
      if (userStatus.expiresAt) {
        redirectUrl.searchParams.set('expires', userStatus.expiresAt)
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirected', 'true')
      return NextResponse.redirect(redirectUrl)
    }

    // Check if email is verified for email/password users
    // OAuth users (google, facebook) are automatically verified
    const provider = user.app_metadata?.provider
    const isEmailProvider = provider === 'email'
    const emailConfirmed = user.email_confirmed_at

    if (isEmailProvider && !emailConfirmed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/verify-email'
      if (user.email) {
        redirectUrl.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages (except callback routes)
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/') &&
    !request.nextUrl.pathname.includes('/callback') &&
    !request.nextUrl.pathname.includes('/verify-email') &&
    !request.nextUrl.pathname.includes('/reset-password')

  if (isAuthPage && user && user.email_confirmed_at) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect admin routes - require both authentication AND admin status
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirected', 'true')
      return NextResponse.redirect(redirectUrl)
    }

    // Check email verification for email/password users
    const provider = user.app_metadata?.provider
    if (provider === 'email' && !user.email_confirmed_at) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/verify-email'
      if (user.email) {
        redirectUrl.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(redirectUrl)
    }

    if (!isAdmin(user)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('unauthorized', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
