/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
      {
        url: "/icons/icon-192x192.png",
        matcher({ request }) {
          return request.destination === "image";
        },
      },
    ],
  },
  runtimeCaching: [
    // Auth routes - always network only
    {
      matcher({ url }) {
        return url.pathname.startsWith("/auth/");
      },
      handler: new NetworkOnly(),
    },
    // Next.js static assets
    {
      matcher({ url }) {
        return url.pathname.startsWith("/_next/static/");
      },
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Local images
    {
      matcher({ url }) {
        return /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i.test(url.pathname);
      },
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Supabase storage
    {
      matcher({ url }) {
        return url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/");
      },
      handler: new StaleWhileRevalidate({
        cacheName: "supabase-storage",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Unsplash images
    {
      matcher({ url }) {
        return url.hostname === "images.unsplash.com";
      },
      handler: new StaleWhileRevalidate({
        cacheName: "external-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Google user content (profile photos)
    {
      matcher({ url }) {
        return url.hostname === "lh3.googleusercontent.com";
      },
      handler: new StaleWhileRevalidate({
        cacheName: "google-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    // API routes
    {
      matcher({ url }) {
        return url.pathname.startsWith("/api/");
      },
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60,
          }),
        ],
      }),
    },
    // Listing pages (businesses, events, tourism, rentals)
    {
      matcher({ url }) {
        return /^\/(businesses|events|tourism|rentals)(\/category\/[^/]+)?$/.test(url.pathname);
      },
      handler: new StaleWhileRevalidate({
        cacheName: "listing-pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60,
          }),
        ],
      }),
    },
    // Detail pages
    {
      matcher({ url }) {
        return /^\/(businesses|events|tourism|rentals)\/[^/]+$/.test(url.pathname);
      },
      handler: new StaleWhileRevalidate({
        cacheName: "detail-pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 2 * 60,
          }),
        ],
      }),
    },
    // Home page
    {
      matcher({ url }) {
        return url.pathname === "/";
      },
      handler: new NetworkFirst({
        cacheName: "home-page",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1,
            maxAgeSeconds: 5 * 60,
          }),
        ],
      }),
    },
    // Google Fonts stylesheets
    {
      matcher({ url }) {
        return url.hostname === "fonts.googleapis.com";
      },
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Google Fonts webfonts
    {
      matcher({ url }) {
        return url.hostname === "fonts.gstatic.com";
      },
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Default cache for everything else
    ...defaultCache,
  ],
});

serwist.addEventListeners();
