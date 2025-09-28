import { useState, useCallback } from 'react'
import { articleApi } from '@/services/api'
import type { SearchResponse } from '@/types/article'

interface UseSearchResult {
  searchResponse: SearchResponse | null
  isLoading: boolean
  error: string | null
  search: (query: string, useAi: boolean) => Promise<void>
  clearSearch: () => void
}

export function useSearch(): UseSearchResult {
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, useAi: boolean = false) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await articleApi.searchArticles(query, 10, useAi)
      setSearchResponse(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(`Search failed: ${errorMessage}`)
      setSearchResponse(null)
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResponse(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    searchResponse,
    isLoading,
    error,
    search,
    clearSearch
  }
}