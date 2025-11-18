'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Leaf,
  Mountain,
  Users,
  Home as HomeIcon,
  Compass,
  Waves,
  Utensils,
  Landmark,
  Camera,
  Bird,
  Backpack,
  Plane
} from 'lucide-react'
import { useKioskConfig } from './KioskLayoutOptimized'

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  description: string | null
  experience_count: number
}

interface KioskCategoryGridProps {
  categories: Category[]
}

const iconMap: Record<string, any> = {
  leaf: Leaf,
  mountain: Mountain,
  users: Users,
  'home-icon': HomeIcon,
  compass: Compass,
  waves: Waves,
  utensils: Utensils,
  landmark: Landmark,
  camera: Camera,
  bird: Bird,
  backpack: Backpack,
  plane: Plane
}

// Beautiful category-specific images from Unsplash
const categoryImages: Record<string, string> = {
  'nature-wildlife': 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop',
  'adventure-activities': 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=800&h=600&fit=crop',
  'cultural-experiences': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop',
  'eco-lodges-stays': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  'tours-guides': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
  'water-activities': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'food-culinary': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  'historical-heritage': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=600&fit=crop',
  'photography-tours': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
  'bird-watching': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=600&fit=crop',
  'multi-day-expeditions': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop',
  'airport-transfer-services': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop'
}

export default function KioskCategoryGrid({ categories }: KioskCategoryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [viewportWidth, setViewportWidth] = useState(1920)
  const kioskConfig = useKioskConfig()

  // Update viewport width on mount and resize
  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Responsive columns based on viewport width
  const columns = viewportWidth >= 1680 ? 3 : viewportWidth >= 1366 ? 3 : 2
  const cardSize = viewportWidth >= 1680 ? 340 : viewportWidth >= 1366 ? 300 : 300
  const headerFontSize = viewportWidth >= 1680 ? 72 : 60
  const subtitleFontSize = viewportWidth >= 1680 ? 32 : 26
  const cardTitleSize = viewportWidth >= 1680 ? 38 : 32
  const badgeFontSize = viewportWidth >= 1680 ? 24 : 20
  const iconSize = viewportWidth >= 1680 ? 64 : 56

  return (
    <div
      className="kiosk-gradient-tropical"
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: '112px', // 80px nav + 32px spacing
        paddingBottom: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header - Kiosk Optimized */}
      <div
        className="text-center kiosk-animate-slide-up"
        style={{
          marginBottom: '24px',
          flexShrink: 0
        }}
      >
        <h1
          className="font-black text-white tracking-tight"
          style={{
            fontSize: `${headerFontSize}px`,
            marginBottom: '12px',
            lineHeight: '1'
          }}
        >
          Choose Your Adventure
        </h1>
        <p
          className="text-white/90 font-light"
          style={{ fontSize: `${subtitleFontSize}px` }}
        >
          Touch any category to discover amazing experiences in Guyana
        </p>
      </div>

      {/* Category Grid - Kiosk Optimized with scrolling support */}
      <div
        className="overflow-y-auto"
        style={{
          flex: '1 1 auto',
          paddingRight: '24px',
          minHeight: 0
        }}
      >
        <div
          style={{
            gap: '40px',
            maxWidth: '1600px',
            margin: '0 auto',
            display: kioskConfig.orientation === 'portrait' ? 'flex' : 'grid',
            flexDirection: kioskConfig.orientation === 'portrait' ? 'column' : undefined,
            gridTemplateColumns: kioskConfig.orientation === 'portrait' ? undefined : `repeat(${columns}, ${cardSize}px)`,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Compass
          const imageUrl = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop'
          const isHovered = hoveredId === category.id

          return (
            <Link
              key={category.id}
              href={`/kiosk/category/${category.slug}`}
              className="group kiosk-animate-fade-in"
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                animationDelay: `${categories.indexOf(category) * 100}ms`
              }}
            >
              <div
                className={`
                  ${isHovered ? 'kiosk-shadow-glow' : ''}
                `}
                style={{
                  width: `${cardSize}px`,
                  height: `${cardSize}px`,
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHovered ? 'scale(1.05) translateY(-8px)' : 'scale(1) translateY(0)',
                  boxShadow: isHovered
                    ? '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(253, 224, 71, 0.5)'
                    : '0 12px 40px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    className={`
                      object-cover transition-transform duration-700
                      ${isHovered ? 'scale-110' : 'scale-100'}
                    `}
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20
                  transition-opacity duration-500
                  ${isHovered ? 'opacity-95' : 'opacity-85'}
                `} />

                {/* Content - Kiosk Optimized */}
                <div
                  className="absolute inset-0 flex flex-col justify-between"
                  style={{ padding: '24px' }}
                >
                  {/* Icon - Large and prominent */}
                  <div className="flex justify-end">
                    <div
                      className={`
                        bg-white/20 backdrop-blur-md rounded-2xl
                        transition-all duration-500
                        ${isHovered ? 'bg-white/40 scale-110' : 'bg-white/25 scale-100'}
                      `}
                      style={{
                        padding: '16px',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon
                        className="text-white"
                        size={iconSize}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Title & Count - Kiosk Optimized */}
                  <div style={{ gap: '16px' }}>
                    <h3
                      className={`
                        font-black text-white leading-tight
                        transition-transform duration-500
                        ${isHovered ? 'translate-y-0' : 'translate-y-1'}
                      `}
                      style={{
                        fontSize: `${cardTitleSize}px`,
                        marginBottom: '14px',
                        lineHeight: '1.1'
                      }}
                    >
                      {category.name}
                    </h3>

                    {/* Experience Count Badge - Kiosk Optimized */}
                    <div className="flex items-center">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #facc15 0%, #f97316 50%, #ec4899 100%)',
                          borderRadius: '9999px',
                          paddingLeft: '20px',
                          paddingRight: '20px',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          minWidth: '88px',
                          minHeight: 'auto'
                        }}
                      >
                        <span
                          className="font-bold text-white whitespace-nowrap"
                          style={{ fontSize: `${badgeFontSize}px` }}
                        >
                          {category.experience_count} {category.experience_count === 1 ? 'Experience' : 'Experiences'}
                        </span>
                      </div>
                    </div>

                    {/* Description (shows on hover) - Kiosk Optimized */}
                    {category.description && (
                      <p
                        className={`
                          text-white/95 leading-relaxed
                          transition-all duration-500
                          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                        `}
                        style={{
                          fontSize: '22px',
                          marginTop: '12px'
                        }}
                      >
                        {category.description.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Animated Border */}
                <div className={`
                  absolute inset-0 rounded-3xl
                  transition-all duration-500
                  ${isHovered ? 'ring-4 ring-yellow-400 ring-opacity-80' : 'ring-0'}
                `} />
              </div>
            </Link>
          )
        })}
        </div>
      </div>

      {/* Footer Instructions - Kiosk Optimized */}
      <div
        className="text-center kiosk-animate-fade-in"
        style={{
          marginTop: '24px',
          paddingBottom: '0px',
          animationDelay: '800ms',
          flexShrink: 0
        }}
      >
        <p
          className="text-white/80 font-medium"
          style={{ fontSize: '32px' }}
        >
          Touch any category to start your adventure
        </p>
      </div>
    </div>
  )
}
