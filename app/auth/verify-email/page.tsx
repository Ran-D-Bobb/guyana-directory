'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { getAuthRedirectUrl } from '@/lib/utils'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('No email address provided')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: getAuthRedirectUrl('/auth/callback?type=signup'),
        },
      })

      if (error) {
        toast.error('Failed to resend email', {
          description: error.message,
        })
      } else {
        toast.success('Verification email sent', {
          description: 'Please check your inbox.',
        })
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-amber-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
      <p className="text-gray-600 mb-2">
        Your email address needs to be verified before you can access this page.
      </p>
      {email && (
        <p className="text-sm text-gray-500 mb-6">
          Check your inbox at <span className="font-medium text-gray-700">{email}</span>
        </p>
      )}

      <div className="space-y-3 mt-6">
        {email && (
          <Button
            onClick={handleResendEmail}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Resend verification email
          </Button>
        )}
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Can&apos;t find the email? Check your spam folder or{' '}
          <Link href="/auth/signup" className="text-emerald-600 hover:text-emerald-700">
            try signing up again
          </Link>
          .
        </p>
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

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
