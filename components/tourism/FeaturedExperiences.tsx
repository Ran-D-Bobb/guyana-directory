'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Clock, Star, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface FeaturedExperiencesProps {
  experiences: TourismExperience[]
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80'

export function FeaturedExperiences({ experiences }: FeaturedExperiencesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!experiences || experiences.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-8 lg:py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Handpicked</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Featured Experiences
          </h2>
        </div>

        {/* Navigation Arrows - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
        >
          {experiences.map((experience, index) => {
            const photos = Array.isArray(experience.tourism_photos) ? experience.tourism_photos : []
            const primaryPhoto = photos.find(p => p.is_primary)?.image_url || photos[0]?.image_url || DEFAULT_IMAGE

            return (
              <Link
                key={experience.id}
                href={`/tourism/${experience.slug}`}
                className="group flex-shrink-0 w-[320px] lg:w-[380px] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-52 lg:h-60 overflow-hidden">
                  <Image
                    src={primaryPhoto}
                    alt={experience.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 320px, 380px"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  </div>

                  {/* Price Tag */}
                  {experience.price_from !== null && (
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-lg font-bold text-emerald-600">
                        GYD {experience.price_from.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {experience.tourism_categories && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {experience.tourism_categories.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {experience.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                    {/* Location */}
                    {experience.regions && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-teal-500" />
                        <span>{experience.regions.name}</span>
                      </div>
                    )}

                    {/* Duration */}
                    {experience.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <span>{experience.duration}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {experience.rating && experience.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{experience.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Experience</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
