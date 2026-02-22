import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/admin'

// Allowed reason codes to prevent forwarding arbitrary text in URLs
const ALLOWED_REASON_CODES = new Set([
  'spam', 'harassment', 'fraud', 'tos_violation', 'inappropriate_content', 'other'
])

// Helper to check if user is blocked (suspended or banned)
// failClosed: if true, DB errors result in isBlocked: true (used for admin routes)
async function checkUserStatus(supabase: ReturnType<typeof createServerClient>, userId: string, failClosed = false): Promise<{
  isBlocked: boolean
  status: 'active' | 'suspended' | 'banned'
  reason: string | null
  expiresAt: string | null
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('status, status_reason, status_expires_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile status:', error)
      return { isBlocked: failClosed, status: 'active', reason: null, expiresAt: null }
    }

    if (!profile) {
      console.error('No profile found for user:', userId)
      return { isBlocked: failClosed, status: 'active', reason: null, expiresAt: null }
    }

    const status = (profile.status as 'active' | 'suspended' | 'banned') || 'active'

    // Check if suspension has expired
    if (status === 'suspended' && profile.status_expires_at) {
      const expiresAt = new Date(profile.status_expires_at)
      if (expiresAt < new Date()) {
        // Suspension expired - allow access
        return { isBlocked: false, status: 'active', reason: null, expiresAt: null }
      }
    }

    // Sanitize reason to only allow predefined codes
    const reason = ALLOWED_REASON_CODES.has(profile.status_reason) ? profile.status_reason : null

    return {
      isBlocked: status === 'suspended' || status === 'banned',
      status,
      reason,
      expiresAt: profile.status_expires_at,
    }
  } catch (err) {
    console.error('Unexpected error checking user status:', err)
    return { isBlocked: failClosed, status: 'active', reason: null, expiresAt: null }
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Preserve pathname header after recreating response
          supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              // Ensure cookies work properly on mobile browsers during OAuth
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            })
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
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const userStatus = await checkUserStatus(supabase, user.id, isAdminRoute)

    if (userStatus.isBlocked) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/blocked'
      redirectUrl.searchParams.set('status', userStatus.status)
      if (userStatus.reason) {
        redirectUrl.searchParams.set('reason', userStatus.reason)
      }
      if (userStatus.expiresAt) {
        const expiryDate = new Date(userStatus.expiresAt)
        if (!isNaN(expiryDate.getTime())) {
          redirectUrl.searchParams.set('expires', expiryDate.toISOString())
        }
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
    // OAuth users (google) are automatically verified
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
