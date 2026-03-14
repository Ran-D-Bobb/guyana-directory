'use client'

import { useState } from 'react'
import { Check, ChevronDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
  error?: string
  placeholder?: string
  helperText?: string
  className?: string
}

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder = 'Select an option',
  helperText,
  className,
}: SelectProps) {
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

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
        <select
          id={name}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          required={required}
          aria-invalid={showError ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={showError ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full px-4 py-3',
            'border rounded-xl',
            'bg-[hsl(var(--background))]',
            value ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px] md:min-h-[44px]',
            'appearance-none cursor-pointer',
            'pr-10',
            showError &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            showSuccess &&
              'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
            !showError &&
              !showSuccess &&
              'border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-emerald-500/20'
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {showSuccess && (
            <Check className="w-5 h-5 text-emerald-500" />
          )}
          {showError && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <ChevronDown className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </div>
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
