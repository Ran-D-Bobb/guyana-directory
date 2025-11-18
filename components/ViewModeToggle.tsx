'use client'

import { Grid3x3, List, LayoutGrid } from 'lucide-react'

export type ViewMode = 'grid' | 'list' | 'compact'

interface ViewModeToggleProps {
  currentMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ currentMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentMode === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>

      <button
        onClick={() => onChange('compact')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentMode === 'compact'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Compact view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Compact</span>
      </button>
    </div>
  )
}
