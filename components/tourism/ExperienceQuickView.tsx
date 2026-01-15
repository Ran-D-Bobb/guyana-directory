'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  X,
  MapPin,
  Clock,
  Star,
  Users,
  Mountain,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface ExperienceQuickViewProps {
  experience: TourismExperience
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80'

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  challenging: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700'
}

export function ExperienceQuickView({ experience, isOpen, onClose }: ExperienceQuickViewProps) {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const photos = Array.isArray(experience.tourism_photos) ? experience.tourism_photos : []
  const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || DEFAULT_IMAGE

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-3xl lg:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-2rem)] lg:max-h-[85vh]">
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 h-56 lg:h-auto flex-shrink-0">
            <Image
              src={primaryPhoto}
              alt={experience.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {experience.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured
                </span>
              )}
              {experience.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Category */}
            {experience.tourism_categories && (
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {experience.tourism_categories.name}
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {experience.name}
            </h2>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {experience.duration && (
                <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-xl">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold text-gray-900">{experience.duration}</div>
                  </div>
                </div>
              )}

              {experience.difficulty_level && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
                  <Mountain className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${difficultyColors[experience.difficulty_level]}`}>
                      {experience.difficulty_level.charAt(0).toUpperCase() + experience.difficulty_level.slice(1)}
                    </div>
                  </div>
                </div>
              )}

              {experience.group_size_max && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500">Group Size</div>
                    <div className="font-semibold text-gray-900">
                      {experience.group_size_min || 1}-{experience.group_size_max} people
                    </div>
                  </div>
                </div>
              )}

              {experience.rating && experience.rating > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <div>
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="font-semibold text-gray-900">
                      {experience.rating.toFixed(1)} ({experience.review_count} reviews)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            {experience.regions && (
              <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl mb-6">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="font-semibold text-gray-900">{experience.regions.name}</div>
                </div>
              </div>
            )}

            {/* Description */}
            {experience.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  About
                </h3>
                <p className="text-gray-600 leading-relaxed line-clamp-4">
                  {experience.description}
                </p>
              </div>
            )}

            {/* Price */}
            {experience.price_from !== null && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl mb-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm text-gray-500">From</span>
                    <span className="text-3xl font-bold text-emerald-600 ml-2">
                      GYD {experience.price_from.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{experience.price_notes || 'per person'}</span>
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {experience.phone && (
                <a
                  href={`tel:${experience.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call to Book
                </a>
              )}
              {experience.email && (
                <a
                  href={`mailto:${experience.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              )}
            </div>

            {/* View Full Details */}
            <Link
              href={`/tourism/${experience.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              onClick={onClose}
            >
              View Full Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
