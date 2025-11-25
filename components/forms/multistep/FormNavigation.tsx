'use client'

import { Loader2, SkipForward } from 'lucide-react'
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
  skipLabel?: string
  className?: string
}

export function FormNavigation({
  onBack,
  onNext,
  onSkip,
  canGoBack,
  canGoNext,
  canSkip = false,
  isLastStep,
  isSubmitting = false,
  nextLabel = 'Continue',
  backLabel = 'Back',
  submitLabel = 'Submit',
  skipLabel = 'Skip',
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
      <div className="flex flex-col gap-3 p-4 max-w-screen-2xl mx-auto">
        {/* Skip button - shown above main navigation when step is skippable */}
        {canSkip && onSkip && !isLastStep && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className={cn(
              'h-10 w-full rounded-lg text-sm font-medium',
              'text-gray-500 hover:text-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              'flex items-center justify-center gap-2',
              'hover:bg-gray-50'
            )}
          >
            <SkipForward className="w-4 h-4" />
            {skipLabel} this step
          </button>
        )}

        {/* Main navigation buttons */}
        <div className="flex items-center justify-between gap-4">
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
              'bg-emerald-600 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300',
              'transition-all duration-200',
              'hover:bg-emerald-700 active:scale-[0.98]',
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
      </div>
    </footer>
  )
}
