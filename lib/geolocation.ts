/**
 * Geolocation utilities for the Discover feature
 * Provides location request, distance calculation, and human-friendly formatting
 * Uses Capacitor Geolocation plugin for native apps, falls back to browser API
 */

import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type DistanceTier = 'steps' | 'walk' | 'quick' | 'drive' | 'adventure';

export interface LocationResult {
  success: boolean;
  coords?: Coordinates;
  error?: string;
}

// Guyana center coordinates (fallback)
export const GUYANA_CENTER: Coordinates = {
  lat: 6.8013,
  lng: -58.1551, // Georgetown
};

/**
 * Request user's current location
 * Uses Capacitor plugin on native platforms, browser API on web
 * Returns coordinates or an error message
 */
export async function requestLocation(): Promise<LocationResult> {
  // Use Capacitor Geolocation on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // Request permissions first on native
      const permissionStatus = await Geolocation.requestPermissions();

      if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
        return {
          success: false,
          error: 'Location permission denied',
        };
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      });

      return {
        success: true,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location';
      return {
        success: false,
        error: errorMessage.includes('denied') ? 'Location permission denied' : errorMessage,
      };
    }
  }

  // Fall back to browser API on web
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        resolve({
          success: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get the distance tier for a given distance in meters
 */
export function getDistanceTier(meters: number): DistanceTier {
  if (meters < 500) return 'steps';
  if (meters < 1500) return 'walk';
  if (meters < 5000) return 'quick';
  if (meters < 20000) return 'drive';
  return 'adventure';
}

/**
 * Format distance in human-friendly terms
 * Uses tier-based labels instead of raw numbers
 */
export function formatDistance(meters: number): string {
  const tier = getDistanceTier(meters);

  switch (tier) {
    case 'steps':
      return 'Steps away';
    case 'walk':
      return 'Short walk';
    case 'quick':
      return 'Quick trip';
    case 'drive':
      return 'Worth the drive';
    case 'adventure':
      return 'Adventure awaits';
  }
}

/**
 * Format distance with approximate time
 * Assumes walking speed of 5 km/h, driving speed of 40 km/h
 */
export function formatDistanceWithTime(meters: number): string {
  if (meters < 500) {
    const mins = Math.ceil(meters / 83); // ~5km/h walking
    return `${mins} min walk`;
  }
  if (meters < 2000) {
    const mins = Math.ceil(meters / 83);
    return `${mins} min walk`;
  }
  if (meters < 10000) {
    const mins = Math.ceil(meters / 667); // ~40km/h driving
    return `${mins} min drive`;
  }
  const km = Math.round(meters / 1000);
  return `${km} km away`;
}

/**
 * Get tier styling classes for badges
 */
export function getDistanceTierStyles(tier: DistanceTier): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (tier) {
    case 'steps':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        icon: 'Footprints',
      };
    case 'walk':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'PersonStanding',
      };
    case 'quick':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'Car',
      };
    case 'drive':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'Navigation',
      };
    case 'adventure':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        icon: 'Compass',
      };
  }
}

/**
 * Check if geolocation is available
 * Returns true on native platforms (Capacitor) or if browser supports it
 */
export function isGeolocationAvailable(): boolean {
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Sort items by distance from user location
 */
export function sortByDistance<T extends { latitude?: number | null; longitude?: number | null }>(
  items: T[],
  userLat: number,
  userLng: number
): (T & { distance_meters: number })[] {
  return items
    .map((item) => {
      const distance = item.latitude && item.longitude
        ? calculateDistance(userLat, userLng, item.latitude, item.longitude)
        : Infinity;
      return { ...item, distance_meters: distance };
    })
    .sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * Filter items within a radius (in km)
 */
export function filterByRadius<T extends { distance_meters: number }>(
  items: T[],
  radiusKm: number
): T[] {
  const radiusMeters = radiusKm * 1000;
  return items.filter((item) => item.distance_meters <= radiusMeters);
}
