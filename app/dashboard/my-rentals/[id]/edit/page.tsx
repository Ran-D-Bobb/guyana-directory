import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RentalEditForm from '@/components/RentalEditForm'

export default async function EditRentalPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get the rental listing
  const { data: rental, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('id', params.id)
    .eq('landlord_id', user.id)
    .single()

  if (error || !rental) {
    notFound()
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property Listing</h1>
          <p className="text-gray-600">Update your property details</p>
        </div>

        <RentalEditForm
          rental={rental}
          categories={categories || []}
          regions={regions || []}
        />
      </div>
    </div>
  )
}
