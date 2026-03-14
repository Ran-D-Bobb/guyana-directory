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
      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-3">
        {label}
      </label>

      <div
        role="group"
        aria-label={label}
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
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleOption(option.value)}
              className={cn(
                'relative flex items-center gap-3 p-3',
                'border-2 rounded-xl',
                'transition-all duration-200',
                'min-h-[48px]',
                'text-left',
                'hover:border-emerald-300',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200',
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-[hsl(var(--background))] border-[hsl(var(--border))]'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              {option.icon && (
                <div
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isSelected ? 'text-emerald-600' : 'text-[hsl(var(--muted-foreground))]'
                  )}
                >
                  {option.icon}
                </div>
              )}

              <span
                className={cn(
                  'text-sm font-medium flex-1',
                  isSelected ? 'text-emerald-900' : 'text-[hsl(var(--foreground))]'
                )}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-sm text-emerald-600 mt-2 font-medium">
          {selected.length} selected
        </p>
      )}

      {helperText && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{helperText}</p>
      )}
    </div>
  )
}
