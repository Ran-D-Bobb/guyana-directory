'use client'

import { useRef, useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  label: string
  name: string
  value: File | null
  onChange: (file: File | null) => void
  preview?: string
  maxSize?: number // In MB
  acceptedFormats?: string[]
  required?: boolean
  error?: string
  helperText?: string
  className?: string
}

export function ImageUpload({
  label,
  name,
  onChange,
  preview,
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  required = false,
  error,
  helperText = `Max ${maxSize}MB. Formats: JPG, PNG, WebP`,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`)
      return
    }

    if (!acceptedFormats.includes(file.type)) {
      setUploadError('Invalid file format. Please use JPG, PNG, or WebP')
      return
    }

    setUploadError(null)
    onChange(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreviewUrl(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const showError = error || uploadError

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden border-2 border-[hsl(var(--border))]">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl',
            'p-8 text-center cursor-pointer',
            'transition-all duration-200',
            'hover:border-emerald-400 hover:bg-emerald-50/50',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
            dragActive && 'border-emerald-500 bg-emerald-50',
            showError
              ? 'border-red-300 bg-red-50'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]'
          )}
        >
          <input
            ref={fileInputRef}
            id={name}
            name={name}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleChange}
            required={required}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                showError ? 'bg-red-100' : 'bg-emerald-100'
              )}
            >
              {showError ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <Upload className="w-6 h-6 text-emerald-600" />
              )}
            </div>

            <div>
              <p className="text-base font-medium text-[hsl(var(--foreground))] mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{helperText}</p>
            </div>
          </div>
        </div>
      )}

      {showError && (
        <p className="text-sm text-red-600 mt-1.5">
          {showError}
        </p>
      )}
    </div>
  )
}
