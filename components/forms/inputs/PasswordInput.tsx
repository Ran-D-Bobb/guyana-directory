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
  const [isFocused, setIsFocused] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const requirements = getPasswordRequirements(value)
  const requirementsMet = Object.values(requirements).filter(Boolean).length

  const handleBlur = () => {
    setIsFocused(false)
    setIsTouched(true)
  }

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-900 mb-1.5"
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
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            'w-full px-4 py-3 pr-20',
            'border rounded-xl',
            'bg-white',
            'text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px]',
            showError &&
              'border-red-500 focus:border-red-500 focus:ring-red-100',
            showSuccess &&
              'border-gray-900 focus:border-gray-900 focus:ring-gray-100',
            !showError &&
              !showSuccess &&
              'border-gray-200 focus:border-gray-900 focus:ring-gray-100',
            isFocused && !showError && 'ring-2 ring-gray-100'
          )}
        />

        {/* Show/Hide password toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>

        {/* Success/Error icon */}
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900">
            <Check className="w-5 h-5" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p className="text-sm text-red-500 mt-1.5 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Password strength indicator */}
      {showStrengthIndicator && value && !showError && (
        <div className="mt-2 space-y-2">
          {/* Strength bar */}
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
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>

          {/* Requirements list */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.minLength ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {requirements.minLength ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300" />
              )}
              8+ characters
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasUppercase ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {requirements.hasUppercase ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300" />
              )}
              Uppercase
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasLowercase ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {requirements.hasLowercase ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300" />
              )}
              Lowercase
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                requirements.hasNumber ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {requirements.hasNumber ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300" />
              )}
              Number
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
