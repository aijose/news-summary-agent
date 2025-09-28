"""
News Summary Agent - FastAPI Application Entry Point

This module sets up the FastAPI application with all necessary middleware,
routers, and configuration for the News Summary Agent API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import engine, Base
from .routers import articles
from .utils.logging_config import setup_logging, RequestLoggingMiddleware
from .utils.error_handling import (
    NewsAgentException,
    http_exception_handler,
    news_agent_exception_handler,
    generic_exception_handler
)

# Configure enhanced logging
setup_logging(
    log_level=settings.LOG_LEVEL,
    log_file="logs/news_agent.log",
    json_format=False
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting News Summary Agent API...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    yield

    # Shutdown
    logger.info("Shutting down News Summary Agent API...")


# Create FastAPI application
app = FastAPI(
    title="News Summary Agent API",
    description="Intelligent news aggregation and analysis with RAG capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Add exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(NewsAgentException, news_agent_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API routers
app.include_router(articles.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "News Summary Agent API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "news-summary-agent",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )