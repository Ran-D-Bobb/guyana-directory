'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Home, Loader2 } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('message') || 'An error occurred during authentication.'
  const errorCode = searchParams.get('code')

  // Map common error codes to user-friendly messages
  const getErrorDescription = (code: string | null, message: string) => {
    if (code === 'access_denied') {
      return 'You denied access to your account. Please try again if this was a mistake.'
    }
    if (message.includes('expired') || code === 'otp_expired') {
      return 'This link has expired. Please request a new one.'
    }
    if (message.includes('invalid') || code === 'invalid_credentials') {
      return 'The authentication link is invalid. Please try again.'
    }
    return message
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
      <p className="text-gray-600 mb-6">
        {getErrorDescription(errorCode, errorMessage)}
      </p>

      <div className="space-y-3">
        <Link href="/auth/login">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to homepage
          </Button>
        </Link>
      </div>

      {errorCode && (
        <p className="mt-6 text-xs text-gray-400">
          Error code: {errorCode}
        </p>
      )}
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

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<LoadingFallback />}>
            <AuthErrorContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
