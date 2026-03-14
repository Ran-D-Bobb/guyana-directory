'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, Phone } from 'lucide-react'

interface PhoneInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  defaultCountryCode?: string
  helperText?: string
  className?: string
}

// Format Guyanese phone numbers correctly
function formatPhone(digits: string): string {
  if (!digits) return ''
  // 7 digits: local Guyana number → XXX-XXXX
  if (digits.length === 7) {
    return digits.replace(/(\d{3})(\d{4})/, '$1-$2')
  }
  // 10 digits starting with 592: international Guyana → 592 XXX-XXXX
  if (digits.length === 10 && digits.startsWith('592')) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2-$3')
  }
  // Fallback: return digits as-is
  return digits
}

export function PhoneInput({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  defaultCountryCode = '592', // Guyana country code
  helperText = 'Include country code (e.g., 592 for Guyana)',
  className,
}: PhoneInputProps) {
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

  // Format phone number as user types
  const handleChange = (newValue: string) => {
    // Remove all non-numeric characters
    const cleaned = newValue.replace(/\D/g, '')
    onChange(cleaned)
  }

  // Display formatted phone number
  const displayValue = formatPhone(value)

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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
          <Phone className="w-5 h-5" />
        </div>

        <input
          id={name}
          name={name}
          type="tel"
          value={displayValue}
          onChange={e => handleChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          placeholder={`+${defaultCountryCode} XXX-XXXX`}
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
            'pl-10 pr-10',
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
