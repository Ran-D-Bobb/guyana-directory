'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, BadgeCheck, MessageCircle, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories: { name: string } | null
  regions: { name: string } | null
  primary_photo?: string | null
}

interface FeaturedBusinessCarouselProps {
  businesses: Business[]
}

const DEFAULT_BUSINESS_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'

export function FeaturedBusinessCarousel({ businesses }: FeaturedBusinessCarouselProps) {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  const handleWhatsAppClick = (e: React.MouseEvent, phone: string | null, businessName: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!phone) return

    const message = `Hi! I found you on Guyana Directory and I'm interested in ${businessName}`
    const encodedMessage = encodeURIComponent(message)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const whatsappUrl = isMobile
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
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
            const imageUrl = business.primary_photo || DEFAULT_BUSINESS_IMAGE

            return (
              <CarouselItem key={business.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link
                  href={`/businesses/${business.slug}`}
                  className="group block"
                >
                  <div className="relative h-[180px] rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-300">
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
                        {business.whatsapp_number && (
                          <button
                            onClick={(e) => handleWhatsAppClick(e, business.whatsapp_number, business.name)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                        )}
                        <div className="flex items-center gap-1 px-3 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all group/details">
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
          <CarouselPrevious className="-left-12 h-10 w-10 border-2 border-emerald-200 bg-white text-gray-900 shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all" />
          <CarouselNext className="-right-12 h-10 w-10 border-2 border-emerald-200 bg-white text-gray-900 shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all" />
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
