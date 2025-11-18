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
  Plane,
  Globe,
  ArrowLeft
} from 'lucide-react'
import { useKioskConfig } from './KioskLayoutOptimized'
import KioskFeaturedAttractions from './KioskFeaturedAttractions'

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  description: string | null
  experience_count: number
}

interface FeaturedAttraction {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  rating: number
  review_count: number
  duration: string | null
  price_from: number
  category_name: string
}

interface KioskCategoryGridProps {
  categories: Category[]
  featuredAttractions?: FeaturedAttraction[]
  onBack?: () => void
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

// Beautiful category-specific images from Unsplash (optimized for kiosk display)
const categoryImages: Record<string, string> = {
  'nature-wildlife': 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1200&h=800&fit=crop&q=80',
  'adventure-activities': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop&q=80',
  'cultural-experiences': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&h=800&fit=crop&q=80',
  'eco-lodges-stays': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&q=80',
  'tours-guides': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop&q=80',
  'water-activities': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=80',
  'food-culinary': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&q=80',
  'historical-heritage': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=800&fit=crop&q=80',
  'photography-tours': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=800&fit=crop&q=80',
  'bird-watching': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&h=800&fit=crop&q=80',
  'multi-day-expeditions': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=800&fit=crop&q=80',
  'airport-transfer-services': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
}

export default function KioskCategoryGrid({ categories, featuredAttractions, onBack }: KioskCategoryGridProps) {
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

  // Responsive grid - 4 columns on large screens, 2 on medium
  const columns = viewportWidth >= 1680 ? 4 : viewportWidth >= 1366 ? 4 : 2

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--kiosk-bg-base)'
      }}
    >
      {/* Background Image with Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      >
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh2v4ltxv6a12DAupB02S6UK6NYYmM2Bxy6KjYVJYWY7vWHY9i4ZwctMCHxZdSzgYn5d4WeynDEaO3dLILGk-yIYCwk4oGg8SpfzonPuFEyiHr2ciWGdMfjAEiF_KlNElLVl0feGg4jtCL-Q0lJmPCPigTm4gKCZnINu-18BuaJvwGhJHCDWTBtfDlJtCZCFinb9AaTiytrn4HaNml9U7-zGgOukIuUEvN8S5dDSVWfcrME5czE7Y5AXxs5Y-VjIzefDmRxBusV6qL"
          alt="Breathtaking aerial view of Kaieteur Falls in Guyana"
          fill
          className="object-cover opacity-20 blur-sm"
          priority
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(16, 34, 16, 0.8)'
          }}
        />
      </div>

      {/* Floating Back and Language Buttons */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '32px',
            left: '64px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '9999px',
            border: '1px solid rgba(19, 236, 19, 0.5)',
            background: 'rgba(16, 34, 16, 0.8)',
            padding: '16px 32px',
            color: 'white',
            fontSize: '24px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 34, 16, 0.8)'
          }}
        >
          <ArrowLeft size={28} />
          <span>Back</span>
        </button>
      )}

      <button
        style={{
          position: 'absolute',
          top: '32px',
          right: '64px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderRadius: '9999px',
          border: '1px solid rgba(19, 236, 19, 0.5)',
          background: 'rgba(16, 34, 16, 0.8)',
          padding: '16px 32px',
          color: 'white',
          fontSize: '24px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(19, 236, 19, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(16, 34, 16, 0.8)'
        }}
      >
        <Globe size={28} />
        <span>English</span>
      </button>

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1
        }}
      >
        {/* Main Content */}
        <main
          style={{
            display: 'flex',
            flex: '1',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 64px',
            paddingTop: '120px',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{ width: '100%', maxWidth: '1600px', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: viewportWidth >= 1680 ? '80px' : '64px',
                fontWeight: '800',
                color: 'white',
                marginBottom: '24px',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
            >
              Explore Guyana
            </h2>
            <p
              style={{
                fontSize: viewportWidth >= 1680 ? '36px' : '28px',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '900px',
                margin: '0 auto 64px auto'
              }}
            >
              Select a category to discover the wonders of our beautiful country.
            </p>

            {/* Category Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: viewportWidth >= 1680 ? '48px' : '32px',
                justifyContent: 'center'
              }}
            >
              {categories.map((category, index) => {
                const Icon = iconMap[category.icon] || Compass
                const isHovered = hoveredId === category.id
                const backgroundImage = categoryImages[category.slug] || categoryImages['tours-guides']

                return (
                  <Link
                    key={category.id}
                    href={`/kiosk/category/${category.slug}`}
                    className="kiosk-animate-fade-in"
                    onMouseEnter={() => setHoveredId(category.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '24px',
                      borderRadius: '24px',
                      border: `2px solid ${isHovered ? 'var(--kiosk-primary-500)' : 'rgba(59, 84, 59, 1)'}`,
                      backdropFilter: 'blur(8px)',
                      padding: '48px',
                      height: '280px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Background Image */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0
                      }}
                    >
                      <Image
                        src={backgroundImage}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                      {/* Dark overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: isHovered
                            ? 'linear-gradient(135deg, rgba(19, 236, 19, 0.3) 0%, rgba(16, 34, 16, 0.7) 100%)'
                            : 'rgba(16, 34, 16, 0.75)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                      <Icon
                        size={96}
                        strokeWidth={2}
                        style={{
                          color: 'var(--kiosk-primary-500)',
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))'
                        }}
                      />
                      <h3
                        style={{
                          color: 'white',
                          fontSize: viewportWidth >= 1680 ? '32px' : '28px',
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                        }}
                      >
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Featured Attractions */}
            {featuredAttractions && featuredAttractions.length > 0 && (
              <div style={{ marginTop: '64px' }}>
                <KioskFeaturedAttractions
                  attractions={featuredAttractions}
                  title="Featured Attractions"
                />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '32px 64px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '24px'
          }}
        >
          <p>Tap a category to begin your journey.</p>
        </footer>
      </div>
    </div>
  )
}
