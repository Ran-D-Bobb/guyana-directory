'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type Coordinates,
  type LocationResult,
  requestLocation,
  isGeolocationAvailable,
} from '@/lib/geolocation';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

interface UseUserLocationReturn {
  coords: Coordinates | null;
  status: LocationStatus;
  error: string | null;
  isLoading: boolean;
  isAvailable: boolean;
  requestPermission: () => Promise<void>;
  clearLocation: () => void;
}

const STORAGE_KEY = 'waypoint_user_location';
const PERMISSION_KEY = 'waypoint_location_permission';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface StoredLocation {
  coords: Coordinates;
  timestamp: number;
}

/**
 * Hook for managing user location state
 * - Persists permission status to localStorage
 * - Caches location for session
 * - Provides loading/error/success states
 */
export function useUserLocation(): UseUserLocationReturn {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isAvailable = typeof window !== 'undefined' && isGeolocationAvailable();

  // Load cached location on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for cached location
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const stored: StoredLocation = JSON.parse(cached);
        const age = Date.now() - stored.timestamp;
        if (age < CACHE_DURATION) {
          setCoords(stored.coords);
          setStatus('granted');
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Check previous permission status
    const permissionStatus = localStorage.getItem(PERMISSION_KEY);
    if (permissionStatus === 'denied') {
      setStatus('denied');
    } else if (permissionStatus === 'unavailable') {
      setStatus('unavailable');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isAvailable) {
      setStatus('unavailable');
      setError('Geolocation is not supported');
      localStorage.setItem(PERMISSION_KEY, 'unavailable');
      return;
    }

    setStatus('requesting');
    setError(null);

    const result: LocationResult = await requestLocation();

    if (result.success && result.coords) {
      setCoords(result.coords);
      setStatus('granted');
      setError(null);
      localStorage.setItem(PERMISSION_KEY, 'granted');

      // Cache the location
      const stored: StoredLocation = {
        coords: result.coords,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } else {
      setStatus(result.error?.includes('denied') ? 'denied' : 'error');
      setError(result.error || 'Failed to get location');

      if (result.error?.includes('denied')) {
        localStorage.setItem(PERMISSION_KEY, 'denied');
      }
    }
  }, [isAvailable]);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setStatus('idle');
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERMISSION_KEY);
  }, []);

  return {
    coords,
    status,
    error,
    isLoading: status === 'requesting',
    isAvailable,
    requestPermission,
    clearLocation,
  };
}
