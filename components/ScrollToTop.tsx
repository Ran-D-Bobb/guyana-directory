'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating scroll-to-top button that appears after the user
 * scrolls past 600px. Positioned above the mobile BottomNav.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      className={cn(
        'fixed right-4 z-40 p-3 rounded-full',
        'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'border border-gray-200/60 dark:border-white/10',
        'shadow-lg shadow-black/5',
        'text-gray-600 dark:text-gray-300',
        'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400',
        'hover:border-emerald-200 dark:hover:border-emerald-700/40',
        'active:scale-90',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        // Position above BottomNav on mobile (h-16 + safe area ≈ 80px), normal on desktop
        'bottom-20 lg:bottom-6',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
