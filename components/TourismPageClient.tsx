'use client'

import React from 'react'
import { ExperienceCard } from './tourism/ExperienceCard'
import { Database } from '@/types/supabase'

type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}

interface TourismPageClientProps {
  experiences: TourismExperience[]
  searchParams: {
    category?: string
    difficulty?: string
    duration?: string
    sort?: string
    q?: string
    region?: string
  }
}

export function TourismPageClient({ experiences, searchParams }: TourismPageClientProps) {
  const { q } = searchParams
  const featuredCount = experiences?.filter(e => e.is_featured).length || 0
  const verifiedCount = experiences?.filter(e => e.is_verified).length || 0

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-gray-900 font-medium text-lg">
            {q && (
              <span className="mr-2">
                Search results for <span className="text-emerald-600 font-semibold">&quot;{q}&quot;</span>
              </span>
            )}
            {!q && (
              <span className="text-gray-900">
                {experiences.length} {experiences.length === 1 ? 'Experience' : 'Experiences'}
              </span>
            )}
            {q && (
              <span className="block text-sm text-gray-500 mt-1">
                {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'} found
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 mt-1">
            {featuredCount > 0 && !q && (
              <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {featuredCount} featured
              </p>
            )}
            {verifiedCount > 0 && !q && (
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {verifiedCount} verified
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ExperienceCard experience={experience} />
          </div>
        ))}
      </div>
    </>
  )
}
