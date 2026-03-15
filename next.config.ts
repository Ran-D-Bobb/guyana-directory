import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === 'development'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cgkjhdqyaxkcianuwevp.supabase.co'

// Build CSP dynamically: allow local Supabase in dev, only production Supabase in prod
const cspConnectSrc = [
  "'self'",
  'https://cgkjhdqyaxkcianuwevp.supabase.co',
  'wss://cgkjhdqyaxkcianuwevp.supabase.co',
  'https://api.geoapify.com',
  ...(isDev ? ['http://127.0.0.1:*', 'ws://127.0.0.1:*', 'ws://localhost:*'] : []),
].join(' ')

const cspImgSrc = [
  "'self'", 'data:', 'blob:',
  'https://images.unsplash.com',
  'https://lh3.googleusercontent.com',
  'https://cgkjhdqyaxkcianuwevp.supabase.co',
  'https://as1.ftcdn.net', 'https://as2.ftcdn.net',
  'https://img.youtube.com',
  'https://maps.geoapify.com',
  ...(isDev ? ['http://127.0.0.1:*'] : []),
].join(' ')

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src ${cspImgSrc}`,
  `connect-src ${cspConnectSrc}`,
  "frame-src https://www.youtube.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
      },
      // Long-cache static assets (fonts, icons, images in /public)
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'as1.ftcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'as2.ftcdn.net',
        pathname: '/**',
      },
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: 'http' as const,
        hostname: '127.0.0.1',
        port: '57321',
        pathname: '/storage/v1/object/public/**',
      }] : []),
      {
        protocol: 'https',
        hostname: 'cgkjhdqyaxkcianuwevp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: true,
  additionalPrecacheEntries: [
    { url: "/offline", revision: Date.now().toString() },
    { url: "/icons/icon-192x192.png", revision: "1" },
  ],
});

export default withNextIntl(withSerwist(nextConfig));
