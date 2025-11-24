'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  mode: 'date' | 'time' | 'datetime'
  required?: boolean
  error?: string
  min?: string
  max?: string
  helperText?: string
  className?: string
}

export function DateTimePicker({
  label,
  name,
  value,
  onChange,
  mode,
  required = false,
  error,
  min,
  max,
  helperText,
  className,
}: DateTimePickerProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const handleBlur = () => {
    setIsFocused(false)
    setIsTouched(true)
  }

  // Determine input type based on mode
  const inputType =
    mode === 'date'
      ? 'date'
      : mode === 'time'
      ? 'time'
      : 'datetime-local'

  // Get appropriate icon
  const Icon = mode === 'time' ? Clock : Calendar

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          min={min}
          max={max}
          required={required}
          className={cn(
            'w-full px-3 py-2.5 md:py-2',
            'border rounded-lg',
            'text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[44px] md:min-h-[40px]', // Minimum touch target for mobile
            'pl-10 pr-10',
            !value && 'text-gray-400',
            showError &&
              'border-red-300 focus:border-red-500 focus:ring-red-500/20',
            showSuccess &&
              'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20',
            !showError &&
              !showSuccess &&
              'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20',
            isFocused && 'ring-2'
          )}
        />

        {/* Success/Error icon */}
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
            <Check className="w-5 h-5" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Helper text or error message */}
      {showError ? (
        <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )
      )}
    </div>
  )
}
