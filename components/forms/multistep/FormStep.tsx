'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FormStepProps {
  title: string
  description?: string
  children: React.ReactNode
  isActive: boolean
  direction?: 'forward' | 'backward'
}

export function FormStep({
  title,
  children,
  isActive,
  direction = 'forward',
}: FormStepProps) {
  // title is used as key for animation
  const variants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -20 : 20,
      opacity: 0,
    }),
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={title}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.2, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          <div className="space-y-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
