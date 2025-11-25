'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Column definition
export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (item: T) => React.ReactNode
  className?: string
}

// Action definition
export interface Action<T> {
  label: string
  icon?: React.ElementType
  onClick?: (item: T) => void
  href?: (item: T) => string
  variant?: 'default' | 'danger' | 'success'
  condition?: (item: T) => boolean
}

interface AdminDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  keyField: keyof T
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  emptyMessage?: string
  emptyIcon?: React.ElementType
  onRowClick?: (item: T) => void
  loading?: boolean
  pagination?: {
    pageSize: number
    currentPage: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  className?: string
}

export function AdminDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions = [],
  keyField,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchFields = [],
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  onRowClick,
  loading = false,
  pagination,
  selectable = false,
  onSelectionChange,
  className,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search) return data

    const searchLower = search.toLowerCase()
    return data.filter((item) => {
      const fieldsToSearch = searchFields.length > 0 ? searchFields : Object.keys(item) as (keyof T)[]
      return fieldsToSearch.some((field) => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchLower)
        }
        return false
      })
    })
  }, [data, search, searchFields])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof T]
      const bValue = b[sortKey as keyof T]

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.size === sortedData.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = sortedData.map((item) => String(item[keyField]))
      setSelectedIds(new Set(allIds))
      onSelectionChange?.(allIds)
    }
  }

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null

    if (sortKey !== column.key) {
      return <ChevronsUpDown size={14} className="text-slate-300" />
    }

    return sortDirection === 'asc'
      ? <ChevronUp size={14} className="text-emerald-600" />
      : <ChevronDown size={14} className="text-emerald-600" />
  }

  if (loading) {
    return (
      <div className={cn('bg-white rounded-2xl border border-slate-200 overflow-hidden', className)}>
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm', className)}>
      {/* Toolbar */}
      {searchable && (
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <span className="font-medium">{selectedIds.size} selected</span>
              <button
                onClick={() => {
                  setSelectedIds(new Set())
                  onSelectionChange?.([])
                }}
                className="p-0.5 hover:bg-emerald-100 rounded"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-slate-100 transition-colors',
                    column.width,
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.label}</span>
                    <SortIcon column={column} />
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  {EmptyIcon && (
                    <EmptyIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  )}
                  <p className="text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => {
                const itemId = String(item[keyField])
                const isSelected = selectedIds.has(itemId)

                return (
                  <tr
                    key={itemId}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(itemId)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3', column.className)}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] ?? '-')
                        }
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actions.map((action, index) => {
                            if (action.condition && !action.condition(item)) return null

                            const ActionIcon = action.icon
                            const buttonClass = cn(
                              'p-1.5 rounded-lg transition-colors',
                              action.variant === 'danger' && 'text-red-600 hover:bg-red-50',
                              action.variant === 'success' && 'text-emerald-600 hover:bg-emerald-50',
                              !action.variant && 'text-slate-600 hover:bg-slate-100'
                            )

                            if (action.href) {
                              return (
                                <Link
                                  key={index}
                                  href={action.href(item)}
                                  className={buttonClass}
                                  title={action.label}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ActionIcon && <ActionIcon size={16} />}
                                </Link>
                              )
                            }

                            return (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick?.(item)
                                }}
                                className={buttonClass}
                                title={action.label}
                              >
                                {ActionIcon && <ActionIcon size={16} />}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-slate-700">
              Page {pagination.currentPage}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage * pagination.pageSize >= pagination.totalItems}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Status Badge Component
export function StatusBadge({
  status,
  variant = 'default'
}: {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant]
    )}>
      {status}
    </span>
  )
}
