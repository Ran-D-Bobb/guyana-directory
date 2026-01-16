'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * TanStack Query provider for client-side data caching
 *
 * Features:
 * - Intelligent stale time configuration per data type
 * - Automatic garbage collection
 * - React Query Devtools in development
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Use useState to ensure the same client is used across re-renders
  // but a new one is created for each server-side render
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
