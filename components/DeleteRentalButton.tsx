'use client'

import { Trash2 } from 'lucide-react'

interface DeleteRentalButtonProps {
  rentalName: string
}

export default function DeleteRentalButton({ rentalName }: DeleteRentalButtonProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${rentalName}"? This action cannot be undone.`)) {
      // TODO: Implement delete functionality
      alert('Delete functionality will be implemented soon')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  )
}
