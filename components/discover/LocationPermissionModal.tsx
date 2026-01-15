'use client';

import { Navigation, Loader2, X, Compass, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[hsl(158_64%_6%/0.95)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md mx-4',
          'bg-[hsl(158_55%_10%)] rounded-3xl',
          'border border-[hsl(160_40%_20%/0.5)]',
          'shadow-2xl shadow-black/50',
          'overflow-hidden',
          'animate-fade-in-scale'
        )}
      >
        {/* Gradient glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 z-20',
            'w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'text-emerald-300/60 hover:text-emerald-200',
            'hover:bg-emerald-500/10',
            'transition-all duration-200'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 pt-10">
          {/* Header with icon */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-6">
              {/* Main icon container */}
              <div
                className={cn(
                  'w-24 h-24 rounded-2xl rotate-6',
                  'bg-gradient-to-br from-emerald-500/20 to-teal-600/20',
                  'border border-emerald-500/30',
                  'flex items-center justify-center',
                  'shadow-lg shadow-emerald-500/10'
                )}
              >
                <Compass className="w-12 h-12 text-emerald-400 -rotate-6" />
              </div>
              {/* Floating sparkle */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-float">
                <Sparkles className="w-4 h-4 text-amber-900" />
              </div>
            </div>

            <h2 className="font-display text-3xl text-emerald-50 mb-3">
              Discover Around You
            </h2>
            <p className="text-emerald-200/70 text-base leading-relaxed max-w-xs mx-auto">
              Find hidden gems, local favorites, and unique experiences nearby.
            </p>
          </div>

          {/* Enable Location Button */}
          <button
            onClick={onRequestLocation}
            disabled={isLoading}
            className={cn(
              'w-full py-4 px-6 rounded-2xl',
              'bg-gradient-to-r from-emerald-500 to-teal-500',
              'hover:from-emerald-400 hover:to-teal-400',
              'text-white font-semibold text-lg',
              'flex items-center justify-center gap-3',
              'shadow-xl shadow-emerald-500/30',
              'transition-all duration-300',
              'hover:shadow-emerald-500/40 hover:scale-[1.02]',
              'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100',
              'group'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Finding your location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Enable Location</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
