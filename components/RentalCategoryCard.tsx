'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface RentalCategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    icon: string
    description: string | null
    listing_count?: number
  }
  imageUrl?: string
}

// Map of category slugs to Unsplash images
const categoryImages: Record<string, string> = {
  'apartments': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'houses': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  'vacation-homes': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  'room-rentals': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
  'office-spaces': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'shared-housing': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'land': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
}

export function RentalCategoryCard({ category, imageUrl }: RentalCategoryCardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons[category.icon as keyof typeof LucideIcons] || LucideIcons.Home) as LucideIcon

  const displayImage = imageUrl || categoryImages[category.slug] || categoryImages['apartments']

  return (
    <Link
      href={`/rentals/category/${category.slug}`}
      className="group relative block rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 h-80"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={displayImage}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Icon */}
        <div className="flex justify-end">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/30 transition-colors">
            <IconComponent className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Text Content */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-200 mb-3 line-clamp-2">
              {category.description}
            </p>
          )}
          {/* Listing Count Badge */}
          {category.listing_count !== undefined && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-semibold text-white">
                {category.listing_count} {category.listing_count === 1 ? 'listing' : 'listings'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-400 rounded-2xl transition-colors pointer-events-none" />
    </Link>
  )
}
