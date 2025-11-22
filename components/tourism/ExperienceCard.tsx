import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Star, Users, Sparkles, ShieldCheck, Award } from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface ExperienceCardProps {
  experience: TourismExperience
}

// Default tourism experience image from Unsplash
const DEFAULT_TOURISM_IMAGE = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80'

// Difficulty color coding
const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  challenging: 'bg-orange-100 text-orange-700 border-orange-200',
  expert: 'bg-red-100 text-red-700 border-red-200'
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  // Get primary photo or first photo
  const photos = Array.isArray(experience.tourism_photos) ? experience.tourism_photos : []
  const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || DEFAULT_TOURISM_IMAGE

  const difficultyColor = difficultyColors[experience.difficulty_level || 'easy'] || difficultyColors.easy

  return (
    <Link
      href={`/tourism/${experience.slug}`}
      className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      {/* Experience Image */}
      <div className="relative w-full h-56 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50 overflow-hidden">
        <Image
          src={primaryPhoto}
          alt={experience.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay - appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {experience.is_featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {experience.is_tourism_authority_approved && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-lime-600 text-white text-xs font-bold rounded-full shadow-lg">
              <Award className="w-3 h-3" />
              TA Approved
            </span>
          )}
          {experience.is_verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Category Badge */}
        {experience.tourism_categories && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
              {experience.tourism_categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {experience.name}
        </h3>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Duration */}
          {experience.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span className="truncate">{experience.duration}</span>
            </div>
          )}

          {/* Difficulty */}
          {experience.difficulty_level && (
            <div className="flex items-center justify-end">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${difficultyColor}`}>
                {experience.difficulty_level.charAt(0).toUpperCase() + experience.difficulty_level.slice(1)}
              </span>
            </div>
          )}

          {/* Rating */}
          {experience.rating && experience.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{experience.rating.toFixed(1)}</span>
              <span className="text-gray-500">({experience.review_count})</span>
            </div>
          )}

          {/* Group Size */}
          {experience.group_size_max && (
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">Up to {experience.group_size_max}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {experience.regions && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="truncate">{experience.regions.name}</span>
          </div>
        )}

        {/* Description */}
        {experience.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {experience.description}
          </p>
        )}

        {/* Price */}
        {experience.price_from !== null && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-500">From</span>
                <span className="text-xl font-bold text-emerald-600 ml-2">
                  GYD {experience.price_from.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-gray-500">{experience.price_notes || 'per person'}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
