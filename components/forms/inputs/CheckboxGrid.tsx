'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface CheckboxGridProps {
  label: string
  name: string
  options: CheckboxOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: number
  helperText?: string
  className?: string
}

export function CheckboxGrid({
  label,
  options,
  selected,
  onChange,
  columns = 2,
  helperText,
  className,
}: CheckboxGridProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>

      <div
        className={cn(
          'grid gap-3',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-2 md:grid-cols-3',
          columns === 4 && 'grid-cols-2 md:grid-cols-4'
        )}
      >
        {options.map(option => {
          const isSelected = selected.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={cn(
                'relative flex items-center gap-3 p-3',
                'border-2 rounded-lg',
                'transition-all duration-200',
                'min-h-[44px]', // Touch target for mobile
                'text-left',
                'hover:border-emerald-300',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 bg-white'
              )}
            >
              {/* Checkbox indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200',
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-gray-300'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              {/* Icon (if provided) */}
              {option.icon && (
                <div
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isSelected ? 'text-emerald-600' : 'text-gray-500'
                  )}
                >
                  {option.icon}
                </div>
              )}

              {/* Label */}
              <span
                className={cn(
                  'text-sm font-medium flex-1',
                  isSelected ? 'text-emerald-900' : 'text-gray-700'
                )}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-sm text-emerald-600 mt-2 font-medium">
          {selected.length} selected
        </p>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-sm text-gray-500 mt-2">{helperText}</p>
      )}
    </div>
  )
}
