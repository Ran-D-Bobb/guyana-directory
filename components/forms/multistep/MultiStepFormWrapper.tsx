'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useMultiStepForm, FormStepConfig } from '@/hooks/useMultiStepForm'
import { FormProgressBar, ProgressStep } from './FormProgressBar'
import { FormNavigation } from './FormNavigation'
import { FormStep } from './FormStep'
import { FormSuccessScreen } from './FormSuccessScreen'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RotateCcw, FileText, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasDraft, getDraftTimestamp, clearDraft } from '@/lib/formDraftStorage'

interface SuccessConfig {
  title?: string
  message?: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

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
  successConfig?: SuccessConfig
  onSuccess?: (data: T) => void
}

export function MultiStepFormWrapper<T extends object>({
  steps,
  initialData,
  onSubmit,
  onSaveDraft,
  formType,
  userId,
  renderStep,
  className,
  progressSteps,
  successConfig,
  onSuccess,
}: MultiStepFormWrapperProps<T>) {
  const [previousStep, setPreviousStep] = useState(0)
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<Date | null>(null)
  const [showDraftOptions, setShowDraftOptions] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const formContainerRef = useRef<HTMLDivElement>(null)

  // Wrapped submit handler to show success screen
  const handleSubmitWithSuccess = useCallback(async (data: T) => {
    await onSubmit(data)
    setIsSuccess(true)
    onSuccess?.(data)
  }, [onSubmit, onSuccess])

  const {
    currentStep,
    totalSteps,
    formData,
    completedSteps,
    errors,
    isSubmitting,
    isDirty,
    currentStepConfig,
    isLastStep,
    canGoBack,
    canGoNext,
    canSkip,
    updateFormData,
    nextStep,
    previousStep: prevStep,
    skipStep,
    handleSubmit,
    resetForm,
  } = useMultiStepForm<T>({
    steps,
    initialData,
    formType,
    userId,
    onSubmit: handleSubmitWithSuccess,
    onSaveDraft,
  })

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft(formType, userId)) {
      const timestamp = getDraftTimestamp(formType, userId)
      setDraftTimestamp(timestamp)
      setShowDraftOptions(true)
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
  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSubmit()
    } else {
      nextStep()
    }
  }, [isLastStep, handleSubmit, nextStep])

  // Handle starting fresh (clear draft)
  const handleStartFresh = useCallback(() => {
    clearDraft(formType, userId)
    resetForm()
    setShowDraftOptions(false)
    setShowDraftNotification(false)
  }, [formType, userId, resetForm])

  // Handle continuing with draft
  const handleContinueDraft = useCallback(() => {
    setShowDraftOptions(false)
    setShowDraftNotification(true)
  }, [])

  // Scroll to first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0 && formContainerRef.current) {
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = formContainerRef.current.querySelector(`[data-field="${firstErrorField}"]`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [errors])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === 'Enter' && !e.shiftKey && canGoNext && !isSubmitting) {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, isSubmitting, handleNext])

  // Prevent accidental navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSuccess) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, isSuccess])

  // Show success screen after submission
  if (isSuccess) {
    return (
      <FormSuccessScreen
        title={successConfig?.title}
        message={successConfig?.message}
        primaryAction={successConfig?.primaryAction}
        secondaryAction={successConfig?.secondaryAction}
      />
    )
  }

  // Show draft options dialog
  if (showDraftOptions && draftTimestamp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Resume Your Draft?
            </h2>

            <p className="text-gray-600 text-center text-sm mb-6">
              You have an unsaved draft from{' '}
              <span className="font-medium">
                {draftTimestamp.toLocaleDateString()} at {draftTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleContinueDraft}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Continue with Draft
              </Button>

              <Button
                onClick={handleStartFresh}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Layout - iOS Style */}
      <div ref={formContainerRef} className={cn('lg:hidden relative flex min-h-screen w-full flex-col h-screen overflow-hidden bg-gray-50', className)}>
        {/* Sticky Header with Progress */}
        <header className="flex-shrink-0 w-full bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center px-3 py-2">
            {/* Back Button */}
            <button
              onClick={prevStep}
              disabled={!canGoBack || isSubmitting}
              className="text-gray-700 flex size-9 shrink-0 items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Centered Title */}
            <h1 className="text-gray-900 text-base font-semibold leading-tight tracking-tight flex-1 text-center px-2">
              {currentStepConfig?.title || 'Form'}
            </h1>

            {/* Skip button for skippable steps */}
            {canSkip && !isLastStep ? (
              <button
                onClick={skipStep}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 flex size-9 shrink-0 items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Skip this step"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            ) : (
              <div className="size-9 shrink-0"></div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <FormProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={displayProgressSteps}
              completedSteps={completedSteps}
              variant="minimal"
            />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Main Content */}
          <main className="px-4 pt-3 pb-32">
          {/* Draft notification - subtle banner */}
          {showDraftNotification && draftTimestamp && (
            <div className="mb-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs text-amber-800">
                  Continuing from draft
                </span>
              </div>
              <button
                onClick={() => setShowDraftNotification(false)}
                className="text-amber-600 hover:text-amber-800 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error summary with specific messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="text-xs font-medium text-red-700">
                  Please fix the following:
                </span>
              </div>
              <ul className="ml-5 space-y-0.5">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="text-xs text-red-600 list-disc">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Steps - Only render active step */}
          <FormStep
            key={steps[currentStep]?.id}
            title={steps[currentStep]?.title || ''}
            description={steps[currentStep]?.description}
            isActive={true}
            direction={direction}
          >
            {renderStep(steps[currentStep]?.id || '', formData, updateFormData, errors)}
          </FormStep>
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
        {/* Draft notification - subtle banner */}
        {showDraftNotification && draftTimestamp && (
          <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Continuing from draft saved {draftTimestamp.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartFresh}
                className="text-amber-700 hover:text-amber-900 text-sm font-medium underline"
              >
                Start fresh
              </button>
              <button
                onClick={() => setShowDraftNotification(false)}
                className="text-amber-600 hover:text-amber-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar - Detailed variant for desktop */}
        <div className="mb-4">
          <FormProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={displayProgressSteps}
            completedSteps={completedSteps}
            variant="detailed"
          />
        </div>

        {/* Error summary with specific messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-700">
                Please fix the following to continue:
              </span>
            </div>
            <ul className="ml-6 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm text-red-600 list-disc">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Step Title with Skip option */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStepConfig?.title || 'Form'}
              </h2>
              {currentStepConfig?.description && (
                <p className="text-gray-500 text-sm mt-1">
                  {currentStepConfig.description}
                </p>
              )}
            </div>
            {canSkip && !isLastStep && (
              <button
                onClick={skipStep}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Skip this step
              </button>
            )}
          </div>

          {/* Form Steps - Only render active step */}
          <FormStep
            key={steps[currentStep]?.id}
            title={steps[currentStep]?.title || ''}
            description={steps[currentStep]?.description}
            isActive={true}
            direction={direction}
          >
            {renderStep(steps[currentStep]?.id || '', formData, updateFormData, errors)}
          </FormStep>

          {/* Desktop Navigation */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
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

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
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

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to continue
          </p>
        </div>
      </div>
    </>
  )
}
