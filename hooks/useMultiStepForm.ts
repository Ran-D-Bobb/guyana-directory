'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadDraft, saveDraft, clearDraft } from '@/lib/formDraftStorage'

export interface FormStepConfig {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  validate?: (data: any) => Record<string, string> | null
  canSkip?: boolean
}

interface UseMultiStepFormOptions<T> {
  steps: FormStepConfig[]
  initialData?: Partial<T>
  formType: 'business' | 'rental' | 'event' | 'tourism'
  userId: string
  onSubmit: (data: T) => Promise<void>
  onSaveDraft?: (data: Partial<T>) => void
}

export function useMultiStepForm<T extends Record<string, any>>({
  steps,
  initialData = {},
  formType,
  userId,
  onSubmit,
  onSaveDraft,
}: UseMultiStepFormOptions<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize current step from URL or default to 0
  const [currentStep, setCurrentStep] = useState(() => {
    const stepParam = searchParams?.get('step')
    const stepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0
    return Math.max(0, Math.min(stepIndex, steps.length - 1))
  })

  // Load draft data or use initial data
  const [formData, setFormData] = useState<Partial<T>>(() => {
    const draft = loadDraft<T>(formType, userId)
    return draft || initialData
  })

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Sync current step with URL
  useEffect(() => {
    const newUrl = `?step=${currentStep + 1}`
    router.replace(newUrl, { scroll: false })
  }, [currentStep, router])

  // Auto-save draft when form data changes
  useEffect(() => {
    if (isDirty && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft(formType, userId, formData)
        onSaveDraft?.(formData)
      }, 1000) // Debounce by 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [formData, isDirty, formType, userId, onSaveDraft])

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setIsDirty(true)
  }, [])

  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step.validate) return true

    const stepErrors = step.validate(formData)
    if (stepErrors && Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return false
    }

    setErrors({})
    return true
  }, [steps, formData])

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return

    // Validate current step before moving forward
    if (stepIndex > currentStep && !validateStep(currentStep)) {
      return
    }

    // Mark current step as completed when moving forward
    if (stepIndex > currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    }

    setCurrentStep(stepIndex)
    setErrors({}) // Clear errors when changing steps

    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep, validateStep, steps.length])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, steps.length, goToStep])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const skipStep = useCallback(() => {
    const step = steps[currentStep]
    if (step.canSkip && currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      goToStep(currentStep + 1)
    }
  }, [currentStep, steps, goToStep])

  const handleSubmit = useCallback(async () => {
    // Validate final step
    if (!validateStep(currentStep)) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData as T)
      // Clear draft after successful submission
      clearDraft(formType, userId)
      setIsDirty(false)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [currentStep, formData, formType, userId, onSubmit, validateStep])

  const manualSaveDraft = useCallback(() => {
    saveDraft(formType, userId, formData)
    onSaveDraft?.(formData)
    setIsDirty(false)
  }, [formType, userId, formData, onSaveDraft])

  const resetForm = useCallback(() => {
    setFormData(initialData)
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setErrors({})
    setIsDirty(false)
    clearDraft(formType, userId)
  }, [formType, userId, initialData])

  return {
    // State
    currentStep,
    totalSteps: steps.length,
    formData,
    completedSteps,
    errors,
    isSubmitting,
    isDirty,

    // Current step info
    currentStepConfig: steps[currentStep],
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    canGoBack: currentStep > 0,
    canGoNext: currentStep < steps.length - 1,
    canSkip: steps[currentStep]?.canSkip || false,

    // Actions
    updateFormData,
    goToStep,
    nextStep,
    previousStep,
    skipStep,
    handleSubmit,
    saveDraft: manualSaveDraft,
    resetForm,
    setErrors,
  }
}
