'use client'

import Link from 'next/link'
import Image from 'next/image'
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
import { getCategoryImage } from '@/lib/category-images'

type Category = Database['public']['Tables']['categories']['Row'] & {
  business_count?: number
}

export default function CategoryCarousel({ categories: rawCategories }: { categories: Category[] }) {
  // Hide categories with 0 businesses
  const categories = rawCategories.filter(c => (c.business_count ?? 0) > 0)
  const getIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, LucideIcon>)[iconName]
    return Icon || Icons.Store
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
                  <div className="group relative h-64 overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    {/* Background Image - Using Next.js Image for optimization */}
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Glassmorphism Content Card */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="relative">
                        {/* Icon with glow effect */}
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110">
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Category Name */}
                        <h3 className="mb-2 text-2xl font-bold text-white tracking-tight text-hero-title">
                          {category.name}
                        </h3>

                        {/* Business Count */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/90 text-hero-label">
                            {category.business_count || 0} businesses
                          </span>
                          <span className="text-white/70">&rarr;</span>
                        </div>

                        {/* Hover indicator line */}
                        <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
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
          <CarouselPrevious className="-left-14 h-12 w-12 border-2 border-border bg-card text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
          <CarouselNext className="-right-14 h-12 w-12 border-2 border-border bg-card text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
        </div>
      </Carousel>

      {/* Scroll indicator for mobile */}
      <div className="mt-4 flex justify-center gap-2 md:hidden">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Swipe to explore</span>
          <span className="animate-pulse">&rarr;</span>
        </div>
      </div>
    </div>
  )
}
