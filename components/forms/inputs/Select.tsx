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

  const handleBlur = () => {
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          required={required}
          className={cn(
            'w-full px-4 py-3',
            'border rounded-xl',
            'bg-white',
            'text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'min-h-[48px]',
            'appearance-none cursor-pointer',
            'pr-10',
            showError &&
              'border-red-500 focus:border-red-500 focus:ring-red-100',
            showSuccess &&
              'border-gray-900 focus:border-gray-900 focus:ring-gray-100',
            !showError &&
              !showSuccess &&
              'border-gray-200 focus:border-gray-900 focus:ring-gray-100'
          )}
          style={{ color: value ? '#111827' : '#9ca3af' }}
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

        {/* Icon container */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {showSuccess && (
            <Check className="w-5 h-5 text-gray-900" />
          )}
          {showError && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Helper text or error message */}
      {showError ? (
        <p className="text-sm text-red-500 mt-1.5 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-sm text-gray-500 mt-1.5">{helperText}</p>
        )
      )}
    </div>
  )
}
