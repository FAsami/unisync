import React, { useEffect } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import { DocumentNode } from '@apollo/client'
import { useQuery } from '@apollo/client'

interface QueryDataFetcherProps {
  query: DocumentNode
  variables?: Record<string, any>
  skip?: boolean
  dataPath: string
  label: string
  onDataLoaded: (data: any[]) => void
  onLoadingChange: (loading: boolean) => void
}

export function QueryDataFetcher({
  query,
  variables,
  skip = false,
  dataPath,
  label,
  onDataLoaded,
  onLoadingChange,
}: QueryDataFetcherProps) {
  const { showAlert } = useAlert()

  const { data, loading, error } = useQuery(query, {
    variables,
    skip,
  })

  // Handle query errors
  useEffect(() => {
    if (error && !skip) {
      showAlert({
        title: 'Error Loading Data',
        description: error.message || `Failed to load ${label.toLowerCase()}.`,
        type: 'error',
      })
    }
  }, [error, skip, label, showAlert])

  // Update parent with data
  useEffect(() => {
    if (!skip && data) {
      onDataLoaded(data[dataPath] ?? [])
    }
  }, [data, dataPath, skip, onDataLoaded])

  // Update parent with loading state
  useEffect(() => {
    if (!skip) {
      onLoadingChange(loading)
    }
  }, [loading, skip, onLoadingChange])

  return null // This is a logic-only component
}
