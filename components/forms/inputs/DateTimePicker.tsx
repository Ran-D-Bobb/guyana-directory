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
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

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
        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          min={min}
          max={max}
          required={required}
          aria-invalid={showError ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={showError ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full px-4 py-3',
            'border rounded-xl',
            'bg-[hsl(var(--background))]',
            'text-[hsl(var(--foreground))]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px] md:min-h-[44px]',
            'pl-10 pr-10',
            !value && 'text-[hsl(var(--muted-foreground))]',
            showError &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            showSuccess &&
              'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
            !showError &&
              !showSuccess &&
              'border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-emerald-500/20'
          )}
        />

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

      {showError && (
        <p id={errorId} className="text-sm text-red-600 mt-1.5">
          {error}
        </p>
      )}

      {helperText && !showError && (
        <p id={helperId} className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  )
}
