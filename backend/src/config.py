"""
Configuration management for News Summary Agent.

This module handles all configuration settings using environment variables
with sensible defaults for development and production environments.
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://newsuser:newspass@localhost:5432/newsdb",
        description="PostgreSQL database connection URL"
    )

    # LLM Configuration
    ANTHROPIC_API_KEY: str = Field(
        default="",
        description="Anthropic Claude API key for LLM operations"
    )

    # ChromaDB Configuration
    CHROMA_PERSIST_DIR: str = Field(
        default="./chroma_db",
        description="Directory for ChromaDB persistent storage"
    )
    CHROMA_COLLECTION_NAME: str = Field(
        default="news_articles",
        description="ChromaDB collection name for articles"
    )

    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", description="API host address")
    API_PORT: int = Field(default=8000, description="API port number")
    API_WORKERS: int = Field(default=1, description="Number of API workers")

    # CORS Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        description="Allowed CORS origins for frontend (comma-separated)"
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )

    # RSS Feed Configuration
    RSS_FEEDS: str = Field(
        default="http://feeds.bbci.co.uk/news/rss.xml,https://feeds.reuters.com/reuters/topNews,https://rss.nytimes.com/services/xml/rss/nyt/World.xml,https://www.theguardian.com/world/rss,https://feeds.washingtonpost.com/rss/world",
        description="Comma-separated list of RSS feed URLs to ingest"
    )

    # Ingestion Configuration
    INGESTION_INTERVAL_HOURS: int = Field(
        default=1,
        description="Hours between RSS feed ingestion runs"
    )
    MAX_ARTICLES_PER_FEED: int = Field(
        default=50,
        description="Maximum articles to ingest per RSS feed"
    )

    # Search Configuration
    SEARCH_RESULTS_LIMIT: int = Field(
        default=10,
        description="Default number of search results to return"
    )
    SEARCH_SIMILARITY_THRESHOLD: float = Field(
        default=0.7,
        description="Minimum similarity score for search results"
    )

    # Summary Configuration
    SUMMARY_CACHE_TTL_HOURS: int = Field(
        default=24,
        description="Time-to-live for summary cache in hours"
    )

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60,
        description="API rate limit per minute per client"
    )

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def RSS_FEEDS_LIST(self) -> List[str]:
        """Convert RSS_FEEDS string to list."""
        if not self.RSS_FEEDS:
            return []
        return [feed.strip() for feed in self.RSS_FEEDS.split(",") if feed.strip()]

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_database_url() -> str:
    """Get the database URL with fallback handling."""
    return settings.DATABASE_URL


def get_anthropic_api_key() -> str:
    """Get the Anthropic API key with validation."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable is required but not set"
        )
    return settings.ANTHROPIC_API_KEY


def validate_configuration() -> bool:
    """Validate critical configuration settings."""
    required_settings = [
        (settings.DATABASE_URL, "DATABASE_URL"),
        (settings.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY"),
    ]

    missing_settings = [
        name for value, name in required_settings if not value
    ]

    if missing_settings:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_settings)}"
        )

    return True