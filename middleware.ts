import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { isAdmin } from '@/lib/admin'

// Allowed reason codes to prevent forwarding arbitrary text in URLs
const ALLOWED_REASON_CODES = new Set([
  'spam', 'harassment', 'fraud', 'tos_violation', 'inappropriate_content', 'other'
])

const intlMiddleware = createIntlMiddleware(routing)

// Strip locale prefix from pathname to get the "logical" path for auth checks
function getPathWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue // Default locale has no prefix
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
    if (pathname === `/${locale}`) {
      return '/'
    }
  }
  return pathname
}

// Get the current locale from the pathname
function getLocaleFromPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return routing.defaultLocale
}

// Build a locale-aware redirect URL
function localizedRedirect(request: NextRequest, path: string, locale: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = locale === routing.defaultLocale ? path : `/${locale}${path}`
  return NextResponse.redirect(url)
}

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
  const pathname = request.nextUrl.pathname

  // 1. Run next-intl middleware for locale detection and URL rewriting
  const intlResponse = intlMiddleware(request)

  // If intl middleware issued a redirect (e.g. removing /en prefix), return immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse
  }

  // 2. Determine the logical pathname (without locale prefix) for auth checks
  const logicalPath = getPathWithoutLocale(pathname)
  const locale = getLocaleFromPath(pathname)

  // Add pathname to headers so layout can check if we're in kiosk mode
  intlResponse.headers.set('x-pathname', pathname)

  // 3. Create Supabase client that reads from request and writes to intlResponse
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
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, {
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

  // 4. Auth checks using the logical (locale-stripped) pathname
  const isProtectedRoute = logicalPath.startsWith('/dashboard') || logicalPath.startsWith('/admin')
  const isAuthPage = logicalPath.startsWith('/auth/') &&
    !logicalPath.includes('/callback') &&
    !logicalPath.includes('/verify-email') &&
    !logicalPath.includes('/reset-password')
  const isBlockedPage = logicalPath === '/blocked'

  // Only run full auth verification on routes that need it.
  if (!isProtectedRoute && !isAuthPage && !isBlockedPage) {
    await supabase.auth.getSession()
    return intlResponse
  }

  // Protected/auth routes — full server-side user verification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && isProtectedRoute && !isBlockedPage) {
    const isAdminRoute = logicalPath.startsWith('/admin')
    const userStatus = await checkUserStatus(supabase, user.id, isAdminRoute)

    if (userStatus.isBlocked) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = locale === routing.defaultLocale ? '/blocked' : `/${locale}/blocked`
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
  if (logicalPath.startsWith('/dashboard')) {
    if (!user) {
      return localizedRedirect(request, '/auth/login', locale)
    }

    // Check if email is verified for email/password users
    const provider = user.app_metadata?.provider
    const isEmailProvider = provider === 'email'
    const emailConfirmed = user.email_confirmed_at

    if (isEmailProvider && !emailConfirmed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = locale === routing.defaultLocale ? '/auth/verify-email' : `/${locale}/auth/verify-email`
      if (user.email) {
        redirectUrl.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages (except callback routes)
  if (isAuthPage && user && user.email_confirmed_at) {
    return localizedRedirect(request, '/', locale)
  }

  // Protect admin routes - require both authentication AND admin status
  if (logicalPath.startsWith('/admin')) {
    if (!user) {
      return localizedRedirect(request, '/auth/login', locale)
    }

    // Check email verification for email/password users
    const provider = user.app_metadata?.provider
    if (provider === 'email' && !user.email_confirmed_at) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = locale === routing.defaultLocale ? '/auth/verify-email' : `/${locale}/auth/verify-email`
      if (user.email) {
        redirectUrl.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(redirectUrl)
    }

    if (!isAdmin(user)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = locale === routing.defaultLocale ? '/' : `/${locale}`
      redirectUrl.searchParams.set('unauthorized', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
