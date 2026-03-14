'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  label: string
  name: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  maxTags?: number
  helperText?: string
  className?: string
}

export function TagInput({
  label,
  name,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Type and press Enter',
  maxTags = 10,
  helperText,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
    setShowSuggestions(false)
  }

  const canAddMore = value.length < maxTags

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
      >
        {label}
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="pl-3 pr-2 py-1.5 text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="ml-1.5 p-1 hover:text-emerald-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {canAddMore && (
        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              id={name}
              name={name}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              placeholder={placeholder}
              className={cn(
                'flex-1 px-4 py-3',
                'border border-[hsl(var(--border))] rounded-xl',
                'bg-[hsl(var(--background))]',
                'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                'transition-all duration-200',
                'min-h-[48px] md:min-h-[44px]'
              )}
            />
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              aria-label="Add tag"
              className={cn(
                'h-12 w-12 md:h-11 md:w-11 flex-shrink-0',
                'flex items-center justify-center',
                'border border-[hsl(var(--border))] rounded-xl',
                'bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]',
                'transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showSuggestions &&
            filteredSuggestions.length > 0 &&
            inputValue && (
              <div className="absolute z-10 w-full mt-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--foreground))] hover:bg-emerald-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        {helperText && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{helperText}</p>
        )}
        <p
          className={cn(
            'text-xs font-medium',
            value.length >= maxTags
              ? 'text-amber-600'
              : 'text-[hsl(var(--muted-foreground))]'
          )}
        >
          {value.length} / {maxTags}
        </p>
      </div>
    </div>
  )
}
