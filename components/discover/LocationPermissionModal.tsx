'use client';

import { Navigation, Loader2, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPermissionModalProps {
  open: boolean;
  onClose: () => void;
  onRequestLocation: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function LocationPermissionModal({
  open,
  onClose,
  onRequestLocation,
  isLoading,
  error,
}: LocationPermissionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div
        className={cn(
          'relative z-10 w-full sm:max-w-sm sm:mx-4',
          'bg-[hsl(var(--card))]',
          'rounded-t-2xl sm:rounded-2xl',
          'border border-[hsl(var(--border))]',
          'shadow-xl',
          'animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95',
          'duration-200'
        )}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-[hsl(var(--primary))]" />
          </div>

          <h2 className="font-display text-xl text-foreground mb-2">
            Find places near you
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-6">
            See what&apos;s closest and get distances to businesses, restaurants, and more.
            Your location stays on your device.
          </p>

          {/* CTA */}
          <button
            onClick={onRequestLocation}
            disabled={isLoading}
            className={cn(
              'w-full py-3 px-6 rounded-xl',
              'bg-[hsl(var(--primary))] text-white',
              'hover:opacity-90',
              'font-medium text-[15px]',
              'flex items-center justify-center gap-2.5',
              'transition-opacity',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding you...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Enable location
              </>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={onClose}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
