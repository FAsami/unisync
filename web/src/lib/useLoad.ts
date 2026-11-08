'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Loads data on mount and whenever `key` changes; `reload()` fetches again.
 * Results of superseded loads are ignored.
 */
export const useLoad = <T>(key: string, load: () => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const loadRef = useRef(load)
  const generation = useRef(0)

  useEffect(() => {
    loadRef.current = load
  })

  const reload = useCallback(async () => {
    const mine = ++generation.current
    setLoading(true)
    try {
      const value = await loadRef.current()
      if (mine === generation.current) {
        setData(value)
        setError(null)
      }
    } catch (e) {
      if (mine === generation.current) setError(e)
    } finally {
      if (mine === generation.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [key, reload])

  return { data, error, loading, reload }
}
