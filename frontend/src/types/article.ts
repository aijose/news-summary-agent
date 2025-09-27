export interface Article {
  id: number
  title: string
  content: string
  source: string
  published_date: string
  url: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ArticleSummary {
  id: number | null
  article_id: number
  summary_type: 'short' | 'medium' | 'long'
  summary_text: string
  word_count: number
  confidence_score: number
  created_at: string | null
  updated_at: string | null
}

export interface SearchResult {
  article: Article
  relevance_score: number
  snippet: string
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total_results: number
  search_time_ms: number
}