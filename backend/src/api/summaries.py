"""
Summary API endpoints for News Summary Agent.

This module provides article summarization capabilities using
Claude LLM with different summary lengths and styles.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Literal
from enum import Enum

from ..database import get_db, Article, Summary

router = APIRouter()


class SummaryLength(str, Enum):
    """Enumeration for summary length options."""
    SHORT = "short"      # ~50 words
    MEDIUM = "medium"    # ~150 words
    LONG = "long"        # ~300 words


@router.post("/article/{article_id}", response_model=dict)
async def summarize_article(
    article_id: int,
    length: SummaryLength = Query(SummaryLength.MEDIUM, description="Summary length"),
    force_regenerate: bool = Query(False, description="Force regenerate even if cached"),
    db: Session = Depends(get_db)
):
    """
    Generate or retrieve a summary for a specific article.

    Args:
        article_id: Unique identifier for the article
        length: Desired summary length (short, medium, long)
        force_regenerate: Whether to regenerate summary even if cached
        db: Database session

    Returns:
        Article summary with metadata and confidence score

    Raises:
        HTTPException: If article is not found
    """
    # Check if article exists
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Check for existing summary in cache
    if not force_regenerate:
        existing_summary = (
            db.query(Summary)
            .filter(Summary.article_id == article_id, Summary.summary_type == length.value)
            .first()
        )
        if existing_summary:
            return {
                "article_id": article_id,
                "summary": existing_summary.to_dict(),
                "article_title": article.title,
                "article_source": article.source,
                "cached": True
            }

    # TODO: Implement Claude LLM summarization
    # For now, return a placeholder response
    placeholder_summary = {
        "id": None,
        "article_id": article_id,
        "summary_type": length.value,
        "summary_text": f"This is a placeholder {length.value} summary for article: {article.title[:100]}...",
        "word_count": 50 if length == SummaryLength.SHORT else 150 if length == SummaryLength.MEDIUM else 300,
        "confidence_score": 85,
        "created_at": None,
        "updated_at": None
    }

    return {
        "article_id": article_id,
        "summary": placeholder_summary,
        "article_title": article.title,
        "article_source": article.source,
        "cached": False,
        "message": "LLM summarization not yet implemented - placeholder summary returned"
    }


@router.post("/multi-article/", response_model=dict)
async def summarize_multiple_articles(
    article_ids: List[int],
    length: SummaryLength = Query(SummaryLength.MEDIUM, description="Summary length"),
    synthesis_style: Literal["individual", "comparative", "unified"] = Query(
        "individual", description="How to combine multiple article summaries"
    ),
    db: Session = Depends(get_db)
):
    """
    Generate summaries for multiple articles with optional synthesis.

    Args:
        article_ids: List of article IDs to summarize
        length: Desired summary length for each article
        synthesis_style: How to present multiple summaries
        db: Database session

    Returns:
        Multiple article summaries with optional synthesis

    Note:
        This is a placeholder implementation. Full multi-article
        summarization will be implemented with Claude integration.
    """
    if len(article_ids) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 articles allowed for multi-article summarization"
        )

    # Check if all articles exist
    articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
    found_ids = {article.id for article in articles}
    missing_ids = set(article_ids) - found_ids

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Articles not found: {list(missing_ids)}"
        )

    # TODO: Implement multi-article summarization with synthesis
    placeholder_summaries = [
        {
            "article_id": article.id,
            "article_title": article.title,
            "article_source": article.source,
            "summary": f"Placeholder {length.value} summary for {article.title[:50]}...",
            "word_count": 50 if length == SummaryLength.SHORT else 150 if length == SummaryLength.MEDIUM else 300
        }
        for article in articles
    ]

    result = {
        "articles": placeholder_summaries,
        "synthesis_style": synthesis_style,
        "total_articles": len(articles),
        "message": "Multi-article summarization not yet implemented"
    }

    if synthesis_style == "unified":
        result["unified_summary"] = "Placeholder unified summary combining all articles..."
    elif synthesis_style == "comparative":
        result["comparison"] = "Placeholder comparative analysis of different perspectives..."

    return result


@router.get("/cached/{article_id}", response_model=List[dict])
async def get_cached_summaries(
    article_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve all cached summaries for a specific article.

    Args:
        article_id: Unique identifier for the article
        db: Database session

    Returns:
        List of all cached summaries for the article

    Raises:
        HTTPException: If article is not found
    """
    # Check if article exists
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Get all cached summaries for this article
    summaries = (
        db.query(Summary)
        .filter(Summary.article_id == article_id)
        .order_by(Summary.created_at.desc())
        .all()
    )

    return [summary.to_dict() for summary in summaries]