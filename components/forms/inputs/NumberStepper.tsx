'use client'

import { useState } from 'react'
import { Minus, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NumberStepperProps {
  label: string
  name: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  required?: boolean
  error?: string
  helperText?: string
  unit?: string
  className?: string
}

export function NumberStepper({
  label,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  required = false,
  error,
  helperText,
  unit,
  className,
}: NumberStepperProps) {
  const [isTouched, setIsTouched] = useState(false)

  const showError = error && isTouched

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
    setIsTouched(true)
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
    setIsTouched(true)
  }

  const handleInputChange = (inputValue: string) => {
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(numValue, max))
      onChange(clampedValue)
    }
  }

  const canDecrement = value > min
  const canIncrement = value < max

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-3">
        {/* Decrement button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={cn(
            'h-11 w-11 md:h-10 md:w-10 flex-shrink-0',
            'border-gray-300 hover:bg-gray-50',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Minus className="w-4 h-4" />
        </Button>

        {/* Value display */}
        <div className="flex-1 relative">
          <input
            id={name}
            name={name}
            type="number"
            value={value}
            onChange={e => handleInputChange(e.target.value)}
            onBlur={() => setIsTouched(true)}
            min={min}
            max={max}
            step={step}
            required={required}
            className={cn(
              'w-full px-4 py-2.5 md:py-2',
              'border rounded-lg',
              'text-center text-lg font-semibold',
              'text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'transition-all duration-200',
              'min-h-[44px] md:min-h-[40px]',
              '[appearance:textfield]',
              '[&::-webkit-outer-spin-button]:appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none',
              showError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
            )}
          />
          {unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {unit}
            </span>
          )}
        </div>

        {/* Increment button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={cn(
            'h-11 w-11 md:h-10 md:w-10 flex-shrink-0',
            'border-gray-300 hover:bg-gray-50',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Range indicator */}
      {(min !== 0 || max !== 100) && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Range: {min} - {max}
          {unit && ` ${unit}`}
        </p>
      )}

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
