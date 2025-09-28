export interface Article {
  id: number
  title: string
  content: string
  source: string
  published_date: string | null
  url: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  content_hash?: string
}

export interface SearchResult {
  article_id: number
  title: string
  source: string
  url: string
  published_date: string | null
  similarity_score: number
  snippet: string
  metadata: Record<string, any>
  ai_summary?: string
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total_found: number
  ai_enhanced: boolean
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  skip: number
  limit: number
}

export interface ArticleSummary {
  summary_id: number | null
  article_id: number
  summary_type: 'brief' | 'comprehensive' | 'analytical'
  summary_text: string
  generated_at: string
  cached: boolean
}

export interface ArticleStats {
  database_stats: {
    total_articles: number
    total_summaries: number
    recent_articles_24h: number
  }
  source_breakdown: Array<{
    source: string
    count: number
  }>
  vector_store_stats: {
    total_documents: number
    collection_name: string
    persist_directory: string
    embedding_function: string
    last_updated: string
  }
}