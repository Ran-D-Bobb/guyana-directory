'use client';

import { useEffect } from 'react';

export function ConsoleEasterEgg() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const styles = [
      'color: #10b981',
      'font-size: 16px',
      'font-weight: bold',
      'padding: 8px 0',
    ].join(';');

    const subtitleStyles = [
      'color: #6b7280',
      'font-size: 12px',
    ].join(';');

    console.log(
      '%c🌿 Waypoint — Discover Guyana',
      styles
    );
    console.log(
      '%cBuilt with love from the Land of Many Waters.\nCurious about how this works? We\'d love to chat → waypointgy.com',
      subtitleStyles
    );
  }, []);

  return null;
}
