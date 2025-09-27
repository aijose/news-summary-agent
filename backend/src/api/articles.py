"""
Article API endpoints for News Summary Agent.

This module provides REST API endpoints for article management,
including retrieval, search, and metadata operations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db, Article
from ..models import Article as ArticleModel

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_articles(
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of articles to return"),
    source: Optional[str] = Query(None, description="Filter by news source"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of articles with optional filtering.

    Args:
        skip: Number of articles to skip for pagination
        limit: Maximum number of articles to return
        source: Optional filter by news source
        db: Database session

    Returns:
        List of articles with metadata
    """
    query = db.query(Article)

    if source:
        query = query.filter(Article.source.ilike(f"%{source}%"))

    articles = query.order_by(Article.published_date.desc()).offset(skip).limit(limit).all()

    return [article.to_dict() for article in articles]


@router.get("/{article_id}", response_model=dict)
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific article by ID.

    Args:
        article_id: Unique identifier for the article
        db: Database session

    Returns:
        Article details with full content and metadata

    Raises:
        HTTPException: If article is not found
    """
    article = db.query(Article).filter(Article.id == article_id).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article.to_dict()


@router.get("/by-url/", response_model=dict)
async def get_article_by_url(
    url: str = Query(..., description="Article URL"),
    db: Session = Depends(get_db)
):
    """
    Retrieve an article by its URL.

    Args:
        url: The original article URL
        db: Database session

    Returns:
        Article details

    Raises:
        HTTPException: If article is not found
    """
    article = db.query(Article).filter(Article.url == url).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article.to_dict()


@router.get("/sources/", response_model=List[dict])
async def get_sources(db: Session = Depends(get_db)):
    """
    Get a list of all news sources with article counts.

    Args:
        db: Database session

    Returns:
        List of sources with article counts and metadata
    """
    # Query to get source statistics
    from sqlalchemy import func

    source_stats = (
        db.query(
            Article.source,
            func.count(Article.id).label('article_count'),
            func.max(Article.published_date).label('latest_article'),
            func.min(Article.published_date).label('earliest_article')
        )
        .group_by(Article.source)
        .order_by(func.count(Article.id).desc())
        .all()
    )

    return [
        {
            "source": stat.source,
            "article_count": stat.article_count,
            "latest_article": stat.latest_article.isoformat() if stat.latest_article else None,
            "earliest_article": stat.earliest_article.isoformat() if stat.earliest_article else None
        }
        for stat in source_stats
    ]