'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPromptProps {
  onEnableLocation: () => void;
  isLoading?: boolean;
}

const STORAGE_KEY = 'waypoint_location_prompt_dismissed';

export function LocationPrompt({ onEnableLocation, isLoading }: LocationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden, show after mount check
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
      // Small delay for smooth appearance
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }, 300);
  };

  const handleEnable = () => {
    onEnableLocation();
    // Don't dismiss immediately - let the parent handle it based on success/failure
  };

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl mb-6 transition-all duration-300',
        'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50',
        'border border-amber-200/60',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Navigation className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">
              Enable location for better results
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              See what&apos;s nearby and get distance info for each listing
            </p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                'hover:from-amber-600 hover:to-orange-600',
                'active:scale-95 shadow-lg shadow-amber-500/25',
                isLoading && 'opacity-70 cursor-wait'
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Locating...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Enable</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility to clear the dismissal (useful for testing or settings page)
export function clearLocationPromptDismissal() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
