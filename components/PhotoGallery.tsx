'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Flag, Camera } from 'lucide-react'
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
  userFlaggedPhotos?: string[]
}

export function PhotoGallery({
  photos,
  businessName,
  isAuthenticated,
  userFlaggedPhotos = []
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

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
      {/* Desktop Gallery Thumbnails */}
      <div className="flex flex-col gap-2">
        {sortedPhotos.slice(0, 4).map((photo, idx) => (
          <div
            key={photo.id}
            className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl hover:border-white/60 transition-all duration-300 hover:scale-105 group"
          >
            <button
              onClick={() => openLightbox(idx)}
              className="w-full h-full"
              aria-label={`View ${businessName} photo ${idx + 1}`}
            >
              <Image
                src={photo.image_url}
                alt={`${businessName} photo ${idx + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <PhotoFlagButton
                photoId={photo.id}
                isAuthenticated={isAuthenticated}
                initialHasFlagged={userFlaggedPhotos.includes(photo.id)}
                className="p-1 bg-black/50 rounded-full backdrop-blur-sm"
              />
            </div>
          </div>
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
        <PhotoLightbox
          photos={sortedPhotos}
          selectedIndex={selectedIndex}
          businessName={businessName}
          isAuthenticated={isAuthenticated}
          userFlaggedPhotos={userFlaggedPhotos}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </>
  )
}

/**
 * Mobile photo gallery strip - shown below hero on small screens
 */
export function MobilePhotoGallery({
  photos,
  businessName,
  isAuthenticated,
  userFlaggedPhotos = []
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length <= 1) return null

  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setSelectedIndex(0)}
          className="flex items-center gap-2 px-4 py-2.5 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 text-[hsl(var(--jungle-700))] hover:bg-white transition-colors"
        >
          <Camera className="w-4 h-4 text-[hsl(var(--jungle-500))]" />
          <span className="text-sm font-medium">View all {sortedPhotos.length} photos</span>
          <div className="flex -space-x-2 ml-auto">
            {sortedPhotos.slice(0, 3).map((photo, idx) => (
              <div key={photo.id} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={photo.image_url}
                  alt={`${businessName} photo ${idx + 1}`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </button>
      </div>

      {selectedIndex !== null && (
        <PhotoLightbox
          photos={sortedPhotos}
          selectedIndex={selectedIndex}
          businessName={businessName}
          isAuthenticated={isAuthenticated}
          userFlaggedPhotos={userFlaggedPhotos}
          onClose={() => setSelectedIndex(null)}
          onPrevious={() => setSelectedIndex(selectedIndex === 0 ? sortedPhotos.length - 1 : selectedIndex - 1)}
          onNext={() => setSelectedIndex(selectedIndex === sortedPhotos.length - 1 ? 0 : selectedIndex + 1)}
        />
      )}
    </>
  )
}

/**
 * Shared lightbox component with keyboard support and focus trapping
 */
function PhotoLightbox({
  photos,
  selectedIndex,
  businessName,
  isAuthenticated,
  userFlaggedPhotos,
  onClose,
  onPrevious,
  onNext,
}: {
  photos: Photo[]
  selectedIndex: number
  businessName: string
  isAuthenticated: boolean
  userFlaggedPhotos: string[]
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        onPrevious()
        break
      case 'ArrowRight':
        onNext()
        break
    }
  }, [onClose, onPrevious, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden'

    // Focus the lightbox container for keyboard events
    containerRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo gallery for ${businessName}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center outline-none"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close photo gallery"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrevious() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-4xl max-h-[80vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[selectedIndex].image_url}
          alt={`${businessName} photo ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      {/* Footer with flag button and counter */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
        <span className="text-white/70">
          {selectedIndex + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
          <Flag className="w-4 h-4 text-white/70" />
          <PhotoFlagButton
            photoId={photos[selectedIndex].id}
            isAuthenticated={isAuthenticated}
            initialHasFlagged={userFlaggedPhotos.includes(photos[selectedIndex].id)}
            variant="text"
            className="text-white/70 hover:text-red-400"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Inline flag button for hero image - visible on all screen sizes
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
    <div className="absolute top-16 right-3 md:bottom-4 md:top-auto md:left-4 md:right-auto z-30">
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
