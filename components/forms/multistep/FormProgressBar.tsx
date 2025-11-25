'use client'

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
  className?: string
}

export function FormProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  className,
}: FormProgressBarProps) {
  return (
    <div className={cn('flex w-full flex-row items-center justify-center gap-2 py-3', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = completedSteps.has(index) || index < currentStep
        const isCurrent = index === currentStep

        return (
          <div
            key={index}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-300',
              isCurrent && 'bg-gray-900',
              isCompleted && 'bg-gray-900',
              !isCurrent && !isCompleted && 'bg-gray-200'
            )}
          />
        )
      })}
    </div>
  )
}
