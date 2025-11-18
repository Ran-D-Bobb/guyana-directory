'use client'

import Link from 'next/link'
import { Database } from '@/types/supabase'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

type Category = Database['public']['Tables']['categories']['Row'] & {
  business_count?: number
}

// Unsplash image mappings for each category type
const categoryImageMap: Record<string, string> = {
  'restaurants-dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
  'grocery-supermarkets': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  'health-medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  'automotive-services': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop&q=80',
  'home-garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&auto=format&fit=crop&q=80',
  'construction-trades': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  'technology-electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'fashion-clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
  'education-training': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
  'professional-services': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  'entertainment-events': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
  'fitness-sports': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'pet-services': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&auto=format&fit=crop&q=80',
  'real-estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
  'financial-services': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
  'hospitality-lodging': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
  'transportation-logistics': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
  'photography-media': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80',
  'other-services': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
}

// Fallback image
const defaultImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop'

export default function CategoryCarousel({ categories }: { categories: Category[] }) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as Record<string, LucideIcon>)[iconName]
    return Icon || Icons.Store
  }

  const getCategoryImage = (slug: string) => {
    return categoryImageMap[slug] || defaultImage
  }

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)
            const imageUrl = getCategoryImage(category.slug)

            return (
              <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Link href={`/businesses/category/${category.slug}`}>
                  <div className="group relative h-64 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </div>

                    {/* Glassmorphism Content Card */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 group-hover:backdrop-blur-md">
                      <div className="relative">
                        {/* Icon with glow effect */}
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 group-hover:shadow-emerald-500/50">
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Category Name */}
                        <h3 className="mb-2 text-2xl font-bold text-white tracking-tight">
                          {category.name}
                        </h3>

                        {/* Business Count */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/90">
                            {category.business_count || 0} businesses
                          </span>
                          <span className="text-white/70">→</span>
                        </div>

                        {/* Hover indicator line */}
                        <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 group-hover:w-20" />
                      </div>
                    </div>

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <CarouselPrevious className="-left-14 h-12 w-12 border-2 border-gray-200 bg-white text-gray-900 shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all" />
          <CarouselNext className="-right-14 h-12 w-12 border-2 border-gray-200 bg-white text-gray-900 shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all" />
        </div>
      </Carousel>

      {/* Scroll indicator for mobile */}
      <div className="mt-4 flex justify-center gap-2 md:hidden">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Swipe to explore</span>
          <span className="animate-pulse">→</span>
        </div>
      </div>
    </div>
  )
}
