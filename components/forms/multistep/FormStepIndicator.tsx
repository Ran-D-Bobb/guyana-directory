'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormStepIndicatorProps {
  currentStep: number
  totalSteps: number
  variant?: 'dots' | 'bar'
  showStepCount?: boolean
  className?: string
}

export function FormStepIndicator({
  currentStep,
  totalSteps,
  variant = 'dots',
  showStepCount = true,
  className,
}: FormStepIndicatorProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {/* Step counter */}
        {showStepCount && (
          <span className="text-xs font-medium text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
        )}

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <motion.div
                key={index}
                className={cn(
                  'relative h-2.5 rounded-full transition-all duration-200',
                  isCurrent
                    ? 'w-8 bg-emerald-600 ring-2 ring-emerald-100'
                    : isCompleted
                    ? 'w-2.5 bg-emerald-600'
                    : 'w-2.5 bg-gray-300'
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {/* Checkmark for completed */}
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" strokeWidth={4} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Bar variant (for desktop)
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn('relative w-full', className)}>
      {/* Step counter */}
      {showStepCount && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(progress)}% complete
          </span>
        </div>
      )}

      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
