import type { NextConfig } from "next";

/**
 * Next.js config for Capacitor mobile builds
 * Uses static export instead of PWA service worker
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
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
        protocol: 'https',
        hostname: 'cgkjhdqyaxkcianuwevp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Disable trailing slashes for Capacitor compatibility
  trailingSlash: false,
};

export default nextConfig;
