'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Plane,
  Trees,
  Activity,
  Users,
  Home,
  Map,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Compass,
  Car,
  Sparkles,
  type LucideIcon
} from 'lucide-react'
import { Database } from '@/types/supabase'

type TourismCategory = Database['public']['Tables']['tourism_categories']['Row'] & {
  experience_count?: number
}

interface TourismCategoryPillsProps {
  categories: TourismCategory[]
  currentCategoryId?: string
}

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Trees,
  Activity,
  Users,
  Home,
  Map,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Compass,
  Car,
  Plane
}

// Category accent colors for visual distinction
const categoryColors: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  'nature-wildlife': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', activeBg: 'bg-green-600' },
  'adventure': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', activeBg: 'bg-orange-600' },
  'culture': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-600' },
  'eco-lodges': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', activeBg: 'bg-emerald-600' },
  'tours-guides': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-600' },
  'water-activities': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', activeBg: 'bg-cyan-600' },
  'food-culinary': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-600' },
  'history-heritage': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', activeBg: 'bg-stone-600' },
  'photography': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', activeBg: 'bg-pink-600' },
  'bird-watching': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', activeBg: 'bg-teal-600' },
  'expeditions': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', activeBg: 'bg-red-600' },
  'transfers': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', activeBg: 'bg-slate-600' },
}

const defaultColors = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', activeBg: 'bg-gray-600' }

export function TourismCategoryPills({ categories, currentCategoryId }: TourismCategoryPillsProps) {
  const searchParams = useSearchParams()

  // Build URL preserving other params
  const buildCategoryUrl = (categoryId?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    const queryString = params.toString()
    return `/tourism${queryString ? `?${queryString}` : ''}`
  }

  return (
    <div className="relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none lg:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none lg:hidden" />

      {/* Scrollable container */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1 lg:flex-wrap lg:overflow-visible">
        {/* All Experiences Pill */}
        <Link
          href={buildCategoryUrl()}
          className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 border ${
            !currentCategoryId
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/25'
              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${!currentCategoryId ? 'text-amber-300' : 'text-emerald-500'}`} />
          <span>All Experiences</span>
        </Link>

        {/* Category Pills */}
        {categories.map((category) => {
          const IconComponent = category.icon ? iconMap[category.icon] || Plane : Plane
          const isActive = currentCategoryId === category.id
          const colors = categoryColors[category.slug] || defaultColors

          return (
            <Link
              key={category.id}
              href={buildCategoryUrl(category.id)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 border ${
                isActive
                  ? `${colors.activeBg} text-white border-transparent shadow-lg`
                  : `${colors.bg} ${colors.text} ${colors.border} hover:shadow-md`
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              <span>{category.name}</span>
              {category.experience_count !== undefined && category.experience_count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/5'
                }`}>
                  {category.experience_count}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
