import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - Waypoint',
  description: 'Reset your Waypoint account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-2xl font-semibold text-emerald-600">Waypoint</h1>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
            <p className="mt-2 text-gray-600">No worries, we&apos;ll send you reset instructions.</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
