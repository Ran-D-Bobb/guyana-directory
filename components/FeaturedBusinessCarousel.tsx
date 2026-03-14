'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, BadgeCheck, Phone, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'
import { getCategoryImage } from '@/lib/category-images'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string; slug: string } | null
  regions: { name: string } | null
  primary_photo?: string | null
}

interface FeaturedBusinessCarouselProps {
  businesses: Business[]
}

export function FeaturedBusinessCarousel({ businesses }: FeaturedBusinessCarouselProps) {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  const handlePhoneClick = (e: React.MouseEvent, phone: string | null) => {
    e.preventDefault()
    e.stopPropagation()

    if (!phone) return
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="w-full relative">
      <Carousel
        plugins={[autoplayPlugin.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {businesses.map((business) => {
            const imageUrl = business.primary_photo || getCategoryImage(business.categories?.slug || '')

            return (
              <CarouselItem key={business.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link
                  href={`/businesses/${business.slug}`}
                  className="group block"
                >
                  <div className="relative h-[180px] rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-2xl transition-[border-color,box-shadow] duration-300">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                      <Image
                        src={imageUrl}
                        alt={business.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-5 flex flex-col justify-between">
                      {/* Top Section */}
                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex gap-1.5 mb-3">
                          {business.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-500/90 text-white rounded-full backdrop-blur-sm">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {business.rating && business.rating > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-gray-900">
                                {business.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Business Name */}
                        <h3 className="font-bold text-lg text-white mb-1.5 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                          {business.name}
                        </h3>

                        {/* Category & Location */}
                        <div className="space-y-1">
                          {business.categories && (
                            <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                              {business.categories.name}
                            </p>
                          )}
                          {business.regions && (
                            <div className="flex items-center gap-1 text-xs text-white/80">
                              <MapPin className="w-3 h-3" />
                              <span>{business.regions.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Section - CTA Buttons */}
                      <div className="flex gap-2 mt-3">
                        {business.phone && (
                          <button
                            onClick={(e) => handlePhoneClick(e, business.phone)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold transition-colors shadow-lg"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </button>
                        )}
                        <div className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors group/details">
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover/details:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* Navigation Arrows */}
        <div className="hidden md:block">
          <CarouselPrevious className="-left-12 h-10 w-10 border-2 border-border bg-card text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
          <CarouselNext className="-right-12 h-10 w-10 border-2 border-border bg-card text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
        </div>
      </Carousel>

      {/* Mobile Swipe Indicator */}
      <div className="mt-3 flex justify-center md:hidden">
        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <span>Swipe to explore</span>
          <span className="animate-pulse">→</span>
        </div>
      </div>
    </div>
  )
}
