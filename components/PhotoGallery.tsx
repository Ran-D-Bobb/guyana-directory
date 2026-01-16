'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { PhotoFlagButton } from './PhotoFlagButton'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  image_url: string
  is_primary?: boolean | null
  display_order?: number | null
}

interface PhotoGalleryProps {
  photos: Photo[]
  businessName: string
  isAuthenticated: boolean
  userFlaggedPhotos?: string[] // Array of photo IDs the user has flagged
}

export function PhotoGallery({
  photos,
  businessName,
  isAuthenticated,
  userFlaggedPhotos = []
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

  // Sort photos by is_primary and display_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? sortedPhotos.length - 1 : selectedIndex - 1)
    }
  }
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === sortedPhotos.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  return (
    <>
      {/* Gallery Thumbnails */}
      <div className="flex gap-2">
        {sortedPhotos.slice(0, 4).map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(idx)}
            className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl hover:border-white/60 transition-all duration-300 hover:scale-105 group"
          >
            <Image
              src={photo.image_url}
              alt={`${businessName} photo ${idx + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
            {/* Flag button overlay */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PhotoFlagButton
                photoId={photo.id}
                isAuthenticated={isAuthenticated}
                initialHasFlagged={userFlaggedPhotos.includes(photo.id)}
                className="p-1 bg-black/50 rounded-full backdrop-blur-sm"
              />
            </div>
          </button>
        ))}
        {sortedPhotos.length > 4 && (
          <button
            onClick={() => openLightbox(3)}
            className="w-20 h-20 rounded-xl bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-semibold hover:bg-black/60 transition-all"
          >
            +{sortedPhotos.length - 3}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          {sortedPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={sortedPhotos[selectedIndex].image_url}
              alt={`${businessName} photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>

          {/* Footer with flag button and counter */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
            <span className="text-white/70">
              {selectedIndex + 1} / {sortedPhotos.length}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
              <Flag className="w-4 h-4 text-white/70" />
              <PhotoFlagButton
                photoId={sortedPhotos[selectedIndex].id}
                isAuthenticated={isAuthenticated}
                initialHasFlagged={userFlaggedPhotos.includes(sortedPhotos[selectedIndex].id)}
                variant="text"
                className="text-white/70 hover:text-red-400"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Inline flag button for hero image
 */
export function HeroPhotoFlagButton({
  photoId,
  isAuthenticated,
  hasFlagged = false
}: {
  photoId: string
  isAuthenticated: boolean
  hasFlagged?: boolean
}) {
  return (
    <div className="absolute bottom-4 left-4 z-30">
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all',
        'bg-black/30 hover:bg-black/50'
      )}>
        <PhotoFlagButton
          photoId={photoId}
          isAuthenticated={isAuthenticated}
          initialHasFlagged={hasFlagged}
          variant="text"
          className="text-white/80 hover:text-red-400"
        />
      </div>
    </div>
  )
}
