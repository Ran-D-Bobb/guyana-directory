'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getPasswordRequirements } from '@/lib/validations/auth'

interface PasswordInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  showStrengthIndicator?: boolean
  className?: string
}

export function PasswordInput({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  placeholder = 'Enter password',
  showStrengthIndicator = false,
  className,
}: PasswordInputProps) {
  const [isTouched, setIsTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const requirements = getPasswordRequirements(value)
  const requirementsMet = Object.values(requirements).filter(Boolean).length

  const errorId = `${name}-error`

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
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          required={required}
          aria-invalid={showError ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={showError ? errorId : undefined}
          className={cn(
            'w-full px-4 py-3 pr-20',
            'border rounded-xl',
            'bg-[hsl(var(--background))]',
            'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px] md:min-h-[44px]',
            showError &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            showSuccess &&
              'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
            !showError &&
              !showSuccess &&
              'border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-emerald-500/20'
          )}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-1"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>

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

      {showStrengthIndicator && value && !showError && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  requirementsMet >= level
                    ? requirementsMet === 4
                      ? 'bg-emerald-500'
                      : requirementsMet >= 3
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    : 'bg-[hsl(var(--border))]'
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.minLength ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'
              )}
            >
              {requirements.minLength ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[hsl(var(--border))]" />
              )}
              8+ characters
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasUppercase ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'
              )}
            >
              {requirements.hasUppercase ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[hsl(var(--border))]" />
              )}
              Uppercase
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasLowercase ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'
              )}
            >
              {requirements.hasLowercase ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[hsl(var(--border))]" />
              )}
              Lowercase
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasNumber ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'
              )}
            >
              {requirements.hasNumber ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-[hsl(var(--border))]" />
              )}
              Number
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
