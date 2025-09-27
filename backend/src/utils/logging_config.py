"""
Logging configuration for News Summary Agent.

This module provides centralized logging configuration with proper
formatting, handlers, and log levels for different components.
"""

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Optional
import json
from datetime import datetime

from ..config import settings


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""

    def format(self, record):
        """Format log record as JSON."""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }

        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)

        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_entry.update(record.extra_data)

        return json.dumps(log_entry)


def setup_logging(
    log_level: str = None,
    log_file: Optional[str] = None,
    json_format: bool = False,
    max_file_size: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
) -> None:
    """
    Setup comprehensive logging configuration.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
        json_format: Whether to use JSON formatting
        max_file_size: Maximum log file size before rotation
        backup_count: Number of backup files to keep
    """
    # Use settings default if not provided
    log_level = log_level or settings.LOG_LEVEL

    # Convert string level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Clear any existing handlers
    logging.getLogger().handlers.clear()

    # Create formatters
    if json_format:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(numeric_level)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    root_logger.addHandler(console_handler)

    # File handler if specified
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_file_size,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(numeric_level)
        root_logger.addHandler(file_handler)

    # Configure specific loggers
    configure_component_loggers(numeric_level)

    logging.info(f"Logging configured with level: {log_level}")


def configure_component_loggers(level: int) -> None:
    """Configure logging for specific components."""

    # Reduce verbosity of external libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)

    # Configure application loggers
    app_loggers = [
        "src.services.rss_ingestion",
        "src.services.article_processing",
        "src.services.vector_store",
        "src.services.langchain_agent",
        "src.routers.articles",
        "src.database",
        "src.main"
    ]

    for logger_name in app_loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)


class LoggingMixin:
    """Mixin class to add logging capabilities to any class."""

    @property
    def logger(self) -> logging.Logger:
        """Get logger for this class."""
        return logging.getLogger(f"{self.__class__.__module__}.{self.__class__.__name__}")

    def log_info(self, message: str, **kwargs) -> None:
        """Log info message with optional extra data."""
        extra = {'extra_data': kwargs} if kwargs else {}
        self.logger.info(message, extra=extra)

    def log_warning(self, message: str, **kwargs) -> None:
        """Log warning message with optional extra data."""
        extra = {'extra_data': kwargs} if kwargs else {}
        self.logger.warning(message, extra=extra)

    def log_error(self, message: str, exc_info: bool = False, **kwargs) -> None:
        """Log error message with optional extra data."""
        extra = {'extra_data': kwargs} if kwargs else {}
        self.logger.error(message, exc_info=exc_info, extra=extra)

    def log_debug(self, message: str, **kwargs) -> None:
        """Log debug message with optional extra data."""
        extra = {'extra_data': kwargs} if kwargs else {}
        self.logger.debug(message, extra=extra)


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the specified name."""
    return logging.getLogger(name)


class RequestLoggingMiddleware:
    """Middleware for logging HTTP requests and responses."""

    def __init__(self, app):
        self.app = app
        self.logger = logging.getLogger("src.middleware.request_logging")

    async def __call__(self, scope, receive, send):
        """Process request and response logging."""
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = datetime.utcnow()
        request_id = id(scope)  # Simple request ID

        # Log request
        self.logger.info(
            f"Request started",
            extra={
                'extra_data': {
                    'request_id': request_id,
                    'method': scope["method"],
                    'path': scope["path"],
                    'query_string': scope.get("query_string", b"").decode(),
                    'client': scope.get("client", ["unknown", 0])[0]
                }
            }
        )

        async def send_wrapper(message):
            """Wrapper to log response."""
            if message["type"] == "http.response.start":
                end_time = datetime.utcnow()
                duration = (end_time - start_time).total_seconds()

                self.logger.info(
                    f"Request completed",
                    extra={
                        'extra_data': {
                            'request_id': request_id,
                            'status_code': message["status"],
                            'duration_seconds': duration
                        }
                    }
                )

            await send(message)

        await self.app(scope, receive, send_wrapper)


def log_performance(func_name: str, duration: float, **kwargs) -> None:
    """Log performance metrics for a function."""
    logger = logging.getLogger("src.performance")
    logger.info(
        f"Performance: {func_name}",
        extra={
            'extra_data': {
                'function': func_name,
                'duration_seconds': duration,
                **kwargs
            }
        }
    )


def log_business_event(event_type: str, event_data: dict) -> None:
    """Log business events for analytics."""
    logger = logging.getLogger("src.business_events")
    logger.info(
        f"Business Event: {event_type}",
        extra={
            'extra_data': {
                'event_type': event_type,
                'timestamp': datetime.utcnow().isoformat(),
                **event_data
            }
        }
    )