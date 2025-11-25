'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressStep {
  label: string
  icon?: React.ReactNode
}

interface FormProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: ProgressStep[]
  completedSteps: Set<number>
  variant?: 'minimal' | 'detailed'
  className?: string
}

export function FormProgressBar({
  currentStep,
  totalSteps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  steps,
  completedSteps,
  variant = 'minimal',
  className,
}: FormProgressBarProps) {
  if (variant === 'detailed') {
    return (
      <div className={cn('w-full', className)}>
        {/* Step counter inline with progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            {currentStep + 1}/{totalSteps}
          </span>

          {/* Progress bar with segments */}
          <div className="flex w-full flex-row items-center gap-1">
            {Array.from({ length: totalSteps }, (_, index) => {
              const isCompleted = completedSteps.has(index) || index < currentStep
              const isCurrent = index === currentStep

              return (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-300',
                    isCurrent && 'bg-emerald-600',
                    isCompleted && !isCurrent && 'bg-emerald-600',
                    !isCurrent && !isCompleted && 'bg-gray-200'
                  )}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Minimal variant (default) - compact with step counter
  return (
    <div className={cn('w-full', className)}>
      {/* Progress segments with integrated step counter */}
      <div className="flex w-full flex-row items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = completedSteps.has(index) || index < currentStep
          const isCurrent = index === currentStep

          return (
            <div
              key={index}
              className="relative flex-1 flex items-center justify-center"
            >
              <div
                className={cn(
                  'h-2 w-full rounded-full transition-all duration-300',
                  isCurrent && 'bg-emerald-600 ring-2 ring-emerald-100 ring-offset-1',
                  isCompleted && !isCurrent && 'bg-emerald-600',
                  !isCurrent && !isCompleted && 'bg-gray-200'
                )}
              />
              {/* Checkmark for completed steps */}
              {isCompleted && !isCurrent && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
