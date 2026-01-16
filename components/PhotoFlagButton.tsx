'use client'

import { useState } from 'react'
import { Flag, Check, Loader2 } from 'lucide-react'
import { flagPhoto } from '@/lib/photo-flag'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PhotoFlagButtonProps {
  photoId: string
  isAuthenticated: boolean
  initialHasFlagged?: boolean
  className?: string
  variant?: 'icon' | 'text'
}

export function PhotoFlagButton({
  photoId,
  isAuthenticated,
  initialHasFlagged = false,
  className,
  variant = 'icon'
}: PhotoFlagButtonProps) {
  const [hasFlagged, setHasFlagged] = useState(initialHasFlagged)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleFlag = async () => {
    if (!isAuthenticated) {
      // Could redirect to login or show a message
      return
    }

    setIsLoading(true)
    try {
      const result = await flagPhoto(photoId)
      if (result.success) {
        setHasFlagged(true)
      }
    } catch (error) {
      console.error('Failed to flag photo:', error)
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  if (hasFlagged) {
    return (
      <div className={cn(
        'flex items-center gap-1.5 text-amber-600',
        className
      )}>
        <Check className="w-4 h-4" />
        {variant === 'text' && <span className="text-xs">Reported</span>}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <button
        disabled
        title="Sign in to report photos"
        className={cn(
          'flex items-center gap-1.5 text-gray-400 cursor-not-allowed opacity-50',
          className
        )}
      >
        <Flag className="w-4 h-4" />
        {variant === 'text' && <span className="text-xs">Report</span>}
      </button>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors',
            className
          )}
          title="Report inappropriate photo"
        >
          <Flag className="w-4 h-4" />
          {variant === 'text' && <span className="text-xs">Report</span>}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this photo?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to report this photo as inappropriate content.
            Our team will review this report and take appropriate action.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFlag}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reporting...
              </>
            ) : (
              'Report Photo'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
