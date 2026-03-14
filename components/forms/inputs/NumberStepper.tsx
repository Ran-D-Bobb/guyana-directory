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

  const errorId = `${name}-error`
  const helperId = `${name}-helper`

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
        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={!canDecrement}
          aria-label="Decrease value"
          className={cn(
            'h-12 w-12 md:h-11 md:w-11 flex-shrink-0 rounded-xl',
            'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Minus className="w-4 h-4" />
        </Button>

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
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-invalid={showError ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={showError ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full px-4 py-3',
              'border rounded-xl',
              'bg-[hsl(var(--background))]',
              'text-center text-lg font-semibold',
              'text-[hsl(var(--foreground))]',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'transition-all duration-200',
              'min-h-[48px] md:min-h-[44px]',
              '[appearance:textfield]',
              '[&::-webkit-outer-spin-button]:appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none',
              showError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-emerald-500/20'
            )}
          />
          {unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--muted-foreground))]">
              {unit}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={!canIncrement}
          aria-label="Increase value"
          className={cn(
            'h-12 w-12 md:h-11 md:w-11 flex-shrink-0 rounded-xl',
            'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {(min !== 0 || max !== 100) && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 text-center">
          Range: {min} - {max}
          {unit && ` ${unit}`}
        </p>
      )}

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
