'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  image_url: string
  display_order: number | null
  is_primary: boolean | null
}

interface PhotoUploadProps {
  businessId: string
  existingPhotos: Photo[]
}

export function PhotoUpload({ businessId, existingPhotos }: PhotoUploadProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if user is at max photos (3 for free tier)
    if (photos.length >= 3) {
      setError('Maximum 3 photos allowed for free tier')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const file = files[0]

      // Validate file type - only formats supported by Supabase Storage
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, or WebP image')
        setUploading(false)
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        setUploading(false)
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${businessId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('business-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-photos')
        .getPublicUrl(fileName)

      // Save to database
      const { data: newPhoto, error: dbError } = await supabase
        .from('business_photos')
        .insert({
          business_id: businessId,
          image_url: publicUrl,
          display_order: photos.length,
          is_primary: photos.length === 0, // First photo is primary by default
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        setError(`Failed to save photo: ${dbError.message}`)
        // Clean up uploaded file
        await supabase.storage.from('business-photos').remove([fileName])
        setUploading(false)
        return
      }

      // Update local state
      setPhotos([...photos, newPhoto])
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('business-photos/')
      if (urlParts.length < 2) {
        setError('Invalid image URL')
        return
      }
      const fileName = urlParts[1]

      // Delete from database
      const { error: dbError } = await supabase
        .from('business_photos')
        .delete()
        .eq('id', photoId)

      if (dbError) {
        console.error('Database error:', dbError)
        setError(`Failed to delete photo: ${dbError.message}`)
        return
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('business-photos')
        .remove([fileName])

      if (storageError) {
        console.error('Storage error:', storageError)
        // Photo deleted from DB but not storage - not critical
      }

      // Update local state
      setPhotos(photos.filter((p) => p.id !== photoId))
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    }
  }

  const handleSetPrimary = async (photoId: string) => {
    try {
      // Unset all primary photos first
      const { error: clearError } = await supabase
        .from('business_photos')
        .update({ is_primary: false })
        .eq('business_id', businessId)

      if (clearError) {
        setError('Failed to update primary photo')
        return
      }

      // Set the selected photo as primary
      const { error: updateError } = await supabase
        .from('business_photos')
        .update({ is_primary: true })
        .eq('id', photoId)

      if (updateError) {
        console.error('Update error:', updateError)
        setError(`Failed to set primary photo: ${updateError.message}`)
        return
      }

      // Update local state
      setPhotos(
        photos.map((p) => ({
          ...p,
          is_primary: p.id === photoId,
        }))
      )
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    }
  }

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      {photos.length < 3 && (
        <div className="mb-6">
          <label
            htmlFor="photo-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-2">
            {photos.length}/3 photos • Max 5MB • JPG, PNG, WebP
          </p>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                <Image
                  src={photo.image_url}
                  alt="Business"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>

              {/* Primary Badge */}
              {photo.is_primary && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!photo.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(photo.id)}
                    className="px-3 py-1 bg-white text-gray-900 rounded text-sm font-medium hover:bg-gray-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => handleDelete(photo.id, photo.image_url)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No photos uploaded yet</p>
          <p className="text-sm text-gray-500 mt-1">Upload your first photo to get started</p>
        </div>
      )}
    </div>
  )
}
