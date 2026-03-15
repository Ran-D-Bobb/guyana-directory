import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireBusinessAccount } from '@/lib/account-type'
import RentalPhotoUpload from '@/components/RentalPhotoUpload'

export default async function RentalPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  await requireBusinessAccount(user.id)

  // Get the rental listing
  const { data: rental, error } = await supabase
    .from('rentals')
    .select('id, name, landlord_id')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single()

  if (error || !rental) {
    notFound()
  }

  // Get existing photos
  const { data: photos } = await supabase
    .from('rental_photos')
    .select('*')
    .eq('rental_id', id)
    .order('display_order')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Photos</h1>
          <p className="text-gray-600">{rental.name}</p>
          <p className="text-sm text-gray-500 mt-1">Upload up to 15 photos (5MB max each)</p>
        </div>

        <RentalPhotoUpload
          rentalId={rental.id}
          existingPhotos={(photos || []).map(p => ({
            id: p.id,
            image_url: p.image_url,
            display_order: p.display_order ?? 0,
            is_primary: p.is_primary ?? false
          }))}
        />
      </div>
    </div>
  )
}
