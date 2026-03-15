import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Waypoint - Discover Guyana | Businesses, Experiences, Events & Stays'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #064e3b 0%, #0d5c4b 30%, #065f46 60%, #064e3b 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.12)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #111827, #000000)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.15)',
              fontSize: 40,
            }}
          >
            W
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Waypoint
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            Discover Local Businesses in Guyana
          </div>

          {/* Categories bar */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 16,
            }}
          >
            {['Restaurants', 'Shopping', 'Tourism', 'Events', 'Stays'].map(
              (cat) => (
                <div
                  key={cat}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 24,
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {cat}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #10b981, #f59e0b, #10b981)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
