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

export interface Tag {
  id: number
  name: string
  description: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface TagCreate {
  name: string
  description?: string
  color?: string
}

export interface TagUpdate {
  name?: string
  description?: string
  color?: string
}

export interface RSSFeed {
  id: number
  name: string
  url: string
  description: string | null
  is_active: boolean
  tags: Array<{
    id: number
    name: string
    color: string | null
  }>
  created_at: string
  updated_at: string
  last_fetched_at: string | null
}

export interface RSSFeedCreate {
  name: string
  url: string
  description?: string
  tag_ids?: number[]
}

export interface RSSFeedUpdate {
  name?: string
  description?: string
  is_active?: boolean
  tag_ids?: number[]
}

export interface DeleteArticlesRequest {
  before_date?: string  // ISO 8601 format
  sources?: string[]
  delete_summaries?: boolean
  delete_from_vector_store?: boolean
}

export interface DeleteArticlesResponse {
  deleted_count: number
  deleted_summaries_count: number
  deleted_from_vector_store: number
  remaining_articles: number
  filters_applied: {
    before_date: string | null
    sources: string[] | null
  }
}

export interface ArticleCountResponse {
  total_count: number
  source_breakdown: Record<string, number>
  filters: {
    before_date: string | null
    sources: string[] | null
  }
}