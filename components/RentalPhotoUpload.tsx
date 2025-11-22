'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Upload, Trash2, Star, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Photo {
  id: string
  image_url: string
  display_order: number | null
  is_primary: boolean | null
}

interface RentalPhotoUploadProps {
  rentalId: string
  existingPhotos: Photo[]
}

const MAX_PHOTOS = 15
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function RentalPhotoUpload({ rentalId, existingPhotos }: RentalPhotoUploadProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > MAX_PHOTOS) {
      setUploadError(`You can only upload up to ${MAX_PHOTOS} photos. You currently have ${photos.length} photos.`)
      return
    }

    setIsUploading(true)
    setUploadError('')
    setSuccessMessage('')

    try {
      const uploadedPhotos: Photo[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setUploadError(`${file.name} is too large. Maximum file size is 5MB.`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`${file.name} is not an image file.`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${rentalId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('rental-photos')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('rental-photos')
          .getPublicUrl(fileName)

        // Create photo record in database
        const { data: photoData, error: photoError } = await supabase
          .from('rental_photos')
          .insert({
            rental_id: rentalId,
            image_url: publicUrl,
            display_order: photos.length + uploadedPhotos.length,
            is_primary: photos.length === 0 && uploadedPhotos.length === 0 // First photo is primary
          })
          .select()
          .single()

        if (photoError) throw photoError

        uploadedPhotos.push(photoData)
      }

      setPhotos([...photos, ...uploadedPhotos])
      setSuccessMessage(`Successfully uploaded ${uploadedPhotos.length} photo(s)!`)
      router.refresh()
    } catch (error: unknown) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload photos')
    } finally {
      setIsUploading(false)
      // Clear file input
      e.target.value = ''
    }
  }

  const handleDelete = async (photoId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const filePath = url.pathname.split('/').slice(-2).join('/')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('rental-photos')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('rental_photos')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError

      // Update local state
      setPhotos(photos.filter(p => p.id !== photoId))
      setSuccessMessage('Photo deleted successfully')
      router.refresh()
    } catch (error: unknown) {
      console.error('Delete error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to delete photo')
    }
  }

  const handleSetPrimary = async (photoId: string) => {
    try {
      // Unset all primary flags
      await supabase
        .from('rental_photos')
        .update({ is_primary: false })
        .eq('rental_id', rentalId)

      // Set new primary
      const { error } = await supabase
        .from('rental_photos')
        .update({ is_primary: true })
        .eq('id', photoId)

      if (error) throw error

      // Update local state
      setPhotos(photos.map(p => ({
        ...p,
        is_primary: p.id === photoId
      })))
      setSuccessMessage('Primary photo updated')
      router.refresh()
    } catch (error: unknown) {
      console.error('Set primary error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to set primary photo')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/my-rentals"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Rentals
      </Link>

      {/* Messages */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h2>
          <p className="text-sm text-gray-600">
            Upload high-quality photos to showcase your property. The first photo will be set as the primary photo.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Current: {photos.length}/{MAX_PHOTOS} photos
          </p>
        </div>

        {photos.length < MAX_PHOTOS && (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
              {isUploading && (
                <p className="mt-2 text-sm text-blue-600 font-semibold">Uploading...</p>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading || photos.length >= MAX_PHOTOS}
            />
          </label>
        )}

        {photos.length >= MAX_PHOTOS && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              You&apos;ve reached the maximum of {MAX_PHOTOS} photos. Delete some photos to upload new ones.
            </p>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={photo.image_url}
                    alt="Property photo"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Primary Badge */}
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!photo.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(photo.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      title="Set as primary photo"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id, photo.image_url)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h3>
          <p className="text-gray-600 mb-6">
            Upload photos to make your property listing more attractive to renters
          </p>
        </div>
      )}

      {/* Done Button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/my-rentals"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Done
        </Link>
      </div>
    </div>
  )
}
