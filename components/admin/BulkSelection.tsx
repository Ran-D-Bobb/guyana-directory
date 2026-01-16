'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { Minus, Check, X, Loader2 } from 'lucide-react'
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

// Types
export interface SelectableItem {
  id: string
  name?: string
}

interface BulkSelectionContextType {
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  selectedCount: number
  allIds: string[]
  setAllIds: (ids: string[]) => void
  isAllSelected: boolean
  isSomeSelected: boolean
}

const BulkSelectionContext = createContext<BulkSelectionContextType | null>(null)

// Provider Component
export function BulkSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [allIds, setAllIds] = useState<string[]>([])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const value = useMemo(() => ({
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount: selectedIds.size,
    allIds,
    setAllIds,
    isAllSelected: allIds.length > 0 && allIds.every(id => selectedIds.has(id)),
    isSomeSelected: selectedIds.size > 0 && selectedIds.size < allIds.length,
  }), [selectedIds, toggleSelection, selectAll, clearSelection, isSelected, allIds])

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  )
}

// Hook
export function useBulkSelection() {
  const context = useContext(BulkSelectionContext)
  if (!context) {
    throw new Error('useBulkSelection must be used within a BulkSelectionProvider')
  }
  return context
}

// Checkbox Component
interface BulkSelectCheckboxProps {
  id: string
  className?: string
}

export function BulkSelectCheckbox({ id, className }: BulkSelectCheckboxProps) {
  const { isSelected, toggleSelection } = useBulkSelection()
  const checked = isSelected(id)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSelection(id)
      }}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150',
        checked
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'bg-white border-slate-300 hover:border-emerald-500',
        className
      )}
      aria-label={checked ? 'Deselect item' : 'Select item'}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  )
}

// Select All Checkbox
interface BulkSelectAllCheckboxProps {
  className?: string
}

export function BulkSelectAllCheckbox({ className }: BulkSelectAllCheckboxProps) {
  const { isAllSelected, isSomeSelected, selectAll, clearSelection, allIds } = useBulkSelection()

  const handleClick = () => {
    if (isAllSelected || isSomeSelected) {
      clearSelection()
    } else {
      selectAll(allIds)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150',
        (isAllSelected || isSomeSelected)
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'bg-white border-slate-300 hover:border-emerald-500',
        className
      )}
      aria-label={isAllSelected ? 'Deselect all' : isSomeSelected ? 'Select all' : 'Select all'}
    >
      {isAllSelected && <Check size={14} strokeWidth={3} />}
      {isSomeSelected && !isAllSelected && <Minus size={14} strokeWidth={3} />}
    </button>
  )
}

// Bulk Action Button Type
export interface BulkAction {
  label: string
  icon: React.ReactNode
  onClick: (ids: string[]) => Promise<void>
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  requireConfirm?: boolean
  confirmTitle?: string
  confirmDescription?: string
  confirmAction?: string
}

// Bulk Action Bar Component
interface BulkActionBarProps {
  actions: BulkAction[]
  itemName?: string // e.g., "businesses", "reviews"
  className?: string
}

export function BulkActionBar({ actions, itemName = 'items', className }: BulkActionBarProps) {
  const { selectedCount, selectedIds, clearSelection } = useBulkSelection()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  if (selectedCount === 0) {
    return null
  }

  const handleAction = async (action: BulkAction) => {
    setLoadingAction(action.label)
    try {
      await action.onClick(Array.from(selectedIds))
      clearSelection()
    } catch (error) {
      console.error(`Bulk action ${action.label} failed:`, error)
    } finally {
      setLoadingAction(null)
    }
  }

  const variants = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    primary: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    success: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  }

  const confirmVariants = {
    default: 'bg-slate-600 hover:bg-slate-700',
    primary: 'bg-emerald-600 hover:bg-emerald-700',
    success: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    danger: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
      'bg-white rounded-2xl shadow-xl border border-slate-200',
      'px-4 py-3 flex items-center gap-4',
      'animate-in fade-in slide-in-from-bottom-4 duration-200',
      className
    )}>
      {/* Selection count */}
      <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
        <span className="bg-emerald-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg min-w-[32px] text-center">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-slate-700">
          {itemName} selected
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const isLoading = loadingAction === action.label
          const variant = action.variant || 'default'

          if (action.requireConfirm) {
            return (
              <AlertDialog key={action.label}>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isLoading || loadingAction !== null}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      variants[variant]
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : action.icon}
                    {action.label}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">
                      {action.confirmTitle || `${action.label} ${selectedCount} ${itemName}?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                      {action.confirmDescription ||
                        `This will ${action.label.toLowerCase()} ${selectedCount} selected ${itemName}. This action may not be reversible.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction(action)}
                      className={cn('text-white rounded-lg', confirmVariants[variant])}
                    >
                      {action.confirmAction || action.label}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          }

          return (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              disabled={isLoading || loadingAction !== null}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant]
              )}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : action.icon}
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Clear selection */}
      <button
        onClick={clearSelection}
        className="ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Clear selection"
      >
        <X size={18} />
      </button>
    </div>
  )
}

// Helper hook to register items with the selection context
export function useRegisterItems(items: SelectableItem[]) {
  const { setAllIds } = useBulkSelection()

  React.useEffect(() => {
    setAllIds(items.map(item => item.id))
  }, [items, setAllIds])
}
