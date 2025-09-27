"""
News Summary Agent - FastAPI Application Entry Point

This module sets up the FastAPI application with all necessary middleware,
routers, and configuration for the News Summary Agent API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import engine, Base
from .api import articles, search, summaries

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(articles.router, prefix="/api/v1/articles", tags=["articles"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(summaries.router, prefix="/api/v1/summaries", tags=["summaries"])


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