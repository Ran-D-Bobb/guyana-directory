'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface TextInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  maxLength?: number
  helperText?: string
  icon?: React.ReactNode
  type?: 'text' | 'email' | 'url' | 'tel'
  className?: string
}

export function TextInput({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  placeholder,
  maxLength,
  helperText,
  icon,
  type = 'text',
  className,
}: TextInputProps) {
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {maxLength && (
          <span
            className={cn(
              'text-xs',
              value.length > maxLength * 0.9
                ? 'text-amber-600 font-medium'
                : 'text-[hsl(var(--muted-foreground))]'
            )}
          >
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          aria-invalid={showError ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={showError ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full px-4 py-3',
            'border rounded-xl',
            'bg-[hsl(var(--background))]',
            'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px] md:min-h-[44px]',
            icon && 'pl-10',
            (showSuccess || showError) && 'pr-10',
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
