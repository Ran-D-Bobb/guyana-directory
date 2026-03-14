'use client';

import { usePathname } from 'next/navigation';

/**
 * Hides main site chrome (Header, BottomNav, ScrollToTop, etc.)
 * on routes that have their own dedicated layouts (e.g. /kiosk).
 */
export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKiosk = pathname?.startsWith('/kiosk');

  if (isKiosk) return null;

  return <>{children}</>;
}
