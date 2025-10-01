import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { articleApi } from '@/services/api'
import type { Article, ArticleListResponse, ArticleSummary, RSSFeed, RSSFeedCreate, DeleteArticlesRequest } from '@/types/article'

// Query keys for React Query
export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: ArticleFilters) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: number) => [...articleKeys.details(), id] as const,
  summaries: (id: number) => [...articleKeys.detail(id), 'summaries'] as const,
  similar: (id: number) => [...articleKeys.detail(id), 'similar'] as const,
  stats: () => [...articleKeys.all, 'stats'] as const,
  trending: (hoursBack: number) => [...articleKeys.all, 'trending', hoursBack] as const,
  rssFeeds: () => ['rss-feeds'] as const,
}

export interface ArticleFilters {
  skip?: number
  limit?: number
  source?: string
  hours_back?: number
}

/**
 * Hook for fetching paginated articles with filters
 */
export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: articleKeys.list(filters),
    queryFn: () => articleApi.getArticles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - articles change frequently
  })
}

/**
 * Hook for infinite scroll article loading
 */
export function useInfiniteArticles(filters: Omit<ArticleFilters, 'skip'> = {}) {
  return useInfiniteQuery({
    queryKey: [...articleKeys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 0 }) =>
      articleApi.getArticles({ ...filters, skip: pageParam }),
    getNextPageParam: (lastPage: ArticleListResponse) => {
      const nextSkip = lastPage.skip + lastPage.articles.length
      return nextSkip < lastPage.total ? nextSkip : undefined
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook for fetching a single article by ID
 */
export function useArticle(id: number) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articleApi.getArticle(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual articles don't change often
  })
}

/**
 * Hook for fetching similar articles
 */
export function useSimilarArticles(articleId: number, limit: number = 5) {
  return useQuery({
    queryKey: articleKeys.similar(articleId),
    queryFn: () => articleApi.getSimilarArticles(articleId, limit),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000, // 10 minutes - similarity doesn't change often
  })
}

/**
 * Hook for fetching article summaries
 */
export function useArticleSummaries(articleId: number) {
  return useQuery({
    queryKey: articleKeys.summaries(articleId),
    queryFn: () => articleApi.getArticleSummaries(articleId),
    enabled: !!articleId,
    staleTime: 15 * 60 * 1000, // 15 minutes - summaries are cached
  })
}

/**
 * Hook for creating article summaries
 */
export function useCreateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      articleId,
      summaryType
    }: {
      articleId: number;
      summaryType: 'brief' | 'comprehensive' | 'analytical'
    }) => articleApi.createSummary(articleId, summaryType),
    onSuccess: (data, variables) => {
      // Invalidate summaries for this article
      queryClient.invalidateQueries({
        queryKey: articleKeys.summaries(variables.articleId)
      })
    },
  })
}

/**
 * Hook for comparing two articles
 */
export function useCompareArticles() {
  return useMutation({
    mutationFn: ({
      article1Id,
      article2Id
    }: {
      article1Id: number;
      article2Id: number
    }) => articleApi.compareArticles(article1Id, article2Id),
  })
}

/**
 * Hook for fetching article statistics
 */
export function useArticleStats() {
  return useQuery({
    queryKey: articleKeys.stats(),
    queryFn: () => articleApi.getStats(),
    staleTime: 60 * 1000, // 1 minute - stats change relatively frequently
  })
}

/**
 * Hook for fetching trending topics
 */
export function useTrendingTopics(hoursBack: number = 24) {
  return useQuery({
    queryKey: articleKeys.trending(hoursBack),
    queryFn: () => articleApi.getTrendingTopics(hoursBack),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for triggering RSS feed ingestion
 */
export function useIngestFeeds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedUrl,
      maxArticles,
      background = true
    }: {
      feedUrl?: string;
      maxArticles?: number;
      background?: boolean
    }) => articleApi.ingestFeeds(feedUrl, maxArticles, background),
    onSuccess: () => {
      // Invalidate all article lists and stats after ingestion
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articleKeys.stats() })
    },
  })
}

/**
 * Hook for multi-perspective analysis
 */
export function useMultiPerspectiveAnalysis() {
  return useMutation({
    mutationFn: ({
      articleIds,
      analysisFocus
    }: {
      articleIds: number[];
      analysisFocus?: string
    }) => articleApi.analyzeMultiplePerspectives(articleIds, analysisFocus),
  })
}

/**
 * Hook for fetching RSS feeds
 */
export function useRSSFeeds() {
  return useQuery({
    queryKey: articleKeys.rssFeeds(),
    queryFn: () => articleApi.getRSSFeeds(),
    staleTime: 5 * 60 * 1000, // 5 minutes - RSS feeds don't change often
  })
}

/**
 * Hook for adding an RSS feed
 */
export function useAddRSSFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feed: RSSFeedCreate) => articleApi.addRSSFeed(feed),
    onSuccess: () => {
      // Invalidate RSS feeds list to refetch
      queryClient.invalidateQueries({ queryKey: articleKeys.rssFeeds() })
    },
  })
}

/**
 * Hook for deleting an RSS feed
 */
export function useDeleteRSSFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedUrl: string) => articleApi.deleteRSSFeed(feedUrl),
    onSuccess: () => {
      // Invalidate RSS feeds list to refetch
      queryClient.invalidateQueries({ queryKey: articleKeys.rssFeeds() })
    },
  })
}

/**
 * Hook for getting all article sources
 */
export function useAllSources() {
  return useQuery({
    queryKey: ['article-sources'],
    queryFn: () => articleApi.getAllSources(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for getting article count preview before deletion
 */
export function useArticleCountPreview(params: {
  before_date?: string
  sources?: string
}) {
  return useQuery({
    queryKey: ['article-count-preview', params],
    queryFn: () => articleApi.getArticleCountPreview(params),
    enabled: !!(params.before_date || params.sources),
    staleTime: 0, // Always fetch fresh data
  })
}

/**
 * Hook for deleting articles
 */
export function useDeleteArticles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: DeleteArticlesRequest) => articleApi.deleteArticles(request),
    onSuccess: () => {
      // Invalidate all article-related queries
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ['article-sources'] })
    },
  })
}
