'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormStepIndicatorProps {
  currentStep: number
  totalSteps: number
  variant?: 'dots' | 'bar'
  className?: string
}

export function FormStepIndicator({
  currentStep,
  totalSteps,
  variant = 'dots',
  className,
}: FormStepIndicatorProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <motion.div
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              index === currentStep
                ? 'w-8 bg-emerald-600'
                : index < currentStep
                ? 'w-2 bg-emerald-400'
                : 'w-2 bg-gray-300'
            )}
            initial={false}
            animate={{
              scale: index === currentStep ? 1.1 : 1,
            }}
          />
        ))}
      </div>
    )
  }

  // Bar variant (for desktop)
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn('relative w-full', className)}>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
