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
      'bg-white',
      'border-t border-gray-200',
      'shadow-lg',
      className
    )}>
      <div className="flex items-center justify-between gap-4 p-4 max-w-screen-2xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || isSubmitting}
          className={cn(
            'h-12 w-full rounded-xl text-base font-semibold',
            'bg-gray-100',
            'text-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'hover:bg-gray-200 active:scale-[0.98]',
            'border border-gray-200'
          )}
        >
          {backLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className={cn(
            'h-12 w-full rounded-xl text-base font-semibold',
            'bg-gray-900 text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300',
            'transition-all duration-200',
            'hover:bg-gray-800 active:scale-[0.98]',
            'flex items-center justify-center gap-2'
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
