'use client'

import { useEffect, useState } from 'react'
import { useMultiStepForm, FormStepConfig } from '@/hooks/useMultiStepForm'
import { FormProgressBar, ProgressStep } from './FormProgressBar'
import { FormNavigation } from './FormNavigation'
import { FormStep } from './FormStep'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasDraft, getDraftTimestamp } from '@/lib/formDraftStorage'

interface MultiStepFormWrapperProps<T> {
  steps: FormStepConfig[]
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  onSaveDraft?: (data: Partial<T>) => void
  formType: 'business' | 'rental' | 'event' | 'tourism'
  userId: string
  renderStep: (
    stepId: string,
    formData: Partial<T>,
    updateFormData: (data: Partial<T>) => void,
    errors: Record<string, string>
  ) => React.ReactNode
  className?: string
  progressSteps?: ProgressStep[]
}

export function MultiStepFormWrapper<T extends Record<string, any>>({
  steps,
  initialData,
  onSubmit,
  onSaveDraft,
  formType,
  userId,
  renderStep,
  className,
  progressSteps,
}: MultiStepFormWrapperProps<T>) {
  const [previousStep, setPreviousStep] = useState(0)
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<Date | null>(null)

  const {
    currentStep,
    totalSteps,
    formData,
    completedSteps,
    errors,
    isSubmitting,
    isDirty,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    canGoBack,
    canGoNext,
    canSkip,
    updateFormData,
    nextStep,
    previousStep: prevStep,
    skipStep,
    handleSubmit,
    saveDraft,
    setErrors,
  } = useMultiStepForm<T>({
    steps,
    initialData,
    formType,
    userId,
    onSubmit,
    onSaveDraft,
  })

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft(formType, userId)) {
      const timestamp = getDraftTimestamp(formType, userId)
      setDraftTimestamp(timestamp)
      setShowDraftNotification(true)
    }
  }, [formType, userId])

  // Track step direction for animations
  useEffect(() => {
    setPreviousStep(currentStep)
  }, [currentStep])

  const direction = currentStep > previousStep ? 'forward' : 'backward'

  // Convert steps to progress steps if not provided
  const displayProgressSteps: ProgressStep[] =
    progressSteps ||
    steps.map(step => ({
      label: step.title,
      icon: step.icon,
    }))

  // Handle next button click (validation happens in useMultiStepForm)
  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      nextStep()
    }
  }

  // Handle manual draft save
  const handleSaveDraft = () => {
    saveDraft()
    // Show success toast (could integrate with a toast library)
    console.log('Draft saved successfully')
  }

  // Prevent accidental navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <>
      {/* Mobile Layout - iOS Style */}
      <div className={cn('lg:hidden relative flex min-h-screen w-full flex-col h-screen overflow-hidden', className)}>
        {/* Sticky Header with Progress */}
        <header className="flex-shrink-0 w-full bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 shadow-sm z-10">
          <div className="flex items-center p-4">
            {/* Back Button */}
            <button
              onClick={prevStep}
              disabled={!canGoBack || isSubmitting}
              className="text-gray-700 dark:text-white flex size-10 shrink-0 items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Centered Title */}
            <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
              {currentStepConfig?.title || 'Form'}
            </h1>

            {/* Spacer for symmetry */}
            <div className="size-10 shrink-0"></div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <FormProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={displayProgressSteps}
              completedSteps={completedSteps}
            />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Sticky Step Description */}
          {currentStepConfig?.description && (
            <div className="sticky top-0 z-[9] bg-gradient-to-b from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 px-4 pt-4 pb-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed">
                {currentStepConfig.description}
              </p>
            </div>
          )}

          {/* Main Content */}
          <main className="px-4 pb-32">
          {/* Draft notification */}
          {showDraftNotification && draftTimestamp && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  Draft saved {draftTimestamp.toLocaleDateString()} at{' '}
                  {draftTimestamp.toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDraftNotification(false)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2 text-sm">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="text-xs">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Form Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <FormStep
                key={step.id}
                title={step.title}
                description={step.description}
                isActive={index === currentStep}
                direction={direction}
              >
                {renderStep(step.id, formData, updateFormData, errors)}
              </FormStep>
            ))}
          </div>
        </main>
        </div>

        {/* Fixed Bottom Navigation - Mobile Only */}
        <FormNavigation
          onBack={prevStep}
          onNext={handleNext}
          onSkip={canSkip ? skipStep : undefined}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          canSkip={canSkip}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          className="lg:hidden"
        />
      </div>

      {/* Desktop Layout - Traditional Card */}
      <div className={cn('hidden lg:block w-full max-w-4xl mx-auto py-8 px-4', className)}>
        {/* Draft notification */}
        {showDraftNotification && draftTimestamp && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Draft saved {draftTimestamp.toLocaleDateString()} at{' '}
                {draftTimestamp.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDraftNotification(false)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <FormProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={displayProgressSteps}
            completedSteps={completedSteps}
          />
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-8">
          {/* Step Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStepConfig?.title || 'Form'}
            </h2>
            {currentStepConfig?.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepConfig.description}
              </p>
            )}
          </div>

          {/* Form Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <FormStep
                key={step.id}
                title={step.title}
                description={step.description}
                isActive={index === currentStep}
                direction={direction}
              >
                {renderStep(step.id, formData, updateFormData, errors)}
              </FormStep>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={!canGoBack || isSubmitting}
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit'
              ) : (
                <>
                  Continue
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
