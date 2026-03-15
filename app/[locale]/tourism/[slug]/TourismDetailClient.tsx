'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface Photo {
  image_url: string
  is_primary?: boolean | null
  display_order?: number | null
}

interface TourismPhotoGalleryProps {
  photos: Photo[]
  experienceName: string
  defaultImage: string
}

export function TourismPhotoGallery({ photos, experienceName, defaultImage }: TourismPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={defaultImage}
          alt={experienceName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
      </div>
    )
  }

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
        onClick={() => setSelectedIndex(0)}
      >
        <Image
          src={photos[0]?.image_url || defaultImage}
          alt={experienceName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />

        {/* Photo count badge */}
        {photos.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(0) }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-black/70 transition-colors"
          >
            <Camera className="w-4 h-4" />
            {photos.length} photos
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mt-2">
          {photos.slice(0, 6).map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                idx === 0 ? 'border-emerald-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={photo.image_url}
                alt={`${experienceName} photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
          {photos.length > 6 && (
            <button
              onClick={() => setSelectedIndex(6)}
              className="w-20 h-16 flex-shrink-0 rounded-xl bg-black/60 flex items-center justify-center text-white text-sm font-semibold hover:bg-black/70 transition-colors"
            >
              +{photos.length - 6}
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          selectedIndex={selectedIndex}
          experienceName={experienceName}
          onClose={() => setSelectedIndex(null)}
          onPrevious={() => setSelectedIndex(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1)}
          onNext={() => setSelectedIndex(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1)}
        />
      )}
    </>
  )
}

function Lightbox({
  photos,
  selectedIndex,
  experienceName,
  onClose,
  onPrevious,
  onNext,
}: {
  photos: Photo[]
  selectedIndex: number
  experienceName: string
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape': onClose(); break
      case 'ArrowLeft': onPrevious(); break
      case 'ArrowRight': onNext(); break
    }
  }, [onClose, onPrevious, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
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
      aria-label={`Photo gallery for ${experienceName}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center outline-none"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close gallery"
      >
        <X className="w-8 h-8" />
      </button>

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

      <div
        className="relative w-full h-full max-w-4xl max-h-[80vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[selectedIndex].image_url}
          alt={`${experienceName} photo ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center z-10">
        <span className="text-white/70 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {selectedIndex + 1} / {photos.length}
        </span>
      </div>
    </div>,
    document.body
  )
}
