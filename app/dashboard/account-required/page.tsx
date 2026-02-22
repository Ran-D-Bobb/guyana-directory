import Link from 'next/link'
import { Building2, User, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Account Required - Waypoint',
}

export default async function AccountRequiredPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const requiredType = params.type || 'business'
  const isBusiness = requiredType === 'business'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isBusiness ? (
              <Building2 className="w-8 h-8 text-gray-400" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isBusiness ? 'Business Account Required' : 'Personal Account Required'}
          </h1>
          <p className="text-gray-600 mb-2">
            {isBusiness
              ? 'This feature is only available for Business accounts.'
              : 'This feature is only available for Personal accounts.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {isBusiness
              ? 'To create and manage business listings, you need a Business account. Please create a new account and select "Business" as your account type.'
              : 'Features like saved items and reviews are available with a Personal account. Please create a new account and select "Personal" as your account type.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
