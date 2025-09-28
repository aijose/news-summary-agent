import { useState, useEffect, useCallback } from 'react'
import { articleApi } from '@/services/api'
import type { Article, ArticleListResponse } from '@/types/article'

interface UseArticlesOptions {
  skip?: number
  limit?: number
  source?: string
  hours_back?: number
  autoLoad?: boolean
}

interface UseArticlesResult {
  articles: Article[]
  isLoading: boolean
  error: string | null
  total: number
  hasMore: boolean
  loadArticles: (options?: UseArticlesOptions) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useArticles(initialOptions: UseArticlesOptions = {}): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<UseArticlesOptions>({
    skip: 0,
    limit: 10,
    ...initialOptions
  })

  const loadArticles = useCallback(async (options: UseArticlesOptions = {}) => {
    const finalOptions = { ...currentOptions, ...options }
    setCurrentOptions(finalOptions)
    setIsLoading(true)
    setError(null)

    try {
      const response: ArticleListResponse = await articleApi.getArticles(finalOptions)

      if (finalOptions.skip === 0) {
        // New load - replace articles
        setArticles(response.articles)
      } else {
        // Load more - append articles
        setArticles(prev => [...prev, ...response.articles])
      }

      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load articles'
      setError(errorMessage)
      console.error('Error loading articles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentOptions])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    const nextSkip = articles.length
    await loadArticles({ skip: nextSkip })
  }, [loadArticles, isLoading, articles.length])

  const refresh = useCallback(async () => {
    await loadArticles({ skip: 0 })
  }, [loadArticles])

  const hasMore = articles.length < total

  // Auto-load on mount if enabled
  useEffect(() => {
    if (initialOptions.autoLoad !== false) {
      loadArticles()
    }
  }, []) // Only run on mount

  return {
    articles,
    isLoading,
    error,
    total,
    hasMore,
    loadArticles,
    loadMore,
    refresh
  }
}