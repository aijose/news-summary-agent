"""
Utilities package for News Summary Agent.

This package contains utility modules for logging, error handling,
and other common functionality.
"""

from .logging_config import setup_logging, LoggingMixin, get_logger
from .error_handling import (
    NewsAgentException,
    ArticleProcessingError,
    VectorStoreError,
    RSSIngestionError,
    LLMError,
    DatabaseError,
    ValidationError,
    ConfigurationError,
    ErrorContext,
    safe_execute,
    safe_async_execute
)

__all__ = [
    "setup_logging",
    "LoggingMixin",
    "get_logger",
    "NewsAgentException",
    "ArticleProcessingError",
    "VectorStoreError",
    "RSSIngestionError",
    "LLMError",
    "DatabaseError",
    "ValidationError",
    "ConfigurationError",
    "ErrorContext",
    "safe_execute",
    "safe_async_execute"
]