import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RentalFormSteps from '@/components/forms/rental/RentalFormSteps'

export default async function CreateRentalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user has reached free tier limit (1 listing)
  const { data: existingRentals, error: rentalError } = await supabase
    .from('rentals')
    .select('id')
    .eq('landlord_id', user.id)

  if (rentalError) {
    console.error('Error checking rental limit:', rentalError)
  }

  const hasReachedLimit = existingRentals && existingRentals.length >= 1

  // Get rental categories
  const { data: categories } = await supabase
    .from('rental_categories')
    .select('*')
    .order('name')

  // Get regions
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  if (hasReachedLimit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
            <p className="text-gray-600">Fill out the form below to create your rental listing</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Tier Limit Reached</h2>
              <p className="text-gray-600 mb-4">
                You&apos;ve reached the limit of 1 active listing on the free tier.
              </p>
              <p className="text-gray-600 mb-6">
                Want to list more properties? Upgrade to Premium for unlimited listings!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Premium Benefits</h3>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>✓ Unlimited property listings</li>
                  <li>✓ Priority support</li>
                  <li>✓ Enhanced analytics</li>
                  <li>✓ Featured listing options</li>
                </ul>
              </div>
              <button
                disabled
                className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Coming Soon: Premium Upgrade (GYD 5,000-10,000/month)
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Or <a href="/dashboard/my-rentals" className="text-blue-600 hover:underline">manage your existing listing</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RentalFormSteps
        categories={categories || []}
        regions={regions || []}
        userId={user.id}
      />
    </div>
  )
}
