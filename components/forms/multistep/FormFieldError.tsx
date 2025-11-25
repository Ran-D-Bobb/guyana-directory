'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldErrorProps {
  error?: string
  className?: string
}

export function FormFieldError({ error, className }: FormFieldErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('overflow-hidden', className)}
        >
          <div className="flex items-start gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface FormFieldWrapperProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormFieldWrapper({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={cn(error && 'relative')}>
        {children}
      </div>
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      <FormFieldError error={error} />
    </div>
  )
}
