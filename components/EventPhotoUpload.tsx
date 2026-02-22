'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split(`${bucket}/`)
    return parts.length > 1 ? parts[1] : null
  } catch {
    return url.split('/').pop() || null
  }
}

interface EventPhotoUploadProps {
  eventId?: string // Optional for create form (won't upload until event is created)
  currentImageUrl?: string | null
  onImageChange?: (imageUrl: string | null) => void
  onImageFileChange?: (file: File | null) => void
  disabled?: boolean
}

export function EventPhotoUpload({
  eventId,
  currentImageUrl,
  onImageChange,
  onImageFileChange,
  disabled = false
}: EventPhotoUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - only formats supported by Supabase Storage
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)

    // Create preview URL
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // If we have an eventId, upload immediately (edit mode)
    if (eventId) {
      await uploadImage(file)
    } else {
      // Otherwise, just store the file for later upload (create mode)
      if (onImageFileChange) {
        onImageFileChange(file)
      }
    }
  }

  const uploadImage = async (file: File) => {
    if (!eventId) return

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Delete old image if exists
      if (imageUrl) {
        const oldPath = extractStoragePath(imageUrl, 'event-photos')
        if (oldPath) {
          await supabase.storage
            .from('event-photos')
            .remove([oldPath])
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${eventId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-photos')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)

      // Update event with new image URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: publicUrl })
        .eq('id', eventId)

      if (updateError) throw updateError

      if (onImageChange) {
        onImageChange(publicUrl)
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId || !imageUrl) return

    setIsDeleting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Delete from storage
      const path = extractStoragePath(imageUrl, 'event-photos')
      if (path) {
        const { error: deleteError } = await supabase.storage
          .from('event-photos')
          .remove([path])

        if (deleteError) throw deleteError
      }

      // Update event to remove image URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: null })
        .eq('id', eventId)

      if (updateError) throw updateError

      setImageUrl(null)
      setPreviewUrl(null)

      if (onImageChange) {
        onImageChange(null)
      }
      if (onImageFileChange) {
        onImageFileChange(null)
      }
    } catch (err) {
      console.error('Error deleting image:', err)
      setError('Failed to delete image. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemovePreview = () => {
    setPreviewUrl(null)
    if (onImageFileChange) {
      onImageFileChange(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Event Image</h3>
          <p className="text-sm text-gray-500">
            Add a cover image for your event (optional, max 5MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="relative">
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src={previewUrl}
              alt="Event cover"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          <button
            type="button"
            onClick={eventId ? handleDelete : handleRemovePreview}
            disabled={isDeleting || disabled}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Remove image"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm font-medium">Uploading...</div>
            </div>
          )}
        </div>
      ) : (
        <label
          className={`
            border-2 border-dashed border-gray-300 rounded-lg p-8
            text-center cursor-pointer hover:border-purple-500 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Upload className="w-6 h-6 text-purple-600 animate-bounce" />
              ) : (
                <ImageIcon className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? 'Uploading...' : 'Click to upload event image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </label>
      )}
    </div>
  )
}
