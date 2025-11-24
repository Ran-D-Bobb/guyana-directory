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
  const [isFocused, setIsFocused] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched
  const showSuccess = !error && value && isTouched && required

  const handleBlur = () => {
    setIsFocused(false)
    setIsTouched(true)
  }

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
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className={cn(
            'w-full px-3 py-2.5 md:py-2',
            'border rounded-lg',
            'text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[44px] md:min-h-[40px]', // Minimum touch target for mobile
            icon && 'pl-10',
            (showSuccess || showError) && 'pr-10',
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
      ) : helperText ? (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      ) : maxLength ? (
        <p className="text-xs text-gray-500 mt-1 text-right">
          {value.length} / {maxLength}
        </p>
      ) : null}
    </div>
  )
}
