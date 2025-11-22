import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Eye, MessageCircle, Heart, Star, Plus, Edit, Camera } from 'lucide-react'
import DeleteRentalButton from '@/components/DeleteRentalButton'

export default async function MyRentalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get landlord's rentals
  const { data: rentals, error } = await supabase
    .from('rentals')
    .select(`
      *,
      rental_categories (name)
    `)
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching rentals:', error)
  }

  // Calculate aggregate stats
  const totalViews = rentals?.reduce((sum, rental) => sum + (rental.view_count || 0), 0) || 0
  const totalInquiries = rentals?.reduce((sum, rental) => sum + (rental.inquiry_count || 0), 0) || 0
  const totalSaves = rentals?.reduce((sum, rental) => sum + (rental.save_count || 0), 0) || 0
  const totalReviews = rentals?.reduce((sum, rental) => sum + (rental.review_count || 0), 0) || 0
  const avgRating = rentals && rentals.length > 0
    ? (rentals.reduce((sum, rental) => sum + (rental.rating || 0), 0) / rentals.filter(r => r.rating).length) || 0
    : 0

  // Calculate revenue estimate (total views * avg price * 2% conversion rate)
  const avgPrice = rentals && rentals.length > 0
    ? (rentals.reduce((sum, rental) => sum + (rental.price_per_month || 0), 0) / rentals.length) || 0
    : 0
  const revenueEstimate = Math.round(totalViews * avgPrice * 0.02)

  const hasReachedLimit = rentals && rentals.length >= 1 // Free tier: 1 listing limit

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rental Properties</h1>
          <p className="text-gray-600">Manage your listings, view analytics, and respond to inquiries</p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Views</span>
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Inquiries</span>
              <MessageCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalInquiries.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Saves</span>
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSaves.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Rating</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Reviews</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Est. Revenue</span>
              <span className="text-xs text-gray-500">2% conv</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <span className="text-sm">GYD</span> {revenueEstimate.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Add New Property Button */}
        <div className="mb-6">
          {hasReachedLimit ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Free Tier Limit Reached</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    You&apos;ve reached the limit of 1 active listing on the free tier.
                  </p>
                  <p className="text-sm text-yellow-800 mb-3">
                    Want to list more properties? Upgrade to Premium for unlimited listings!
                  </p>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon: Premium Upgrade (GYD 5,000-10,000/month)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/dashboard/my-rentals/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add New Property
            </Link>
          )}
        </div>

        {/* Property List */}
        {rentals && rentals.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Your Properties</h2>

            <div className="grid gap-6">
              {rentals.map((rental) => (
                <div key={rental.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{rental.name}</h3>
                          {rental.is_featured && (
                            <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {rental.rental_categories?.name || 'Unknown Category'}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          GYD {rental.price_per_month?.toLocaleString()}/month
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{rental.bedrooms} beds</span>
                          <span>{rental.bathrooms} baths</span>
                          <span>Max {rental.max_guests} guests</span>
                          {rental.square_feet && <span>{rental.square_feet} sqft</span>}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap md:flex-col gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Eye className="h-4 w-4" />
                            <span>Views</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{rental.view_count || 0}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>Inquiries</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{rental.inquiry_count || 0}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Rating</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {rental.rating ? rental.rating.toFixed(1) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Heart className="h-4 w-4" />
                            <span>Saves</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{rental.save_count || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Link
                        href={`/rentals/${rental.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Home className="h-4 w-4" />
                        View Listing
                      </Link>
                      <Link
                        href={`/dashboard/my-rentals/${rental.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Details
                      </Link>
                      <Link
                        href={`/dashboard/my-rentals/${rental.id}/photos`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        Manage Photos
                      </Link>
                      <DeleteRentalButton rentalName={rental.name} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">List Your First Property</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start earning by listing your property on Guyana Directory. It&apos;s free to list your first property!
            </p>
            <Link
              href="/dashboard/my-rentals/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
