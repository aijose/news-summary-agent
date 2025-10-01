import axios from 'axios'
import type { Article, SearchResponse, RSSFeed, RSSFeedCreate, DeleteArticlesRequest, DeleteArticlesResponse, ArticleCountResponse } from '@/types/article'

// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Article API endpoints
export const articleApi = {
  // Get all articles with pagination
  getArticles: async (params: {
    skip?: number
    limit?: number
    source?: string
    hours_back?: number
  } = {}) => {
    const response = await apiClient.get('/articles/', { params })
    return response.data
  },

  // Get single article by ID
  getArticle: async (id: number): Promise<Article> => {
    const response = await apiClient.get(`/articles/${id}`)
    return response.data
  },

  // Search articles
  searchArticles: async (query: string, limit: number = 10, useAi: boolean = false): Promise<SearchResponse> => {
    const response = await apiClient.post('/articles/search', {
      query,
      limit,
      use_ai: useAi
    })
    return response.data
  },

  // Get similar articles
  getSimilarArticles: async (articleId: number, limit: number = 5): Promise<SearchResponse> => {
    const response = await apiClient.get(`/articles/${articleId}/similar`, {
      params: { limit }
    })
    return response.data
  },

  // Get article summaries
  getArticleSummaries: async (articleId: number) => {
    const response = await apiClient.get(`/articles/${articleId}/summaries`)
    return response.data
  },

  // Create article summary
  createSummary: async (articleId: number, summaryType: 'brief' | 'comprehensive' | 'analytical' = 'comprehensive') => {
    const response = await apiClient.post(`/articles/${articleId}/summarize`, {
      summary_type: summaryType
    })
    return response.data
  },

  // Compare articles
  compareArticles: async (article1Id: number, article2Id: number) => {
    const response = await apiClient.post(`/articles/compare/${article1Id}/${article2Id}`)
    return response.data
  },

  // Get general statistics
  getStats: async () => {
    const response = await apiClient.get('/articles/stats/general')
    return response.data
  },

  // Get trending topics
  getTrendingTopics: async (hoursBack: number = 24) => {
    const response = await apiClient.get('/articles/trending', {
      params: { hours_back: hoursBack }
    })
    return response.data
  },

  // Trigger RSS ingestion
  ingestFeeds: async (feedUrl?: string, maxArticles?: number, background: boolean = true) => {
    const response = await apiClient.post('/articles/ingest', {
      feed_url: feedUrl,
      max_articles: maxArticles,
      background
    })
    return response.data
  },

  // Multi-perspective analysis
  analyzeMultiplePerspectives: async (
    articleIds: number[],
    analysisFocus: string = 'the main topic'
  ) => {
    const response = await apiClient.post('/summaries/multi-article/', articleIds, {
      params: {
        synthesis_style: 'multi_perspective',
        analysis_focus: analysisFocus
      }
    })
    return response.data
  },

  // Get RSS feeds
  getRSSFeeds: async (): Promise<RSSFeed[]> => {
    const response = await apiClient.get('/rss-feeds')
    return response.data
  },

  // Add RSS feed
  addRSSFeed: async (feed: RSSFeedCreate): Promise<RSSFeed> => {
    const response = await apiClient.post('/rss-feeds', feed)
    return response.data
  },

  // Delete RSS feed
  deleteRSSFeed: async (feedUrl: string): Promise<void> => {
    await apiClient.delete(`/rss-feeds/${encodeURIComponent(feedUrl)}`)
  },

  // Get all sources
  getAllSources: async (): Promise<string[]> => {
    const response = await apiClient.get('/admin/sources')
    return response.data
  },

  // Get article count preview
  getArticleCountPreview: async (params: {
    before_date?: string
    sources?: string
  }): Promise<ArticleCountResponse> => {
    const response = await apiClient.get('/admin/article-count', { params })
    return response.data
  },

  // Delete articles
  deleteArticles: async (request: DeleteArticlesRequest): Promise<DeleteArticlesResponse> => {
    const response = await apiClient.post('/admin/delete-articles', request)
    return response.data
  }
}

// Health check
export const healthApi = {
  check: async () => {
    const response = await apiClient.get('../../health') // Note: health endpoint is not under /api/v1
    return response.data
  }
}

export default apiClient