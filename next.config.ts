import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '55321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cgkjhdqyaxkcianuwevp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Set to true to disable PWA in development for faster builds
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // Static assets - cache first (immutable)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Images - cache first with 7 day expiry
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Supabase storage images - stale while revalidate
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // External images (Unsplash, etc) - stale while revalidate
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'external-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Google user profile images
    {
      urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // API routes - network first with 10s timeout fallback
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // Listing pages - stale while revalidate for fast repeat visits
    {
      urlPattern: /\/(businesses|events|tourism|rentals)(\/category\/[^/]+)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'listing-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // Detail pages - stale while revalidate
    {
      urlPattern: /\/(businesses|events|tourism|rentals)\/[^/]+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'detail-pages',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 2 * 60, // 2 minutes
        },
      },
    },
    // Home page - network first with 5s timeout (personalized content)
    {
      urlPattern: /^https?:\/\/[^/]+\/$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'home-page',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // Google Fonts stylesheets
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Google Fonts webfonts
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
