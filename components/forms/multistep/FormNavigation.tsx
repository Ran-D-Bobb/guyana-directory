'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormNavigationProps {
  onBack: () => void
  onNext: () => void
  onSkip?: () => void
  canGoBack: boolean
  canGoNext: boolean
  canSkip?: boolean
  isLastStep: boolean
  isSubmitting?: boolean
  nextLabel?: string
  backLabel?: string
  submitLabel?: string
  className?: string
}

export function FormNavigation({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting = false,
  nextLabel = 'Continue',
  backLabel = 'Back',
  submitLabel = 'Submit',
  className,
}: FormNavigationProps) {
  return (
    <footer className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-white dark:bg-gray-900',
      'border-t-2 border-gray-300 dark:border-gray-700',
      'shadow-lg',
      className
    )}>
      <div className="flex items-center justify-between gap-4 p-4 max-w-screen-2xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || isSubmitting}
          className={cn(
            'h-14 w-full rounded-xl text-base font-bold',
            'bg-gray-300 dark:bg-gray-700',
            'text-gray-800 dark:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'hover:bg-gray-400 dark:hover:bg-gray-600 active:scale-[0.98]',
            'border-2 border-gray-400 dark:border-gray-600'
          )}
        >
          {backLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className={cn(
            'h-14 w-full rounded-xl text-base font-bold',
            'bg-emerald-600 dark:bg-emerald-500 text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700',
            'transition-all duration-200',
            'hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-[0.98]',
            'flex items-center justify-center gap-2',
            'shadow-md'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : isLastStep ? (
            submitLabel
          ) : (
            nextLabel
          )}
        </button>
      </div>
    </footer>
  )
}
