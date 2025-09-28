"""
Pydantic schemas for News Summary Agent API.

This module defines request and response models for API endpoints,
ensuring proper data validation and serialization.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class SummaryType(str, Enum):
    """Enumeration of summary types."""
    brief = "brief"
    comprehensive = "comprehensive"
    analytical = "analytical"


class ArticleBase(BaseModel):
    """Base article schema with common fields."""
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)


class ArticleCreate(ArticleBase):
    """Schema for creating new articles."""
    published_date: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    content_hash: Optional[str] = None


class ArticleResponse(BaseModel):
    """Schema for article responses."""
    id: int
    title: str
    content: str
    url: str
    source: str
    published_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None
    content_hash: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ArticleListResponse(BaseModel):
    """Schema for paginated article list responses."""
    articles: List[ArticleResponse]
    total: int = Field(..., ge=0)
    skip: int = Field(..., ge=0)
    limit: int = Field(..., ge=1)


class SearchRequest(BaseModel):
    """Schema for article search requests."""
    query: str = Field(..., min_length=1, max_length=1000)
    limit: int = Field(10, ge=1, le=50)
    source_filter: Optional[List[str]] = None
    use_ai: bool = Field(False, description="Whether to enhance results with AI")


class SearchResult(BaseModel):
    """Schema for individual search results."""
    article_id: int
    title: str
    source: str
    url: str
    published_date: Optional[datetime]
    similarity_score: float = Field(..., ge=0, le=1)
    snippet: str
    metadata: Optional[Dict[str, Any]]
    ai_summary: Optional[str] = None


class SearchResponse(BaseModel):
    """Schema for search responses."""
    query: str
    results: List[Dict[str, Any]]  # Using Dict to be flexible with search result formats
    total_found: int = Field(..., ge=0)
    ai_enhanced: bool = False


class SummaryRequest(BaseModel):
    """Schema for summary generation requests."""
    summary_type: SummaryType = SummaryType.comprehensive

    @validator('summary_type')
    def validate_summary_type(cls, v):
        if v not in [SummaryType.brief, SummaryType.comprehensive, SummaryType.analytical]:
            raise ValueError('Invalid summary type')
        return v


class SummaryResponse(BaseModel):
    """Schema for summary responses."""
    summary_id: Optional[int]
    article_id: int
    summary_text: str
    summary_type: str
    generated_at: str
    cached: bool = False


class SummaryBase(BaseModel):
    """Base summary schema."""
    article_id: int
    summary_text: str = Field(..., min_length=1)
    summary_type: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class SummaryCreate(SummaryBase):
    """Schema for creating summaries."""
    pass


class SummaryInDB(SummaryBase):
    """Schema for summaries in database."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IngestionRequest(BaseModel):
    """Schema for RSS ingestion requests."""
    feed_url: Optional[str] = Field(None, description="Specific feed URL to ingest")
    max_articles: Optional[int] = Field(None, ge=1, le=200, description="Max articles per feed")
    background: bool = Field(True, description="Run ingestion in background")

    @validator('feed_url')
    def validate_feed_url(cls, v):
        if v is not None and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('Feed URL must start with http:// or https://')
        return v


class IngestionResponse(BaseModel):
    """Schema for ingestion responses."""
    status: str = Field(..., description="Ingestion status")
    message: str = Field(..., description="Status message")
    results: Optional[Dict[str, Any]] = None
    background: bool = False


class ArticleProcessingResult(BaseModel):
    """Schema for article processing results."""
    is_valid: bool
    validation_errors: List[str]
    quality_assessment: Optional[Dict[str, Any]]
    processed_metadata: Optional[Dict[str, Any]]
    recommendations: List[str]


class QualityAssessment(BaseModel):
    """Schema for article quality assessment."""
    overall_score: float = Field(..., ge=0, le=1)
    is_high_quality: bool
    factors: Dict[str, float]
    recommendations: List[str]


class TrendingTopicsResponse(BaseModel):
    """Schema for trending topics analysis."""
    analysis_text: Optional[str]
    trending_topics: Optional[List[str]]
    article_count: int = Field(..., ge=0)
    analysis_period: str
    generated_at: str
    model_info: Optional[Dict[str, Any]]


class ComparisonResponse(BaseModel):
    """Schema for article comparison responses."""
    comparison_text: str
    article1_id: int
    article2_id: int
    article1_title: str
    article2_title: str
    generated_at: str
    model_info: Optional[Dict[str, Any]]


class DatabaseStats(BaseModel):
    """Schema for database statistics."""
    total_articles: int = Field(..., ge=0)
    total_summaries: int = Field(..., ge=0)
    recent_articles_24h: int = Field(..., ge=0)


class SourceStats(BaseModel):
    """Schema for source statistics."""
    source: str
    count: int = Field(..., ge=0)


class VectorStoreStats(BaseModel):
    """Schema for vector store statistics."""
    total_documents: int = Field(..., ge=0)
    collection_name: str
    persist_directory: str
    embedding_function: str
    last_updated: str


class GeneralStatsResponse(BaseModel):
    """Schema for general statistics response."""
    database_stats: DatabaseStats
    source_breakdown: List[SourceStats]
    vector_store_stats: Dict[str, Any]  # Flexible for different vector store implementations


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_code: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class HealthCheckResponse(BaseModel):
    """Schema for health check responses."""
    status: str
    timestamp: str
    version: str
    components: Dict[str, str]


class UserPreferenceBase(BaseModel):
    """Base schema for user preferences."""
    user_id: str = Field(..., min_length=1)
    preferred_sources: Optional[List[str]] = None
    preferred_topics: Optional[List[str]] = None
    summary_preferences: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, Any]] = None


class UserPreferenceCreate(UserPreferenceBase):
    """Schema for creating user preferences."""
    pass


class UserPreferenceUpdate(BaseModel):
    """Schema for updating user preferences."""
    preferred_sources: Optional[List[str]] = None
    preferred_topics: Optional[List[str]] = None
    summary_preferences: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, Any]] = None


class UserPreferenceResponse(UserPreferenceBase):
    """Schema for user preference responses."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FeedIngestionResult(BaseModel):
    """Schema for individual feed ingestion results."""
    feed_url: str
    total_entries: int = Field(..., ge=0)
    new_articles: int = Field(..., ge=0)
    duplicate_articles: int = Field(..., ge=0)
    failed_articles: int = Field(..., ge=0)
    errors: List[str]


class BatchIngestionResult(BaseModel):
    """Schema for batch ingestion results."""
    feeds_processed: int = Field(..., ge=0)
    total_new_articles: int = Field(..., ge=0)
    total_duplicates: int = Field(..., ge=0)
    total_failures: int = Field(..., ge=0)
    feed_results: List[FeedIngestionResult]
    errors: List[str]


class ArticleMetadata(BaseModel):
    """Schema for article metadata."""
    author: Optional[str] = None
    tags: List[str] = []
    feed_title: Optional[str] = None
    feed_description: Optional[str] = None
    content_hash: Optional[str] = None
    processed_at: Optional[str] = None
    word_count: Optional[int] = None
    character_count: Optional[int] = None
    estimated_read_time: Optional[int] = None
    content_type: Optional[str] = None
    topic_keywords: List[str] = []
    quality_indicators: Optional[QualityAssessment] = None


class NewsAgentConfig(BaseModel):
    """Schema for news agent configuration."""
    rss_feeds: List[str]
    ingestion_interval_hours: int = Field(..., ge=1, le=168)
    max_articles_per_feed: int = Field(..., ge=1, le=500)
    search_results_limit: int = Field(..., ge=1, le=100)
    search_similarity_threshold: float = Field(..., ge=0, le=1)
    summary_cache_ttl_hours: int = Field(..., ge=1, le=720)


class SystemStatus(BaseModel):
    """Schema for system status information."""
    database_connected: bool
    vector_store_connected: bool
    llm_available: bool
    last_ingestion: Optional[datetime] = None
    articles_count: int = Field(..., ge=0)
    summaries_count: int = Field(..., ge=0)
    system_uptime: Optional[str] = None