import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - Waypoint',
  description: 'Reset your Waypoint account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[hsl(var(--jungle-50))] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] border border-[hsl(var(--border))] p-6 sm:p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl text-[hsl(var(--jungle-700))]">Waypoint</span>
            </Link>
            <h2 className="font-display text-2xl text-[hsl(var(--jungle-800))]">Forgot your password?</h2>
            <p className="mt-2 text-[hsl(var(--jungle-600))] text-sm">No worries, we&apos;ll send you reset instructions.</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
