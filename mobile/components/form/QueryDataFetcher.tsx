import { useEffect } from 'react'
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
  onError?: (error: Error) => void
}

export function QueryDataFetcher({
  query,
  variables,
  skip = false,
  dataPath,
  label,
  onDataLoaded,
  onLoadingChange,
  onError,
}: QueryDataFetcherProps) {
  const { data, loading, error } = useQuery(query, {
    variables,
    skip,
  })

  // Handle query errors
  useEffect(() => {
    if (error && !skip && onError) {
      onError(error)
    }
  }, [error, skip, onError])

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
