import { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password - Waypoint',
  description: 'Set a new password for your Waypoint account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[hsl(var(--jungle-50))] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] border border-[hsl(var(--border))] p-6 sm:p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl text-[hsl(var(--jungle-700))]">Waypoint</span>
            </Link>
            <h2 className="font-display text-2xl text-[hsl(var(--jungle-800))]">Set new password</h2>
            <p className="mt-2 text-[hsl(var(--jungle-600))] text-sm">Create a strong password for your account.</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
