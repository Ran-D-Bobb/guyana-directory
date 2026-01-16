'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Ban, Clock, Home, LogOut, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function BlockedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('status') as 'suspended' | 'banned' | null
  const reason = searchParams.get('reason')
  const expiresAt = searchParams.get('expires')

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false

  return (
    <div className="text-center">
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        status === 'banned' ? 'bg-red-100' : 'bg-amber-100'
      }`}>
        {status === 'banned' ? (
          <Ban className="w-8 h-8 text-red-600" />
        ) : (
          <Clock className="w-8 h-8 text-amber-600" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {status === 'banned' ? 'Account Banned' : 'Account Suspended'}
      </h2>

      <div className="text-gray-600 mb-6 space-y-2">
        {status === 'banned' ? (
          <p>Your account has been permanently banned from the platform.</p>
        ) : (
          <>
            {expiresAt ? (
              isExpired ? (
                <p>Your suspension has expired. Please try logging in again.</p>
              ) : (
                <p>Your account is suspended until {formatExpiryDate(expiresAt)}.</p>
              )
            ) : (
              <p>Your account has been suspended indefinitely.</p>
            )}
          </>
        )}

        {reason && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
            <p className="text-sm text-gray-600">{reason}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isExpired && status === 'suspended' && (
          <Link href="/auth/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Try Logging In Again
            </Button>
          </Link>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        <Link href="/">
          <Button variant="ghost" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-3">
          If you believe this is a mistake, please contact support:
        </p>
        <a
          href="mailto:support@example.com"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          support@example.com
        </a>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
    </div>
  )
}

export default function BlockedPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<LoadingFallback />}>
            <BlockedContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
