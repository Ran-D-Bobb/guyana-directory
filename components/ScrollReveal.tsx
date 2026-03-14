'use client';

import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

type RevealVariant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Stagger delay in ms (for use inside grids) */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  className?: string;
  as?: React.ElementType;
}

const VARIANT_STYLES: Record<RevealVariant, { from: string; to: string }> = {
  'fade-up': {
    from: 'opacity-0 translate-y-6',
    to: 'opacity-100 translate-y-0',
  },
  'fade-in': {
    from: 'opacity-0',
    to: 'opacity-100',
  },
  'slide-left': {
    from: 'opacity-0 -translate-x-6',
    to: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    from: 'opacity-0 translate-x-6',
    to: 'opacity-100 translate-x-0',
  },
  scale: {
    from: 'opacity-0 scale-95',
    to: 'opacity-100 scale-100',
  },
};

/**
 * Wraps children in a scroll-triggered reveal animation.
 * Uses IntersectionObserver — no JS animation library needed.
 * Fully respects prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className,
  as: Component = 'div',
}: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const styles = VARIANT_STYLES[variant];

  return (
    <Component
      ref={ref}
      className={cn(
        'transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)]',
        inView ? styles.to : styles.from,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: inView ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </Component>
  );
}
