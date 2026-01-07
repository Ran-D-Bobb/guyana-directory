import { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password - Waypoint',
  description: 'Set a new password for your Waypoint account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-2xl font-semibold text-emerald-600">Waypoint</h1>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
            <p className="mt-2 text-gray-600">Create a strong password for your account.</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
