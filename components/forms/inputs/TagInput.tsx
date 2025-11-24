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
      // Remove last tag if input is empty and backspace is pressed
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
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>

      {/* Tags display */}
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
                className="ml-1.5 hover:text-emerald-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
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
                // Delay to allow click on suggestions
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              placeholder={placeholder}
              className={cn(
                'flex-1 px-3 py-2.5 md:py-2',
                'border border-gray-300 rounded-lg',
                'text-gray-900 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
                'transition-all duration-200',
                'min-h-[44px] md:min-h-[40px]'
              )}
            />
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              className={cn(
                'h-11 w-11 md:h-10 md:w-10 flex-shrink-0',
                'flex items-center justify-center',
                'border border-gray-300 rounded-lg',
                'bg-white hover:bg-gray-50',
                'transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions &&
            filteredSuggestions.length > 0 &&
            inputValue && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Count and helper text */}
      <div className="flex items-center justify-between mt-2">
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
        <p
          className={cn(
            'text-xs font-medium',
            value.length >= maxTags
              ? 'text-amber-600'
              : 'text-gray-500'
          )}
        >
          {value.length} / {maxTags}
        </p>
      </div>
    </div>
  )
}
