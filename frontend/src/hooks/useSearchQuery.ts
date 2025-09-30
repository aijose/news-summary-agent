import { useQuery, useMutation } from '@tanstack/react-query'
import { articleApi } from '@/services/api'
import type { SearchResponse } from '@/types/article'

// Query keys for search operations
export const searchKeys = {
  all: ['search'] as const,
  results: (query: string, useAi: boolean) => [...searchKeys.all, 'results', query, useAi] as const,
}

/**
 * Hook for searching articles with caching
 * Note: This is best used with manual triggering via refetch or enabled flag
 */
export function useSearchArticles(query: string, useAi: boolean = false, enabled: boolean = false) {
  return useQuery({
    queryKey: searchKeys.results(query, useAi),
    queryFn: () => articleApi.searchArticles(query, 10, useAi),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes - search results are relatively stable
  })
}

/**
 * Hook for searching articles as a mutation (recommended for search UX)
 * This provides better control over when searches execute
 */
export function useSearchMutation() {
  return useMutation({
    mutationFn: ({
      query,
      limit = 10,
      useAi = false
    }: {
      query: string;
      limit?: number;
      useAi?: boolean
    }) => articleApi.searchArticles(query, limit, useAi),
  })
}
