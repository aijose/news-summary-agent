"""
Error handling utilities for News Summary Agent.

This module provides custom exceptions, error handlers, and utilities
for managing errors throughout the application.
"""

import logging
from typing import Dict, Any, Optional, Union
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from datetime import datetime
import traceback


class NewsAgentException(Exception):
    """Base exception class for News Summary Agent."""

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ArticleProcessingError(NewsAgentException):
    """Exception raised during article processing."""
    pass


class VectorStoreError(NewsAgentException):
    """Exception raised during vector store operations."""
    pass


class RSSIngestionError(NewsAgentException):
    """Exception raised during RSS feed ingestion."""
    pass


class LLMError(NewsAgentException):
    """Exception raised during LLM operations."""
    pass


class DatabaseError(NewsAgentException):
    """Exception raised during database operations."""
    pass


class ValidationError(NewsAgentException):
    """Exception raised during data validation."""
    pass


class ConfigurationError(NewsAgentException):
    """Exception raised due to configuration issues."""
    pass


def create_error_response(
    status_code: int,
    message: str,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Create standardized error response.

    Args:
        status_code: HTTP status code
        message: Error message
        error_code: Optional error code
        details: Optional additional details

    Returns:
        JSONResponse with error information
    """
    error_data = {
        "error": {
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "status_code": status_code
        }
    }

    if error_code:
        error_data["error"]["error_code"] = error_code

    if details:
        error_data["error"]["details"] = details

    return JSONResponse(
        status_code=status_code,
        content=error_data
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions with standardized format.

    Args:
        request: FastAPI request object
        exc: HTTP exception

    Returns:
        Standardized error response
    """
    logger = logging.getLogger("src.error_handler")
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.url}")

    return create_error_response(
        status_code=exc.status_code,
        message=exc.detail,
        details={
            "path": str(request.url.path),
            "method": request.method
        }
    )


async def news_agent_exception_handler(
    request: Request,
    exc: NewsAgentException
) -> JSONResponse:
    """
    Handle custom NewsAgentException with detailed logging.

    Args:
        request: FastAPI request object
        exc: NewsAgentException

    Returns:
        Standardized error response
    """
    logger = logging.getLogger("src.error_handler")
    logger.error(
        f"NewsAgentException: {exc.message}",
        extra={
            'extra_data': {
                'error_code': exc.error_code,
                'details': exc.details,
                'path': str(request.url.path),
                'method': request.method
            }
        }
    )

    return create_error_response(
        status_code=500,
        message=exc.message,
        error_code=exc.error_code,
        details=exc.details
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions with logging.

    Args:
        request: FastAPI request object
        exc: Generic exception

    Returns:
        Standardized error response
    """
    logger = logging.getLogger("src.error_handler")
    logger.error(
        f"Unhandled exception: {str(exc)}",
        exc_info=True,
        extra={
            'extra_data': {
                'path': str(request.url.path),
                'method': request.method,
                'exception_type': type(exc).__name__
            }
        }
    )

    return create_error_response(
        status_code=500,
        message="An unexpected error occurred",
        error_code="INTERNAL_ERROR",
        details={
            "exception_type": type(exc).__name__
        }
    )


class ErrorContext:
    """Context manager for handling errors with additional context."""

    def __init__(
        self,
        operation: str,
        logger_name: str = "src.error_context",
        reraise: bool = True
    ):
        self.operation = operation
        self.logger = logging.getLogger(logger_name)
        self.reraise = reraise

    def __enter__(self):
        self.logger.debug(f"Starting operation: {self.operation}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.logger.error(
                f"Operation failed: {self.operation}",
                exc_info=True,
                extra={
                    'extra_data': {
                        'operation': self.operation,
                        'exception_type': exc_type.__name__ if exc_type else None,
                        'exception_message': str(exc_val) if exc_val else None
                    }
                }
            )

            if not self.reraise:
                return True  # Suppress the exception

        else:
            self.logger.debug(f"Operation completed successfully: {self.operation}")

        return False


def safe_execute(
    func,
    *args,
    default_return=None,
    logger_name: str = "src.safe_execute",
    **kwargs
):
    """
    Safely execute a function with error handling.

    Args:
        func: Function to execute
        *args: Function arguments
        default_return: Value to return on error
        logger_name: Logger name for error logging
        **kwargs: Function keyword arguments

    Returns:
        Function result or default_return on error
    """
    logger = logging.getLogger(logger_name)

    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(
            f"Error executing {func.__name__}: {str(e)}",
            exc_info=True,
            extra={
                'extra_data': {
                    'function': func.__name__,
                    'args': str(args),
                    'kwargs': str(kwargs)
                }
            }
        )
        return default_return


async def safe_async_execute(
    func,
    *args,
    default_return=None,
    logger_name: str = "src.safe_async_execute",
    **kwargs
):
    """
    Safely execute an async function with error handling.

    Args:
        func: Async function to execute
        *args: Function arguments
        default_return: Value to return on error
        logger_name: Logger name for error logging
        **kwargs: Function keyword arguments

    Returns:
        Function result or default_return on error
    """
    logger = logging.getLogger(logger_name)

    try:
        return await func(*args, **kwargs)
    except Exception as e:
        logger.error(
            f"Error executing {func.__name__}: {str(e)}",
            exc_info=True,
            extra={
                'extra_data': {
                    'function': func.__name__,
                    'args': str(args),
                    'kwargs': str(kwargs)
                }
            }
        )
        return default_return


def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """
    Validate that required fields are present in data.

    Args:
        data: Dictionary to validate
        required_fields: List of required field names

    Raises:
        ValidationError: If required fields are missing
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]

    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            error_code="MISSING_REQUIRED_FIELDS",
            details={"missing_fields": missing_fields}
        )


def validate_field_types(data: Dict[str, Any], field_types: Dict[str, type]) -> None:
    """
    Validate that fields have correct types.

    Args:
        data: Dictionary to validate
        field_types: Dictionary mapping field names to expected types

    Raises:
        ValidationError: If field types are incorrect
    """
    type_errors = []

    for field, expected_type in field_types.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], expected_type):
                type_errors.append(f"{field}: expected {expected_type.__name__}, got {type(data[field]).__name__}")

    if type_errors:
        raise ValidationError(
            f"Type validation errors: {'; '.join(type_errors)}",
            error_code="INVALID_FIELD_TYPES",
            details={"type_errors": type_errors}
        )


class RetryableError(Exception):
    """Exception that indicates an operation should be retried."""
    pass


def with_retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff_factor: float = 2.0,
    retryable_exceptions: tuple = (RetryableError,)
):
    """
    Decorator to retry function execution on specific exceptions.

    Args:
        max_attempts: Maximum number of retry attempts
        delay: Initial delay between retries
        backoff_factor: Factor to multiply delay after each attempt
        retryable_exceptions: Tuple of exceptions that should trigger retry

    Returns:
        Decorator function
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:  # Don't sleep on last attempt
                        import time
                        time.sleep(current_delay)
                        current_delay *= backoff_factor
                    continue
                except Exception as e:
                    # Non-retryable exception, raise immediately
                    raise e

            # If we get here, all retries failed
            raise last_exception

        return wrapper
    return decorator


# Error code constants
class ErrorCodes:
    """Standard error codes for the application."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    VECTOR_STORE_ERROR = "VECTOR_STORE_ERROR"
    RSS_INGESTION_ERROR = "RSS_INGESTION_ERROR"
    LLM_ERROR = "LLM_ERROR"
    ARTICLE_PROCESSING_ERROR = "ARTICLE_PROCESSING_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"