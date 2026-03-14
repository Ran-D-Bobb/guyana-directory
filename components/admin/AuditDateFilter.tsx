'use client'

import { useSearchParams } from 'next/navigation'

interface AuditDateFilterProps {
  fromDate?: string
  toDate?: string
}

export function AuditDateFilter({ fromDate, toDate }: AuditDateFilterProps) {
  const searchParams = useSearchParams()

  function navigateWithDate(key: 'from' | 'to', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset pagination on filter change
    window.location.href = `/admin/audit-log?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        name="from"
        defaultValue={fromDate || ''}
        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:outline-none"
        onChange={(e) => navigateWithDate('from', e.target.value)}
      />
      <span className="text-slate-400">to</span>
      <input
        type="date"
        name="to"
        defaultValue={toDate || ''}
        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:outline-none"
        onChange={(e) => navigateWithDate('to', e.target.value)}
      />
    </div>
  )
}
